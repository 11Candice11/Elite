import { LitElement, html, css } from 'lit';
import { router } from '/src/shell/Routing.js';
import { ClientProfileService } from '/src/services/ClientProfileService.js';
import { store } from '/src/store/EliteStore.js';
import background from '/src/images/home.png';
import logo from '/src/images/page-Logo-full.png';  // Ensure the logo path is correct
import user from '/src/images/user.png';
import { ViewBase } from './common/ViewBase.js';
import { PdfMixin } from '/src/views/mixins/PDFMixin.js';

class HomeView extends ViewBase {
  static styles = [
    ViewBase.styles,
    css`
/* Global Styles */
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: rgb(200, 200, 200); /* Light background */
}

/* Header Styling */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 30px;
  background: linear-gradient(90deg, rgb(0, 50, 100), rgb(50, 100, 150));
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

h2{
  color: black;
}

.header img {
  height: 50px;
}

.tabs {
  display: flex;
  gap: 20px;
}

.tabs button {
  background: none;
  border: none;
  color: black;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  padding: 10px;
  transition: all 0.3s ease;
}

.tabs button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

/* Hero Section */
.hero {
  position: relative; /* Needed for absolute positioning of watermark */
  padding: 50px 20px;
  text-align: center;
  overflow: hidden; /* Hide any overflow from watermark */
  height: 700px;
}

/* Watermark Styling */
.watermark {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%); /* Center the watermark */
  opacity: 0.05; /* Faded effect */
  z-index: 1; /* Behind the content */
  pointer-events: none; /* Ensure it's non-interactive */
}

.watermark img {
  max-width: 80%; /* Responsive size */
  height: auto;
}

/* Ensure content appears above the watermark */
.hero h2,
.search-section {
  position: relative;
  z-index: 2; /* Content stays above the watermark */
}

/* Search Section */
.search-section {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.search-section input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 300px;
  outline: none;
  transition: border 0.3s ease;
}

.search-section input:focus {
  border: 2px solid rgb(0, 50, 100);
}

.search-section button {
  background-color: rgb(0, 50, 100);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-section button:hover {
  background-color: rgb(50, 100, 150);
}

/* Client Card Animation */
.client-card {
  background: rgb(215, 180, 120);
  border-radius: 8px;
  max-width: 420px;
  margin: 20px auto;
  padding: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-50px);
  opacity: 0;
  transition: all 0.6s ease;
}

.client-card.visible {
  transform: translateY(0);
  opacity: 1;
}

/* Client Card Header */
.client-card-header {
  background: rgb(0, 50, 100);
  color: white;
  padding: 15px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
}

.client-card-header img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

/* Client Card Content */
.client-card-content {
  padding: 15px;
  color: black;
  background-color: rgb(200, 200, 200);
  border-radius: 0 0 8px 8px;
}

.client-card-content p {
  margin: 8px 0;
  font-size: 14px;
  color: black;
  line-height: 1.5;
}

/* Client Card Buttons */
.client-card-actions {
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background-color: rgb(140, 120, 80);
  border-radius: 0 0 8px 8px;
}

.client-card-actions button {
  background-color: rgb(215, 180, 120);
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  height: 50px;
  font-size: 13px;
  width: 120px;
}

.client-card-actions button:hover {
  background-color: rgb(140, 120, 80);
}

/* Footer (Optional) */
.footer {
  background: rgb(0, 50, 100);
  color: white;
  padding: 10px 20px;
  text-align: center;
  font-size: 14px;
}
ul {
  list-style: none;  /* Removes bullet points */
  padding: 0;        /* Removes default padding */
  margin: 0;         /* Removes default margin */
}

li {
  margin: 5px 0;     /* Adds spacing between list items */
  font-size: 14px;   /* Optional: Adjust font size */
  color: black;      /* Optional: Set text color */
}
/* Overlay for dimming the background */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Dialog Container */
.dialog-content {
  background: white;
  border-radius: 12px;
  width: 400px;
  padding: 25px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  border: 2px solid rgb(0, 50, 100);
  animation: fadeIn 0.4s ease-in-out;
}

/* Dialog Heading */
.dialog-content h3 {
  color: rgb(0, 50, 100);
  margin-bottom: 20px;
  font-size: 20px;
  text-align: center;
}

/* Options Section */
.dialog-options label {
  display: flex;
  align-items: center;
  margin: 10px 0;
  font-weight: bold;
  color: black;
}

.dialog-options input[type="checkbox"] {
  margin-right: 10px;
  accent-color: rgb(0, 50, 100); /* Checkbox color */
}

/* IRR Input Styling */
.dialog-options input[type="number"] {
  width: 70px;
  padding: 5px;
  margin-left: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border 0.3s ease;
}

.dialog-options input[type="number"]:focus {
  border-color: rgb(0, 50, 100);
}

/* Action Buttons */
.dialog-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.dialog-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

/* Portfolio Card Container */
.portfolio-list {
  display: grid;
  grid-template-columns: 1fr; /* Stack cards vertically */
  gap: 15px;
  margin-bottom: 20px;
}

/* Portfolio Card Styling */
.portfolio-card {
  background: rgb(215, 180, 120);
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease;
  border: 2px solid transparent;
}

.portfolio-card:hover {
  background: rgb(140, 120, 80);
  transform: translateY(-5px); /* Slight lift effect on hover */
  color: white;
  border: 2px solid rgb(0, 50, 100);
}

/* Portfolio Card Content */
.portfolio-card h4 {
  margin: 0 0 10px;
  font-size: 18px;
  color: black;
}

.portfolio-card p {
  margin: 5px 0;
  font-size: 14px;
  color: black;
}

/* Cancel Button */
.cancel-btn {
  background-color: rgb(200, 200, 200);
  color: black;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: rgb(180, 180, 180);
}

/* Generate Report Button */
.generate-btn {
  background-color: rgb(0, 50, 100);
  color: white;
}

.generate-btn:hover {
  background-color: rgb(50, 100, 150);
}

/* Fade-in Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .header, .hero, .client-card {
    padding: 15px;
  }

  .search-section input {
    width: 80%;
  }

  .tabs button {
    font-size: 14px;
  }
  .hero-logo {
    width: 100px;
    opacity: 0.1; /* Faint watermark effect */
    position: absolute;
    top: 20px;
    right: 20px;
  }
}
  `];

