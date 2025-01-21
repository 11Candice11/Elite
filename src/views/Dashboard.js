import { LitElement, html, css } from 'lit';
import { ClientProfileService } from '/src/services/ClientProfileService.js'; // Replace with your actual service path
import { router } from '/src/shell/Routing.js';
import userIcon from '/src/images/user.png';

class Dashboard extends LitElement {
    static styles = css`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background-color: #007bff;
      color: #fff;
    }
    .search-section {
      display: flex;
      gap: 10px;
      margin: 20px 0;
    }
    .search-section input {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      width: 300px;
    }
    .search-section button {
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .client-card {
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }
    .client-card-header {
      display: flex;
      align-items: center;
      background-color: #007bff;
      color: white;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      padding: 10px;
    }
    .client-card-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      margin-right: 15px;
    }
    .client-card-content {
      padding: 20px;
      font-size: 16px;
      line-height: 1.5;
    }
    .client-card-content p {
      margin: 10px 0;
      color: black;
    }
    .client-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 15px 20px;
      border-top: 1px solid #ddd;
    }
    .client-card-actions button {
      padding: 10px 15px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }
    .client-card-actions button:hover {
      background-color: #0056b3;
    }
  `;

  static properties = {
    searchID: { type: String },
    transactionDateStart: { type: String },
    transactionDateEnd: { type: String },
    clientInfo: { type: Object },
    isClientSelected: { type: Boolean },
  };

  constructor() {
    super();
    this.searchID = '';
    this.transactionDateStart = this.formatDateToISO(new Date(new Date().setMonth(new Date().getMonth() - 3)));
    this.transactionDateEnd = this.formatDateToISO(new Date());
    this.clientInfo = null;
    this.isClientSelected = false;
    this.clientService = new ClientProfileService();
  }

  formatDateToISO(date) {
    return `${date.toISOString().split('T')[0]}T00:00:00+02:00`;
  }

  async fetchClientData() {
    if (!this.searchID) {
      alert('Please enter a client ID');
      return;
    }

    const request = {
      TransactionDateStart: this.transactionDateStart,
      TransactionDateEnd: this.transactionDateEnd,
      TargetCurrencyL: 170,
      ValueDates: [],
      InputEntityModels: [
        {
          SouthAfricanIdNumber: this.searchID,
        },
      ],
    };

    try {
      const response = await this.clientService.getClientProfile(request);

      if (response?.entityModels?.length) {
        const entity = response.entityModels[0];
        this.clientInfo = {
          firstNames: entity.firstNames || 'N/A',
          surname: entity.surname || 'N/A',
          email: entity.email || 'N/A',
          advisorName: entity.advisorName || 'N/A',
        };
        this.isClientSelected = true;
      } else {
        this.clientInfo = null;
        this.isClientSelected = false;
        alert('Client not found');
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
      alert('An error occurred while fetching client data.');
    }
  }

  renderClientCard() {
    return html`
      <div class="client-card">
        <div class="client-card-header">
          <img src="${userIcon}" alt="User Icon" class="client-card-icon" />
          <h3>${this.clientInfo.firstNames} ${this.clientInfo.surname}</h3>
        </div>
        <div class="client-card-content">
          <p><strong>Title:</strong> ${this.clientInfo.title}</p>
          <p><strong>Email:</strong> ${this.clientInfo.email}</p>
          <p><strong>Advisor:</strong> ${this.clientInfo.advisorName}</p>
        </div>
        <div class="client-card-actions">
          <button @click="${() => this.navigateTo('transactions')}">Transactions</button>
          <button @click="${() => this.navigateTo('portfolio')}">Portfolios</button>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div>
        <header class="header">
          <h1>Dashboard</h1>
          <button @click="${this.logout}">Logout</button>
        </header>

        <div class="search-section">
          <input
            type="text"
            placeholder="Search by ID"
            .value="${this.searchID}"
            @input="${(e) => (this.searchID = e.target.value)}"
          />
          <button @click="${this.fetchClientData}">Search</button>
        </div>

        ${this.isClientSelected
          ? this.renderClientCard()
          : html`<p>Please search for a client to display details.</p>`}
      </div>
    `;
  }


  navigateTo(tabName) {
    router.navigate(`/${tabName}`);
  }

  logout() {
    window.location.href = '/logout';
  }
}

customElements.define('dashboard-view', Dashboard);