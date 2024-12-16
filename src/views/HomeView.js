import { LitElement, html, css } from 'lit';
import { router } from '/src/shell/Routing.js';
import { ClientProfileService } from '/src/services/ClientProfileService.js';
import { store } from '/src/store/EliteStore.js';
import background from '/src/images/home.png';
import { ViewBase } from './common/ViewBase.js';


class HomeView extends ViewBase {
  static styles = css`
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    .client-card {
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-top: 20px;
      max-width: 400px;
    }
    .client-card h3 {
      margin-bottom: 15px;
    }
    .client-card p {
      margin: 5px 0;
      font-size: 14px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background-color: #333;
      color: #fff;
    }
    .tabs {
      display: flex;
      gap: 15px;
    }
    .tabs button {
      background: none;
      border: none;
      color: #fff;
      font-size: 16px;
      cursor: pointer;
    }
    .tabs button:hover {
      text-decoration: underline;
    }
    .hero {
      position: relative;
      background-size: cover;
      background-position: center;
      height: 400px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      color: #fff;
      padding: 20px;
    }
    .search-section {
      display: flex;
      gap: 10px;
      margin-top: 20px;
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
    .search-section button:hover {
      background-color: #0056b3;
    }
    .filter-buttons {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .hidden-info {
      display: none;
      padding: 20px;
    }
    .hidden-info.active {
      display: block;
    }
  `;

  static properties = {
    searchID: { type: String },
    transactionDateStart: { type: String },
    transactionDateEnd: { type: String },
    isSearched: { type: Boolean },
    clientInfo: { type: Object },
  };

  constructor() {
    super();
    this.searchID = store.get('searchID') || '';
    this.transactionDateStart = this.formatDateToISO(new Date(new Date().setMonth(new Date().getMonth() - 3)));
    this.transactionDateEnd = this.formatDateToISO(new Date());
    this.clientInfo = store.get('clientInfo') ||  {};
    this.clientService = new ClientProfileService();
    this.initClientInfo();
  }

  initClientInfo() {
    const entity = store.get('clientInfo');
    if (!entity) {
      return;
    }
this.clientInfo = {
  firstNames: entity.firstNames || 'N/A',
  surname: entity.surname || 'N/A',
  registeredName: entity.registeredName || 'N/A',
  title: entity.title || 'N/A',
  nickname: entity.nickname || 'N/A',
  advisorName: entity.advisorName || 'N/A',
  email: entity.email || 'N/A',
  cellPhoneNumber: entity.cellPhoneNumber || 'N/A',
};
  }

  formatDateToISO(date) {
    return `${date.toISOString().split('T')[0]}T00:00:00+02:00`;
  }

  applyPreSelectedDateRange(months) {
    const today = new Date();
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - months);
    this.transactionDateStart = this.formatDateToISO(startDate);
    this.transactionDateEnd = this.formatDateToISO(today);
  }

  async fetchData() {
    const searched = store.get('searchID') === this.searchID;
    if (searched) {
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

    store.set('searchID', this.searchID);

    try {
      const response = await this.clientService.getClientProfile(request);

      if(!response?.entityModels[0]){
        return null;
      }

      const entity = response.entityModels[0];
      console.log('Fetched Data:', response); // For debugging
      this.clientInfo = {
        firstNames: entity.firstNames || 'N/A',
        surname: entity.surname || 'N/A',
        registeredName: entity.registeredName || 'N/A',
        title: entity.title || 'N/A',
        nickname: entity.nickname || 'N/A',
        advisorName: entity.advisorName || 'N/A',
        email: entity.email || 'N/A',
        cellPhoneNumber: entity.cellPhoneNumber || 'N/A',
      };
      store.set('clientInfo', entity);
      } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  handleTabNavigation(tabName) {
    router.navigate(`/${tabName}`);
  }

  generateReport() {
    window.alert("Generating report...");
  }

  render() {
    return html`
      <div>
        <header class="header">
          <h1>Elite</h1>
          <div class="tabs">
            <!-- <button @click="${() => this.handleTabNavigation('portfolio')}">Portfolio</button> -->
            <button @click="${() => this.handleTabNavigation('transactions')}">Transactions</button>
            <button @click="${() => this.handleTabNavigation('products')}">Product Info</button>
          </div>
        </header>
        <div class="hero"
        style="background-image: url(${background}); background-size: cover; background-position: center; height: 400px;">
          <h2>Find your client</h2>
          <div class="search-section">
            <input
              type="text"
              placeholder="Search by ID"
              .value="${this.searchID}"
              @input="${(e) => (this.searchID = e.target.value)}"
            />
            <input
              type="date"
              .value="${this.transactionDateStart.split('T')[0]}"
              @change="${(e) => (this.transactionDateStart = this.formatDateToISO(new Date(e.target.value)))}"
            />
            <input
              type="date"
              .value="${this.transactionDateEnd.split('T')[0]}"
              @change="${(e) => (this.transactionDateEnd = this.formatDateToISO(new Date(e.target.value)))}"
            />
            <button @click="${this.fetchData}">Search</button>
          </div>
          <div class="filter-buttons">
            <button @click="${() => this.applyPreSelectedDateRange(3)}">3 Months</button>
            <button @click="${() => this.applyPreSelectedDateRange(6)}">6 Months</button>
            <button @click="${() => this.applyPreSelectedDateRange(9)}">9 Months</button>
            <button @click="${() => this.applyPreSelectedDateRange(12)}">12 Months</button>
          </div>
        </div>
          <h3>Client Information</h3>
          ${!this.isNullOrEmpty(this.clientInfo?.firstNames)
            ? html`
              <button @click="${() => this.generateReport()}">Generate report</button>
              <p><strong>Title:</strong> ${this.clientInfo.title}</p>
              <p><strong>First Name:</strong> ${this.clientInfo.firstNames}</p>
              <p><strong>Surname:</strong> ${this.clientInfo.surname}</p>
              <p><strong>Registered Name:</strong> ${this.clientInfo.registeredName}</p>
              <p><strong>Nickname:</strong> ${this.clientInfo.nickname}</p>
              <p><strong>Advisor Name:</strong> ${this.clientInfo.advisorName}</p>
              <p><strong>Email:</strong> ${this.clientInfo.email}</p>
              <p><strong>Cell Phone Number:</strong> ${this.clientInfo.cellPhoneNumber}</p>
              `
            : html`<p>No client information found.</p>`}
      </div>
    `;
  }
}

customElements.define('home-view', HomeView);