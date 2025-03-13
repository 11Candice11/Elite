import { LitElement, html, css } from 'lit';
import { router } from '/src/shell/Routing.js'
import { ClientProfileService } from '/src/services/ClientProfileService.js';
import user from '/src/images/user.png';
import logo from '/src/images/page-Logo-full.png';  // Ensure the logo path is correct
import { userInfoMixin } from '/src/views/mixins/UserInfoMixin.js';
import { store } from '/src/store/EliteStore.js';
import { ViewBase } from './common/ViewBase.js';
import { PdfMixin } from '/src/views/mixins/PDFMixin.js';

class Dashboard extends ViewBase {
  static styles = css`
  :host {
    display: flex;
    flex-direction: column;
    font-family: Arial, sans-serif;
    background: #f5f7fa;
    min-height: 100vh;
    color: #333;
    align-items: center;
    justify-content: center;
    transition: all 0.5s ease-in-out;
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

  .popup {
    position: fixed;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -25%);
    width: 50%;
    max-width: 500px;
    background: white;
    border: 2px solid #0077b6;
    padding: 20px;
    border-radius: 8px;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .popup-content {
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
    border-radius: 5px;
    background: #f9f9f9;
  }

  .popup button {
    margin-top: 10px;
    background: #0077b6;
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: logo 0.3s ease;
  }

  .popup button:hover {
    background: #005f8a;
  }

  /* Search Bar Container */
  .search-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.5s ease-in-out;
  }

  /* Moves search bar to top left */
  .search-container.moved {
    position: fixed;
    top: 10px;
    left: 10px;
    transform: none;
    background: #0077b6;
    padding: 10px;
    border-radius: 5px;
  }

  .search-container input {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    width: 300px;
    text-align: center;
    font-size: 16px;
  }

  .search-container.moved input {
    background: white;
    color: black;
  }

  .search-container button {
    margin-left: 10px;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    background: #005f8a;
    color: white;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .search-container button:hover {
    background: #004b70;
  }

  .loading {
    font-size: 18px;
    font-weight: bold;
    color: #0077b6;
    margin-top: 60px;
  }

  .content-container {
    display: none;
    flex-direction: row;
    gap: 20px;
    padding: 20px;
    margin-top: 80px;
    width: 90%;
    transition: all 0.5s ease-in-out;
  }

  .content-container.visible {
    display: flex;
  }

  .portfolio-container {
    flex: 1;
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
  }

  .portfolio-card h3 {
    color: #0077b6;
  }

  button {
    background: #0077b6;
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 5px 0;
  }

  button:hover {
    background: #005f8a;
  }

  .logout-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #ff4d4d;
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .logout-button:hover {
    background: #cc0000;
  }
  .service-unavailable {
    font-size: 20px;
    font-weight: bold;
    color: red;
    margin-top: 20px;
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
    height: 400px;
    text-align: center;
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
.report-btn {
  margin-top: 25px;
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
    searchCompleted: { type: Boolean },
    isLoading: { type: Boolean },
    expandedCards: { type: Object },
    transactionDateStart: { type: String },
    transactionDateEnd: { type: String },
    serviceUnavailable: { type: Boolean },
    performanceData: { type: Object },
    portfolioRatings: { type: Object }
  };

  constructor() {
    super();
    this.clientID = '';
    this.oneYear = '';
    this.threeYears = '';
    this.clientInfo = store.get('clientInfo') || {};
    // this.selectedPortfolio = store.get('selectedPortfolio') || null;
    this.showPopup = false;
    this.selectedDates = [];
    this.customDate = '';
    this.searchCompleted = false;
    this.isLoading = false;
    this.expandedCards = {};
    this.serviceUnavailable = false;
    this.portfolioRatings = {}; // One Year, Three Year

    this.clientProfileService = new ClientProfileService();
    this.transactionDateStart = new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString();
    this.transactionDateEnd = new Date().toISOString();
    Object.assign(Dashboard.prototype, PdfMixin);
    Object.assign(Dashboard.prototype, userInfoMixin);
  }

  async connectedCallback() {
    super.connectedCallback();
    const storedClientInfo = store.get('clientInfo');
    if (storedClientInfo) {
      this.clientID = store.get('searchID') ?? this.clientID;
      this.selectedDates = await this._getDates();
      this.clientInfo = storedClientInfo;
      this.searchCompleted = true;
    }
  }

  navigateToRootTransactions(portfolio) {
    this.selectedPortfolio = portfolio;
    const detail = this.clientInfo.detailModels.find(
      (d) => d.instrumentName === this.selectedPortfolio.instrumentName
    );
    store.set('rootValueDateModels', detail?.rootValueDateModels || []);
    store.set('selectedInstrumentName', this.selectedPortfolio);
    // super.navigateToProducts();
    router.navigate('/transaction-history');
  }

  navigateToTransactions(portfolio) {
    this.selectedPortfolio = portfolio;
    store.set('selectedInstrumentName', portfolio);
    router.navigate('/transactions');
  }

  async searchClient() {
    if (!this.clientID.trim()) return;

    this.selectedDates = [];
    this.isLoading = true;
    this.clientInfo = null;
    this.searchCompleted = false;

    store.set('selectedDates', []);

    try {

      this.clientInfo = await this.getClientInfo(this.clientID);

      if (this.clientInfo) {
        store.set('searchID', this.clientID);
        store.set('clientInfo', this.clientInfo);
        this.searchCompleted = true;
        this.showPopup = true;
        this.selectedDates = await this._getDates();
      } else {
        console.error("Service returned no data.");
        this.serviceUnavailable = true;
        router.navigate('/service-unavailable');
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      this.serviceUnavailable = true;
      router.navigate('/service-unavailable');
    } finally {
      this.isLoading = false;
      this.requestUpdate();
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

  async _getDates() {
    const storeDates = store.get('selectedDates');
    if (storeDates?.length > 0) return storeDates;
    this.showPopup = true;
    const dates = [
      "2022-05-14",
      "2023-09-23",
      "2024-01-08"
    ];

    const returnValue = await this.clientProfileService.getClientData(this.clientID);
    if (returnValue[0]?.listDates) {
      return returnValue[0].listDates;
    }
    return dates;
  }

  handleDateSelection(option) {
    const earliestInceptionDate = this.clientInfo?.detailModels
      ?.map(detail => new Date(detail.inceptionDate)) // Convert to Date objects
      .reduce((earliest, current) => (current < earliest ? current : earliest), new Date());

    const inceptionDate = new Date(earliestInceptionDate);
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

    const earliestInceptionDate = this.clientInfo?.detailModels
      ?.map(detail => new Date(detail.inceptionDate)) // Convert to Date objects
      .reduce((earliest, current) => (current < earliest ? current : earliest), new Date());

    this.clientInfo = await this.getClientInfo(this.clientID, earliestInceptionDate.toISOString().split('T')[0], this.selectedDates.map(date => `${date}T00:00:00`));

    // store.set('selectedDates', this.selectedDates);

    const dates = store.get('selectedDates');
    if (dates === undefined || JSON.stringify(dates) != JSON.stringify(this.selectedDates)) {
      store.set('selectedDates', this.selectedDates);
      const consultant = store.get('username');
      await this.clientProfileService.addClientData(this.clientID, this.selectedDates, consultant);
    }

    this.showPopup = false;
    this.isLoading = false;
  }

  updatePortfolioRatings(portfolioId, period, value) {
    if (!this.portfolioRatings[portfolioId]) {
      this.portfolioRatings[portfolioId] = {}; // Initialize if it doesn't exist
    }
    this.portfolioRatings[portfolioId][period] = value;
  }

  logout() {
    store.set('clientInfo', null);
    store.set('searchID', '');
    store.set('selectedDates', null);
    store.set('username', '');
    this.clientID = '';
    this.clientInfo = null;
    this.searchCompleted = false;
    router.navigate('/login');
  }

  async generateReport() {
    var base64 = await this.generatePDF(this.clientInfo, this.clientID, this.portfolioRatings); // Generate the PDF
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
        <button @click="${() => this.selectedDates = []}">Clear</button>
        <button @click="${this.handleNext}" ?disabled="${this.isLoading}">
          ${this.isLoading ? 'Processing...' : 'Next'}
        </button>
      </div>
    `;
  }

  _renderPortfolios() {
    return html`
      <div class="portfolio-container">
        <div class="watermark">
            <img src="${logo}" alt="Morebo Watermark" />
        </div>
        ${this.clientInfo.detailModels?.length
          ? this.clientInfo.detailModels.map((portfolio, index) => html`
            <div class="portfolio-card">
              <h3>${portfolio.instrumentName}</h3>
              <button @click="${() => this.navigateToTransactions(portfolio)}">Transaction History</button>
              <button @click="${() => this.navigateToRootTransactions(portfolio)}">Interaction History</button>
              <!-- <button @click="${() => this.generateReport(portfolio)}">Generate Report</button> -->
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
                      <th>Three years</th>
                    </tr>
                    ${portfolio.portfolioEntryTreeModels?.map((entry) => html`
                        <tr>
                          <td>${entry.instrumentName}</td>
                          <td>${entry.isinNumber || 'N/A'}</td>
                          <td>${entry.morningStarId || 'N/A'}</td>
                          <td>${this._renderInput("oneYear")}</td>
                          <td>${this._renderInput("threeYears")}</td>
                        </tr>
                      `)}
                  </table>
                </div>
              ` : ''}
            </div>
          `)
    : html`<p>No Portfolios Found</p>`}
      </div>
    `;
  }

  renderClientCard() {
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
      </div>
      <button class="report-btn" @click="${() => this.generateReport()}">Generate Report</button>
    </div>
    `;
  }

  render() {
    return html`
    ${this.showPopup ? this.renderPopup() : ''}
          <!-- Logout Button (Only Visible When Logged In) -->
          ${this.clientInfo ? html`
        <button class="logout-button" @click="${this.logout}">Logout</button>
      ` : ''}
      <!-- Search Bar -->
      <div class="search-container ${this.searchCompleted ? 'moved' : ''}">
        <input
          type="text"
          placeholder="Enter Clients ID"
          .value="${this.clientID}"
          @input="${(e) => (this.clientID = e.target.value)}"
        />
        <button @click="${this.searchClient}">Search</button>
      </div>
  
      <!-- Loading Indicator -->
      ${this.isLoading ? html`<div class="loading">Loading...</div>` : ''}
  
      <!-- Client Profile & Portfolio (Hidden Until Search) -->
      ${this.searchCompleted && this.clientInfo ? html`
        <div class="content-container visible">
          
          ${this.clientInfo ? this.renderClientCard() : ''}

          <!-- Portfolio List -->
           ${this._renderPortfolios()}
        </div>
      ` : ''}
    `;
  }

  _renderInput(portfolioId, year) {
    return html`
      <input
        type="text"
        placeholder=""
        .value="${this.portfolioRatings[portfolioId]?.[year] || ''}"
        @input="${(e) => this.updatePortfolioRatings(portfolioId, year, e.target.value)}"
      />
    `;
  }
}

customElements.define('dashboard-view', Dashboard);
