import { LitElement, html, css } from 'lit';
import { router } from '/src/shell/Routing.js'
import { ClientProfileService } from '/src/services/ClientProfileService.js';
import logo from '/src/images/page-Logo-full.png';
import { store } from '/src/store/EliteStore.js';
import { ViewBase } from './common/ViewBase.js';

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
      width: 100%;
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
  `;

  static properties = {
    clientID: { type: String },
    clientInfo: { type: Object },
    isLoading: { type: Boolean },
    searchMoved: { type: Boolean },
    expandedCards: { type: Object },
    transactionDateStart: { type: String },
    transactionDateEnd: { type: String }
  };

  constructor() {
    super();
    this.clientID = '';
    this.clientInfo = null;
    this.isLoading = false;
    this.searchMoved = false;
    this.expandedCards = {};
    this.clientService = new ClientProfileService();
    this.transactionDateStart = new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString();
    this.transactionDateEnd = new Date().toISOString();
  }

  connectedCallback() {
    super.connectedCallback();
    const storedClientInfo = store.get('clientInfo');
    if (storedClientInfo) {
      this.clientInfo = storedClientInfo;
      this.searchMoved = true;
    }
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
                <button @click="${() => alert('Generate Report')}">Generate Report</button>
              </div>

              ${this.clientInfo.detailModels.map(
                (portfolio, index) => html`
                  <div class="portfolio-card ${this.expandedCards[index] ? 'expanded' : ''}">
                    <h3>${portfolio.instrumentName}</h3>
                    <div class="portfolio-actions">
                      <button @click="${() => this.navigateToTransactions(portfolio.instrumentName)}">Transaction History</button>
                      <button @click="${() => this.navigateToRootTransactions(portfolio.instrumentName)}">Interaction History</button>
                      <button @click="${() => this.toggleExpand(index)}">
                        ${this.expandedCards[index] ? 'Hide Info' : 'More Info'}
                      </button>
                    </div>

                    ${this.expandedCards[index] ? this.renderPortfolioInfo(portfolio) : ''}
                  </div>
                `
              )}
            `
          : ''}
      </div>
    `;
  }
}

customElements.define('dashboard-view', Dashboard);