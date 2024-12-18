import { LitElement, html, css } from 'lit';
import { router } from '/src/shell/Routing.js';
import { ClientProfileService } from '/src/services/ClientProfileService.js';
import { store } from '/src/store/EliteStore.js';
import background from '/src/images/home.png';
import user from '/src/images/user.png';
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
    .client-card h3 {
      margin-bottom: 15px;
    }
    .client-card p {
      margin: 5px 0;
      font-size: 14px;
    }
    .client-card ul {
      list-style: none; /* Remove dots */
      padding: 0;
      margin: 0;
    }
    
    .client-card li {
      margin: 5px 0;
      font-size: 14px;
      color: black; /* Make the text black */
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
    h4{
      color: black;
    }
  `;

  static properties = {
    searchID: { type: String },
    transactionDateStart: { type: String },
    transactionDateEnd: { type: String },
    isSearched: { type: Boolean },
    clientInfo: { type: Object },
    appointmentFrequency: { type: Number }, // Store selected frequency
  };

  constructor() {
    super();
    this.searchID = store.get('searchID') || '';
    this.appointmentFrequency = 6; // Default to 6 months
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

  handleFrequencyChange(event) {
    this.appointmentFrequency = parseInt(event.target.value, 10);
  }
  
  calculateAppointments() {
    const today = new Date();
    const appointments = [];
    for (let i = 1; i <= 4; i++) {
      const appointmentDate = new Date(today);
      appointmentDate.setMonth(today.getMonth() + this.appointmentFrequency * i);
      appointments.push(appointmentDate);
    }
    return appointments;
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
        </header>
        <div class="hero"
        style="background-image: url(${background}); background-size: cover; background-position: center; height: 700px;">
          <h2>Find your client</h2>
          <div class="search-section">
            <input
              type="text"
              placeholder="Search by ID"
              .value="${this.searchID}"
              @input="${(e) => (this.searchID = e.target.value)}"
            />
            <button @click="${this.fetchData}">Search</button>
          </div>
          <div class="filter-buttons">
  <label>
    <input
      type="radio"
      name="appointment-frequency"
      value="1"
      @change="${this.handleFrequencyChange}"
    />
    1 Month
  </label>
  <label>
    <input
      type="radio"
      name="appointment-frequency"
      value="3"
      @change="${this.handleFrequencyChange}"
    />
    3 Months
  </label>
  <label>
    <input
      type="radio"
      name="appointment-frequency"
      value="6"
      checked
      @change="${this.handleFrequencyChange}"
    />
    6 Months
  </label>
  <label>
    <input
      type="radio"
      name="appointment-frequency"
      value="12"
      @change="${this.handleFrequencyChange}"
    />
    12 Months
  </label>
</div>
          ${this.clientInfo && this.clientInfo.firstNames
          ? html`${this.renderClientCard()}`
          : html``}
          </div>
        </div>
    `;
  }
  renderClientCard() {
    const appointments = this.calculateAppointments();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  
    return html`
      <div class="client-card">
        <div class="client-card-header">
          <img src="${user}" alt="User Icon" class="client-card-icon" />
          <h3>${this.clientInfo.firstNames} ${this.clientInfo.surname}</h3>
        </div>
        <div class="client-card-content">
          <p><strong>Title:</strong> ${this.clientInfo.title}</p>
          <p><strong>Registered Name:</strong> ${this.clientInfo.registeredName}</p>
          <p><strong>Nickname:</strong> ${this.clientInfo.nickname}</p>
          <p><strong>Advisor Name:</strong> ${this.clientInfo.advisorName}</p>
          <p><strong>Email:</strong> ${this.clientInfo.email}</p>
          <p><strong>Cell Phone Number:</strong> ${this.clientInfo.cellPhoneNumber}</p>
          <div>
            <h4>Next Appointments:</h4>
            <ul>
              ${appointments.map(
                (date) => html`<li>${formatter.format(date)}</li>`
              )}
            </ul>
          </div>
        </div>
        <div class="client-card-actions">
          <button @click="${() => this.handleTabNavigation('transactions')}">Transactions</button>
          <button @click="${() => this.handleTabNavigation('products')}">Portfolios</button>
        </div>
      </div>
    `;
  }
}

customElements.define('home-view', HomeView);