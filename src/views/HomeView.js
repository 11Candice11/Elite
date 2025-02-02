import { LitElement, html, css } from 'lit';
import { router } from '/src/shell/Routing.js';
import { ClientProfileService } from '/src/services/ClientProfileService.js';
import { store } from '/src/store/EliteStore.js';
import background from '/src/images/home.png';
import user from '/src/images/user.png';
import { ViewBase } from './common/ViewBase.js';
import { PdfMixin } from '/src/views/mixins/PDFMixin.js';

class HomeView extends ViewBase {
  static styles = [
    ViewBase.styles,
    css`
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    .client-card {
      background: white;
      border: 1px solid #222222;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }
    
    .client-card-header {
      display: flex;
      align-items: center;
      background-color: #c0e600;
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
      margin: 10px;
      background-color: #c0e600;
      color: #222222;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .client-card-actions button:hover {
      background-color: #c0e600;
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
      color: #222222;
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
      color: #222222;
      border: none;
      border-radius: 5px;
      cursor: pointer;
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
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .dialog-content {
      background: white;
      border-radius: 10px;
      width: 400px;
      padding: 20px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }

    .dialog-content h3 {
      margin-top: 0;
    }

    .dialog-content label {
      display: flex;
      align-items: center;
      margin: 10px 0;
    }

    .dialog-content input[type="checkbox"] {
      margin-right: 10px;
    }

    .dialog-content .actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }

    .dialog-content button {
      padding: 10px 15px;
      background-color: #c0e600;
      color: #222222;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    .dialog-content button:hover {
      background-color: #c0e600;
    }
    h2 {
      color: #222222;
    }
    label {
      color: black;
    }
  `];

  static properties = {
    searchID: { type: String },
    transactionDateStart: { type: String },
    transactionDateEnd: { type: String },
    isSearched: { type: Boolean },
    clientInfo: { type: Object },
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
      if (!initialResponse?.entityModels[0]) return;
  
      const entity = initialResponse.entityModels[0];
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
      if (!finalResponse?.entityModels[0]) return;
  
      const finalEntity = finalResponse.entityModels[0];
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
  
      store.set('clientInfo', finalEntity);
      console.log("Final Request ValueDates:", valueDates);
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
    console.log('Showing detail models dialog...');
    store.set('reportOptions', this.reportOptions);
    this.showDialog = false;
    this.requestUpdate();
  }

  async generateReport() {
    console.log('Generating report...');
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
          <h3>Select a Detail Model</h3>
          ${this.clientInfo.detailModels.map(
      (model) => html`
              <div class="client-card" @click="${() => this.handleSelectDetailModel(model)}">
                <p><strong>${model.instrumentName}</strong></p>
              </div>
            `
    )}
          <button class="button" @click="${() => this.showDetailModelsDialog = false}">Cancel</button>
        </div>
      </div>
    `;
  }

  renderDialog() {
    return html`
      <div class="dialog-overlay">
        <div class="dialog-content">
          <h3>Generate Report</h3>
          <div>
            <label><input type="checkbox" .checked="${this.reportOptions.contributions}" @change="${(e) => this.updateOption(e, 'contributions')}" /> Contributions</label>
            <label><input type="checkbox" .checked="${this.reportOptions.withdrawals}" @change="${(e) => this.updateOption(e, 'withdrawals')}" /> Withdrawals</label>
            <label><input type="checkbox" .checked="${this.reportOptions.regularWithdrawals}" @change="${(e) => this.updateOption(e, 'regularWithdrawals')}" /> Regular Withdrawals</label>
            <label><input type="checkbox" .checked="${this.reportOptions.includePercentage}" @change="${(e) => this.updateOption(e, 'includePercentage')}" /> Include Percentage</label>
            <label>
              <input type="checkbox" .checked="${this.reportOptions.netWithdrawal}" @change="${(e) => this.updateOption(e, 'netWithdrawal')}" /> Net Withdrawal
              <input type="number" .value="${this.reportOptions.netWithdrawalValue}" ?disabled="${!this.reportOptions.netWithdrawal}" @input="${(e) => this.updateOption(e, 'netWithdrawalValue')}" />
            </label>
            <!-- <label><input type="checkbox" .checked="${this.reportOptions.switches}" @change="${(e) => this.updateOption(e, 'switches')}" /> Switches</label> -->
            <!-- <label><input type="checkbox" .checked="${this.reportOptions.performanceChart}" @change="${(e) => this.updateOption(e, 'performanceChart')}" /> Performance Chart</label> -->
            <!-- <label><input type="checkbox" .checked="${this.reportOptions.excludeGrowth}" @change="${(e) => this.updateOption(e, 'excludeGrowth')}" /> Exclude Growth</label> -->
            <label>
              IRR: <input type="number" .value="${this.reportOptions.irr}" step="0.1" @input="${(e) => this.updateOption(e, 'irr')}" />
            </label>
            <!-- <label><input type="checkbox" .checked="${this.reportOptions.vested}" @change="${(e) => this.updateOption(e, 'vested')}" /> Vested</label> -->
            <!-- <label><input type="checkbox" .checked="${this.reportOptions.groupFunds}" @change="${(e) => this.updateOption(e, 'groupFunds')}" /> Group Funds</label> -->
          </div>
          <div class="actions">
            <button class="button" @click="${() => this.showDialog = false}">Cancel</button>
            <button class="button" @click="${this.toggleDetailModelsDialog}">Generate</button>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div>
        <header class="header">
          <h1>Elite</h1>
        </header>
        ${this.showDetailModelsDialog ? this.renderDetailModelsDialog() : ''}
        ${this.showDialog ? this.renderDialog() : ''}
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
          <button class="button" @click="${() => this.handleTabNavigation('transactions')}">Transactions</button>
          <button class="button" @click="${() => this.showDialog = true}">Generate Report</button>
          <button class="button" @click="${() => this.handleTabNavigation('products')}">Portfolios</button>
        </div>
      </div>
    `;
  }
}
customElements.define('home-view', HomeView);