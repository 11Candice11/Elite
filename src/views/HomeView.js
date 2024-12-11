import { LitElement, html, css } from 'lit';
import { ClientProfileService } from '/src/services/ClientProfileService.js';
import { SharedState } from '/src/state/SharedState.js';
import { store } from '/src/store/EliteStore.js';
import { router } from '/src/shell/Routing.js'

class HomeView extends LitElement {
  static styles = css`
    .container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      padding: 20px;
      position: relative; /* For canvas overlay */
    }
    .section {
      border: 1px solid #ccc;
      padding: 15px;
      border-radius: 5px;
      background: #f9f9f9;
    }
    .section h3 {
      margin-top: 0;
    }
    input {
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #ccc;
      border-radius: 5px;
      width: 100%;
    }
    button {
      margin-top: 10px;
      padding: 10px;
      border: none;
      background-color: #007bff;
      color: white;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
    .myCanvas {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      pointer-events: none;
    }
  `;

  static properties = {
    clientInfo: { type: Object },
    detailModels: { type: Array },
    searchID: { type: String },
  };

  constructor() {
    super();
    this.clientInfo = {};
    this.detailModels = [];
    this.searchID = '5409225033081';
    this.clientService = new ClientProfileService();
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchData();
  }

  firstUpdated() {
    super.firstUpdated();
    this.initCanvas();
  }

  async fetchData() {
    const request = {
      TransactionDateStart: "2021-02-03T00:00:00+02:00",
      TransactionDateEnd: "2022-08-03T00:00:00+02:00",
      TargetCurrencyL: 170,
      ValueDates: [
        "2021-03-31T00:00:00",
        "2021-06-01T00:00:00",
        "2022-08-02T14:51:42.3532002+02:00"
      ],
      InputEntityModels: [
        {
          SouthAfricanIdNumber: this.searchID,
          PassportNumber: "",
          RegistrationNumber: ""
        }
      ]
    };
    const response = await this.clientService.getClientProfile(request);
    const entity = response.entityModels[0];

    this.clientInfo = {
      firstName: entity.firstNames,
      surname: entity.surname,
      registeredName: entity.registeredName,
      title: entity.title,
      nickname: entity.nickname,
      advisorName: entity.advisorName,
      email: entity.email,
      cellPhone: entity.cellPhoneNumber,
      idNumber: request.InputEntityModels[0]?.SouthAfricanIdNumber,
    };
    this.detailModels = entity.detailModels;

    store.set('clientInfo', { entity });

    // Store transactions in shared state
    SharedState.transactions = this.detailModels[0]?.transactionModels || [];
  }

  initCanvas() {
    const canvas = this.shadowRoot.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const stars = [];
    const numStars = 100;

    canvas.width = this.shadowRoot.querySelector('.container').clientWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        dx: Math.random() * 0.5 - 0.25,
        dy: Math.random() * 0.5 - 0.25,
      });
    }

    function drawStars() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      for (let star of stars) {
        ctx.fillStyle = 'white';
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        star.x += star.dx;
        star.y += star.dy;

        if (star.x < 0 || star.x > canvas.width) star.dx = -star.dx;
        if (star.y < 0 || star.y > canvas.height) star.dy = -star.dy;
      }
    }

    function animate() {
      drawStars();
      requestAnimationFrame(animate);
    }

    animate();
  }

  handleSearchIDChange(event) {
    this.searchID = event.target.value;
  }

  searchByID() {
    this.fetchData();
  }

  renderClientInfo() {
    const { firstName, surname, registeredName, title, nickname, advisorName, email, cellPhone } = this.clientInfo;
    return html`
      <div class="section">
        <h3>Client Information</h3>
        <p><strong>First Name:</strong> ${firstName || 'N/A'}</p>
        <p><strong>Surname:</strong> ${surname || 'N/A'}</p>
        <p><strong>Registered Name:</strong> ${registeredName || 'N/A'}</p>
        <p><strong>Title:</strong> ${title || 'N/A'}</p>
        <p><strong>Nickname:</strong> ${nickname || 'N/A'}</p>
        <p><strong>Advisor Name:</strong> ${advisorName || 'N/A'}</p>
        <p><strong>Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Cell Phone:</strong> ${cellPhone || 'N/A'}</p>
      </div>
    `;
  }

  render() {
    return html`
      <canvas class="myCanvas" id="canvas"></canvas>
      <div class="container">
        <input
          type="text"
          placeholder="Search by South African ID"
          @input="${this.handleSearchIDChange}"
        />
        <button @click="${this.searchByID}">Search</button>
        ${this.renderClientInfo()}
        <button @click="${this.navigateToTransactions}">Transactions</button>
        <button @click="${this.navigateToPortfolio}">Portfolio</button>
        <button @click="${this.navigateToClientInformation}">Client Information</button>
        </div>
    `;
  }
}

customElements.define('home-view', HomeView);