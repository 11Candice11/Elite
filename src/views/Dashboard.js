import { LitElement, html, css } from 'lit';
import { router } from '/src/shell/Routing.js'
import { ClientProfileService } from '/src/services/ClientProfileService.js';
import logo from '/src/images/page-Logo-full.png';
import { store } from '/src/store/EliteStore.js';
import { ViewBase } from './common/ViewBase.js';
import { PdfMixin } from '/src/views/mixins/PDFMixin.js';

class Dashboard extends ViewBase {
  static styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
      background: #f5f7fa;
      min-height: 100vh;
      padding: 20px;
      position: relative;
      color: #333;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.03;
      z-index: 0;
    }

    .watermark img {
      max-width: 70%;
      height: auto;
    }

    .search-card {
      background: #ffffff;
      border: 1px solid #dcdcdc;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      max-width: 300px;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.5s ease-in-out;
      z-index: 1;
    }

    .search-card.move-up {
      top: 20px;
      left: 20px;
      transform: translate(0, 0);
    }

    input[type="text"] {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 5px;
      margin-bottom: 10px;
    }

    button {
      background: #0077b6;
      color: white;
      padding: 8px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    button:hover {
      background: #005f8a;
    }

    .portfolio-container {
      margin: 120px 20px 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .portfolio-card {
      background: #ffffff;
      border: 1px solid #dcdcdc;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .portfolio-card.expanded {
      background: #f0f8ff;
      border: 1px solid #0077b6;
    }

    .portfolio-actions button {
      margin: 5px;
      background: #0077b6;
    }

    .generate-report {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #0096c7;
    }

    .loading {
      color: #0077b6;
      font-weight: bold;
      text-align: center;
    }

    .portfolio-info {
      margin-top: 10px;
      padding: 10px;
      background: #eaf4fb;
      border-radius: 5px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .info-item {
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      background: #fff;
    }

    th, td {
      padding: 8px 12px;
      text-align: left;
      border: 1px solid #ccc;
    }

    th {
      background: #0077b6;
      color: white;
    }

    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .popup {
      position: fixed;
      top: 25%;
      left: 25%;
      width: 50%; /* Wider */
      max-width: 600px;
      background: white;
      border: 2px solid #0077b6;
      padding: 20px;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }
        
    .date-list {
      max-height: 150px; /* Restrict height */
      overflow-y: auto;  /* Add vertical scrollbar */
      border: 1px solid #ccc;
      padding: 10px;
      background: #f9f9f9;
      border-radius: 5px;
    }
    
    .date-list li {
      padding: 5px 0;
      border-bottom: 1px solid #ddd;
    }
    
    .date-list li:last-child {
      border-bottom: none;
    }    
    .popup > button {
      margin: 5px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    th, td {
      padding: 8px;
      border: 1px solid #ccc;
      text-align: left;
    }
    
    th {
      background-color: #0077b6;
      color: white;
    }
    
    input[type="text"] {
      width: 90%;
      padding: 4px;
      box-sizing: border-box;
    }
  `;

  static properties = {
    clientID: { type: String },
    clientInfo: { type: Object },
    showPopup: { type: Boolean },
    selectedDates: { type: Array },
    selectedPortfolio: { type: Object },
    rootValueDateModels: { type: Array },  
    customDate: { type: String },
    isLoading: { type: Boolean },
    searchMoved: { type: Boolean },
    expandedCards: { type: Object },
    transactionDateStart: { type: String },
    transactionDateEnd: { type: String },
    performanceData: { type: Object } 
  };

  constructor() {
    super();
    this.clientID = '';
    this.clientInfo = store.get('clientInfo') || {};
    this.selectedPortfolio = store.get('selectedPortfolio') || null;
    this.rootValueDateModels = [];
    this.performanceData = {};
    this.showPopup = false;
    this.selectedDates = [];
    this.customDate = '';
    this.isLoading = false;
    this.searchMoved = false;
    this.expandedCards = {};
    this.clientService = new ClientProfileService();
    this.transactionDateStart = new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString();
    this.transactionDateEnd = new Date().toISOString();
    Object.assign(Dashboard.prototype, PdfMixin);
  }

  connectedCallback() {
    super.connectedCallback();
    const storedClientInfo = store.get('clientInfo');
    if (storedClientInfo) {
      this.clientInfo = storedClientInfo;
      this.searchMoved = true;
    }
  }

  handleInputChange(portfolioId, field, value) {
    this.performanceData = {
      ...this.performanceData,
      [portfolioId]: {
        ...this.performanceData[portfolioId],
        [field]: value
      }
    };
  }
  
  navigateToRootTransactions(portfolio) {
    store.set('selectedInstrumentName', portfolio);
    // TODO Do service call to get root models
    super.navigateToRootTransactions();
  }

  navigateToTransactions(portfolio) {
    store.set('selectedInstrumentName', portfolio);
    router.navigate('/transactions');
  }

  async searchClient() {
    this.isLoading = true;
    this.clientInfo = null;

    const request = {
      TransactionDateStart: this.transactionDateStart,
      TransactionDateEnd: this.transactionDateEnd,
      TargetCurrencyL: 170,
      ValueDates: [],
      InputEntityModels: [
        {
          RegistrationNumber: this.clientID,
        },
      ],
    };

    store.set('searchID', this.clientID);

    try {
      const response = await this.clientService.getClientProfile(request);
      this.clientInfo = response.entityModels[1] || response.entityModels[0];
      store.set('clientInfo', this.clientInfo);  // Store clientInfo for persistence
      this.searchMoved = true;
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      this.isLoading = false;
    }
  }

  toggleExpand(index) {
    this.expandedCards = {
      ...this.expandedCards,
      [index]: !this.expandedCards[index],
    };
  }

  togglePopup() {
    this.showPopup = !this.showPopup;
  }
  
  handleDateSelection(option) {
    const inceptionDate = new Date(this.clientInfo.inceptionDate || '2000-01-01');
    const today = new Date();
    const dates = [];
  
    const months = {
      'Jan': [0],
      'Jan|Jun': [0, 5],
      'Jan|Jun|Oct': [0, 5, 9]
    };
  
    for (let year = today.getFullYear(); year >= inceptionDate.getFullYear(); year--) {
      months[option].forEach(month => {
        const date = new Date(year, month, 1);
        if (date >= inceptionDate && date <= today) {
          dates.push(date.toISOString().split('T')[0]);
        }
      });
    }
  
    this.selectedDates = [...new Set([...this.selectedDates, ...dates])];
  }
  
  addCustomDate() {
    if (this.customDate && !this.selectedDates.includes(this.customDate)) {
      this.selectedDates = [...this.selectedDates, this.customDate];
      this.customDate = '';
    }
  }

  async handleNext() {
    this.isLoading = true;
  
    const searchId = store.get('searchID');

    const request = {
      TransactionDateStart: "2020-01-12T00:00:00+02:00",
      TransactionDateEnd: new Date().toISOString(),
      TargetCurrencyL: 170,
      ValueDates: this.selectedDates.map(date => `${date}T00:00:00`),
      InputEntityModels: [
        {
          SouthAfricanIdNumber: "",
          PassportNumber: null,
          RegistrationNumber: searchId
        }
      ]
    };
  
    try {
      const response = await this.clientService.getClientProfile(request);
      const clientInfo = response.entityModels[1] || response.entityModels[0];
      const detail = clientInfo.detailModels.find(
        (d) => d.instrumentName === this.selectedPortfolio.instrumentName
      );
  
      store.set('clientInfo', clientInfo);
      store.set('selectedInstrumentName', this.selectedPortfolio);
      store.set('rootValueDateModels', detail?.rootValueDateModels || []);
  
      this.navigateToRootTransactions();
    } catch (error) {
      console.error('Error fetching updated client information:', error);
    } finally {
      this.isLoading = false;
    }
  }

  selectPortfolio(portfolio) {
    this.selectedPortfolio = portfolio;
    store.set('selectedPortfolio', portfolio);
  
    const detail = this.clientInfo.detailModels.find(
      (d) => d.instrumentName === portfolio.instrumentName
    );
  
    if (detail && detail.rootValueDateModels) {
      this.rootValueDateModels = detail.rootValueDateModels;
      store.set('rootValueDateModels', detail.rootValueDateModels);
    }
  }

  async generateReport() {
    console.log('Generating report...');
    var base64 = await this.generatePDF(this.clientInfo, this.clientInfo.detailModels[0], "7", this.clientID); // Generate the PDF
    store.set('base64', base64);
    router.navigate('/pdf'); // Navigate to the PDF viewer
  }
  
  renderPopup() {
    return html`
      <div class="overlay" @click="${this.togglePopup}"></div>
      <div class="popup" @click="${(e) => e.stopPropagation()}">
        <h3>Select Dates</h3>
        <input type="date" .value="${this.customDate}" @input="${(e) => this.customDate = e.target.value}" />
        <button @click="${this.addCustomDate}">Add Date</button>
        <div>
          <button @click="${() => this.handleDateSelection('Jan')}">Jan</button>
          <button @click="${() => this.handleDateSelection('Jan|Jun')}">Jan | Jun</button>
          <button @click="${() => this.handleDateSelection('Jan|Jun|Oct')}">Jan | Jun | Oct</button>
        </div>
        <h4>Selected Dates:</h4>
        <ul class="date-list"> 
          ${this.selectedDates.map(date => html`<li>${date}</li>`)}
        </ul>
        <button @click="${this.togglePopup}">Close</button>
        <button @click="${this.handleNext}" ?disabled="${this.isLoading}">
          ${this.isLoading ? 'Processing...' : 'Next'}
        </button>
      </div>
    `;
  }

  renderPortfolioInfo(portfolio) {
    return html`
      <div class="portfolio-info">
        <h4>General Information</h4>
        <div class="info-grid">
          <div class="info-item"><strong>Reference Number:</strong> ${portfolio.referenceNumber}</div>
          <div class="info-item"><strong>Inception Date:</strong> ${new Date(portfolio.inceptionDate).toLocaleDateString()}</div>
          <div class="info-item"><strong>Initial Contribution:</strong> ${portfolio.initialContributionAmount} ${portfolio.initialContributionCurrencyAbbreviation}</div>
          <div class="info-item"><strong>Regular Contribution:</strong> ${portfolio.regularContributionAmount} ${portfolio.regularContributionCurrencyAbbreviation} (${portfolio.regularContributionFrequency})</div>
          <div class="info-item"><strong>Report Notes:</strong> ${portfolio.reportNotes || 'N/A'}</div>
        </div>

        <h4>Portfolio Entries</h4>
        <table>
          <tr>
            <th>Instrument Name</th>
            <th>ISIN Number</th>
            <th>MorningStar ID</th>
          </tr>
          ${portfolio.portfolioEntryTreeModels?.map(
      (entry) => html`
              <tr>
                <td>${entry.instrumentName}</td>
                <td>${entry.isinNumber || 'N/A'}</td>
                <td>${entry.morningStarId || 'N/A'}</td>
              </tr>
            `
    )}
        </table>
      </div>
    `;
  }

  render() {
    return html`
      <div class="watermark">
        <img src="${logo}" alt="Morebo Watermark" />
      </div>

      <div class="search-card ${this.searchMoved ? 'move-up' : ''}">
        <input
          type="text"
          placeholder="Enter Client ID"
          .value="${this.clientID}"
          @input="${(e) => (this.clientID = e.target.value)}"
        />
        <button @click="${this.searchClient}">Search</button>
      </div>

      <div class="portfolio-container">
        ${this.isLoading
        ? html`<div class="loading">Loading...</div>`
        : this.clientInfo
          ? html`
              <div class="generate-report">
                <button @click="${() => this.generateReport()}">Generate Report</button>
              </div>

${this.showPopup ? this.renderPopup() : ''}
${this.clientInfo.detailModels?.map((portfolio, index) => html`
  <div class="portfolio-card" @click="${() => this.selectPortfolio(portfolio)}">
    <h3>${portfolio.instrumentName}</h3>
    <button @click="${() => this.navigateToTransactions(portfolio)}">Transaction History</button>
        <button @click="${() => this.togglePopup()}">Interaction History</button>
    <button @click="${() => this.toggleExpand(index)}">
      ${this.expandedCards[index] ? 'Hide Info' : 'More Information'}
    </button>

    ${this.expandedCards[index] ? html`
      <div class="portfolio-info">
        <h4>General Information</h4>
        <p><strong>Reference Number:</strong> ${portfolio.referenceNumber}</p>
        <p><strong>Inception Date:</strong> ${new Date(portfolio.inceptionDate).toLocaleDateString()}</p>
        <p><strong>Initial Contribution:</strong> ${portfolio.initialContributionAmount} ZAR</p>
        <p><strong>Regular Contribution:</strong> ${portfolio.regularContributionAmount} ZAR (${portfolio.regularContributionFrequency})</p>
        <p><strong>Report Notes:</strong> ${portfolio.reportNotes || 'N/A'}</p>

        <h4>Portfolio Entries</h4>
        <table>
          <tr>
            <th>Instrument Name</th>
            <th>ISIN Number</th>
            <th>MorningStar ID</th>
            <th>One Year</th>
            <th>Three Years</th>
          </tr>
          ${portfolio.portfolioEntryTreeModels?.map(entry => html`
            <tr>
              <td>${entry.instrumentName}</td>
              <td>${entry.isinNumber || 'N/A'}</td>
              <td>${entry.morningStarId || 'N/A'}</td>
              <td>
                <input 
                  type="text" 
                  .value="${this.performanceData[entry.portfolioEntryId]?.oneYear || ''}" 
                  @input="${(e) => this.handleInputChange(entry.portfolioEntryId, 'oneYear', e.target.value)}" 
                  placeholder="Enter 1Y Return" 
                />
              </td>
              <td>
                <input 
                  type="text" 
                  .value="${this.performanceData[entry.portfolioEntryId]?.threeYears || ''}" 
                  @input="${(e) => this.handleInputChange(entry.portfolioEntryId, 'threeYears', e.target.value)}" 
                  placeholder="Enter 3Y Return" 
                />
              </td>
            </tr>
          `)}
        </table>
      </div>
    ` : ''}
  </div>
`)}`          : ''}
      </div>
    `;
  }
}

customElements.define('dashboard-view', Dashboard);