  static properties = {
    searchID: { type: String },
    transactionDateStart: { type: String },
    transactionDateEnd: { type: String },
    isSearched: { type: Boolean },
    clientInfo: { type: Object },
    isVisible: { type: Boolean },
    appointmentFrequency: { type: Number }, // Store selected frequency
    reportOptions: { type: Object },
    showDialog: { type: Boolean },
    showDetailModelsDialog: { type: Boolean },
    selectedDetailModel: { type: Object }
  };

  constructor() {
    super();
    this.searchID = store.get('searchID') || '';
    this.appointmentFrequency = 6; // Default to 6 months
    this.transactionDateStart = this.formatDateToISO(new Date(new Date().setMonth(new Date().getMonth() - 3)));
    this.transactionDateEnd = this.formatDateToISO(new Date());
    this.clientInfo = store.get('clientInfo') || {};
    this.showDialog = false;
    this.showDetailModelsDialog = false;
    this.selectedDetailModel = null;

    this.reportOptions = {
      contributions: true,
      withdrawals: true,
      regularWithdrawals: true,
      includePercentage: false,
      netWithdrawal: false,
      netWithdrawalValue: 0,
      switches: true,
      performanceChart: true,
      excludeGrowth: false,
      irr: 7.0,
      vested: true,
      groupFunds: true,
    };
    this.clientService = new ClientProfileService();
    this.initClientInfo();
    Object.assign(HomeView.prototype, PdfMixin);
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
      detailModels: entity.detailModels || [],
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

  calculateValueDates(inceptionDate, frequencyInMonths) {
    const valueDates = [];
    const currentDate = new Date();
    let date = new Date(inceptionDate);
  
    while (date <= currentDate) {
      valueDates.push(this.formatDateToISO(date)); // Format to ISO
      date.setMonth(date.getMonth() + frequencyInMonths);
    }
  
    return valueDates;
  }

  formatDateToISO(date) {
    return date.toISOString().split('.')[0] + '+02:00'; // Format as: 2023-01-19T00:00:00+02:00
  }

  getEarliestInceptionDate(detailModels) {
    if (!detailModels.length) return null;
  
    return detailModels
      .map(model => new Date(model.inceptionDate))
      .reduce((earliest, current) => (current < earliest ? current : earliest));
  }

  async fetchData() {
    this.isVisible = false;

    const searched = store.get('searchID') === this.searchID;
    if (searched) return;
  
    const request = {
      TransactionDateStart: this.transactionDateStart,
      TransactionDateEnd: this.transactionDateEnd,
      TargetCurrencyL: 170,
      ValueDates: [],
      InputEntityModels: [
        {
          RegistrationNumber: this.searchID,
        },
      ],
    };
  
    store.set('searchID', this.searchID);
  
    try {
      // ✅ First API call to get client data
      const initialResponse = await this.clientService.getClientProfile(request);
      if (!initialResponse?.entityModels[1] || !initialResponse.entityModels[0]) return;
  
      const entity = initialResponse.entityModels[1] || initialResponse.entityModels[0];
      const detailModels = entity.detailModels || [];
  
      // ✅ Find the earliest inception date
      const earliestInceptionDate = this.getEarliestInceptionDate(detailModels);
      const frequency = this.appointmentFrequency || 6; // Default to 6 months
  
      // ✅ Calculate ValueDates based on the earliest inception date
      const valueDates = this.calculateValueDates(earliestInceptionDate, frequency);
  
      // ✅ Second API call with ValueDates
      const updatedRequest = {
        ...request,
        ValueDates: valueDates,
      };
  
      const finalResponse = await this.clientService.getClientProfile(updatedRequest);
      if (!finalResponse?.entityModels[1] || !finalResponse.entityModels[0]) return;
  
      const finalEntity = finalResponse.entityModels[1] || finalResponse.entityModels[0];
      this.clientInfo = {
        firstNames: finalEntity.firstNames || 'N/A',
        surname: finalEntity.surname || 'N/A',
        registeredName: finalEntity.registeredName || 'N/A',
        title: finalEntity.title || 'N/A',
        nickname: finalEntity.nickname || 'N/A',
        advisorName: finalEntity.advisorName || 'N/A',
        email: finalEntity.email || 'N/A',
        cellPhoneNumber: finalEntity.cellPhoneNumber || 'N/A',
        detailModels: finalEntity.detailModels || [],
      };
      store.set('clientInfo', this.clientInfo);
      this.isVisible = true;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  handleTabNavigation(tabName) {
    router.navigate(`/${tabName}`);
  }

  toggleDialog() {
    this.showDialog = !this.showDialog;
  }

  updateOption(e, option) {
    const { type, checked, value } = e.target;
    this.reportOptions = {
      ...this.reportOptions,
      [option]: type === 'checkbox' ? checked : parseFloat(value),
    };
  }

  toggleDetailModelsDialog() {
    this.showDetailModelsDialog = true;
    store.set('reportOptions', this.reportOptions);
    this.showDialog = false;
    this.requestUpdate();
  }

  async generateReport() {
    var base64 = await this.generatePDF(this.clientInfo, this.selectedDetailModel, this.reportOptions.irr, this.searchID); // Generate the PDF
    store.set('base64', base64);
    router.navigate('/pdf'); // Navigate to the PDF viewer
    // alert('Report generated!');
  }

  handleSelectDetailModel(model) {
    this.showDetailModelsDialog = false;
    this.selectedDetailModel = model;
    // Continue with generating the report
    this.generateReport();
  }

  renderDetailModelsDialog() {
    if (!this.clientInfo || !this.clientInfo.detailModels) return null;
  
    return html`
      <div class="dialog-overlay">
        <div class="dialog-content">
          <h3>📂 Select a Portfolio</h3>
          <div class="portfolio-list">
            ${this.clientInfo.detailModels.map(
              (model) => html`
                <div class="portfolio-card" @click="${() => this.handleSelectDetailModel(model)}">
                  <h4>${model.instrumentName}</h4>
                  <p><strong>Account Number:</strong> ${model.accountNumber || 'N/A'}</p>
                  <p><strong>Balance:</strong> ${model.balance ? `R${model.balance}` : 'R0.00'}</p>
                </div>
              `
            )}
          </div>
          <button class="cancel-btn" @click="${() => (this.showDetailModelsDialog = false)}">Cancel</button>
        </div>
      </div>
    `;
  }


  renderDialog() {
    return html`
      <div class="dialog-overlay">
        <div class="dialog-content">
          <h3>📊 Generate Report</h3>
          <div class="dialog-options">
            <label><input type="checkbox" .checked="${this.reportOptions.contributions}" @change="${(e) => this.updateOption(e, 'contributions')}" /> Contributions</label>
            <label><input type="checkbox" .checked="${this.reportOptions.withdrawals}" @change="${(e) => this.updateOption(e, 'withdrawals')}" /> Withdrawals</label>
            <label><input type="checkbox" .checked="${this.reportOptions.regularWithdrawals}" @change="${(e) => this.updateOption(e, 'regularWithdrawals')}" /> Regular Withdrawals</label>
            <label><input type="checkbox" .checked="${this.reportOptions.includePercentage}" @change="${(e) => this.updateOption(e, 'includePercentage')}" /> Include Percentage</label>
            <label>
              IRR (%):
              <input type="number" .value="${this.reportOptions.irr}" step="0.1" @input="${(e) => this.updateOption(e, 'irr')}" />
            </label>
          </div>
          <div class="dialog-actions">
            <button class="cancel-btn" @click="${() => (this.showDialog = false)}">Cancel</button>
            <button class="generate-btn" @click="${this.toggleDetailModelsDialog}">Generate Report</button>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div>
        <header class="header">
          <h1>Morebo</h1>
        </header>
        ${this.showDetailModelsDialog ? this.renderDetailModelsDialog() : ''}
        ${this.showDialog ? this.renderDialog() : ''}
        <div class="hero">
          <div class="watermark">
            <img src="${logo}" alt="Morebo Watermark" />
          </div>
          <h2>Find your client</h2>
          <div class="search-section">
            <input
              type="text"
              placeholder="Search by ID"
              .value="${this.searchID}"
              @input="${(e) => (this.searchID = e.target.value)}"
            />
            <button class="button" @click="${this.fetchData}">Search</button>
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
    <div class="client-card visible">
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
            <h4>Upcoming Appointments:</h4>
            <ul>
              ${appointments.map((date) => html`<li>${formatter.format(date)}</li>`)}
            </ul>
          </div>
        </div>
        <div class="client-card-actions">
          <button @click="${() => this.handleTabNavigation('transactions')}">View Transactions</button>
          <button @click="${() => (this.showDialog = true)}">Generate Report</button>
          <button @click="${() => this.handleTabNavigation('products')}">View Portfolios</button>
        </div>
      </div>
    `;
  }
}
customElements.define('home-view', HomeView);