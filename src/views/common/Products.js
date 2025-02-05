import { LitElement, html, css } from 'lit';
import { store } from '/src/store/EliteStore.js';
import { ViewBase } from './ViewBase.js';
import { router } from '/src/shell/Routing.js';

class Products extends ViewBase {
  static styles = [
    ViewBase.styles,
    css`
    body {
      font-family: Arial, sans-serif;
      background-color: #EAEAE0; /* Ivory Background */
      margin: 0;
      padding: 20px;
    }

    .quote-card {
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin: 20px auto;
      max-width: 1000px;
      border-left: 5px solid rgb(215 180 120) /* Neon Green Accent */
    }

    .header {
      background-color: #278ABD; /* Blue Grotto */
      color: white;
      padding: 15px;
      border-radius: 8px 8px 0 0;
    }

    .header h3, .header p {
      margin: 0;
    }

    .stats {
      display: flex;
      justify-content: space-around;
      background-color: #F9F9F9;
      padding: 10px;
      border-radius: 8px;
    }

    .stats div {
      text-align: center;
      color: #1C4670; /* Blue Text */
    }

    button {
      width: 120px;
      height: 40px;
      font-size: 9px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    thead th {
      background-color: #278ABD; 
      color: white;
      padding: 10px;
    }

    tbody tr:nth-child(odd) {
      background-color: #F9F9F9;
    }

    .back-button {
      margin: 10px 0;
    }

    input{
      width: 260px;
    height: 40px;
    border-radius: 10px;
    }
            `];

  static properties = {
    detailModels: { type: Array }, // Array to store multiple detail models
    searchQuery: { type: String }, // Add searchQuery property
  };

  constructor() {
    super();
    this.detailModels = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.searchQuery = ''; // Initialize searchQuery

    const clientInfo = store.get('clientInfo') || {};
    if (clientInfo && Array.isArray(clientInfo.detailModels)) {
      this.detailModels = clientInfo.detailModels;
    }
  }

  navigateToMoreInfo(portfolioEntryTreeModels) {
    store.set('portfolioEntryTreeModels', portfolioEntryTreeModels); // Save data to store
    router.navigate('/portfolio-details'); // Navigate to the detailed view
  }

  navigateToTransactionHistory(detail) {
    store.set('rootValueDateModels', detail.rootValueDateModels);
    store.set('transactionData', [
      // Include the provided JSON data here or fetch it dynamically
      {
        "rootPortfolioEntryId": "345de493-72f5-4357-8a7e-006fbf0615e6",
        "valueType": "Market value",
        "convertedValueDate": "2025-01-21T14:51:42.3532002+02:00",
        "currencyAbbreviation": "ZAR",
        "totalConvertedAmount": 748007.48,
        "valueModels": [
          {
            "portfolioEntryId": "43d1c072-c077-4e18-8bcb-a4ee3d839a35",
            "valueDate": "2025-01-21T00:00:00",
            "exchangeRate": 1.0,
            "convertedAmount": 748007.48,
            "portfolioSharePercentage": 100.0
          }
        ]
      }
    ]);
    router.navigate('/transaction-history');
  }

  handleSearchInput(event) {
    this.searchQuery = event.target.value.toLowerCase(); // Update search query
  }

  getFilteredDetails() {
    if (!this.searchQuery) return this.detailModels;

    // Filter by instrumentName
    return this.detailModels.filter((detail) =>
      detail.instrumentName?.toLowerCase().includes(this.searchQuery)
    );
  }

  renderDetailModel(detail) {
    const {
      instrumentName,
      referenceNumber,
      inceptionDate,
      initialContributionAmount,
      initialContributionCurrencyAbbreviation,
      regularContributionAmount,
      regularContributionCurrencyAbbreviation,
      regularContributionFrequency,
      regularContributionEscalationPercentage,
      regularWithdrawalAmount,
      regularWithdrawalPercentage,
      regularWithdrawalCurrencyAbbreviation,
      regularWithdrawalFrequency,
      regularWithdrawalEscalationPercentage,
      reportNotes,
      portfolioEntryTreeModels = [], // Ensure this defaults to an empty array
    } = detail;

    // Format the inception date
    const formattedInceptionDate = inceptionDate
      ? new Date(inceptionDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
      : 'N/A';

    return html`
<div class="quote-card">
  <!-- Header with Blue Background -->
  <div class="header">
    <div>
      <h3>${instrumentName || 'N/A'}</h3>
      <p>Reference Number: ${referenceNumber || 'N/A'}</p>
    </div>
    <div class="date">
      <h4>Inception Date: ${formattedInceptionDate || 'N/A'}</h4>
    </div>
  </div>

  <!-- Stats Section -->
  <div class="stats">
  <button @click="${() => this.navigateToTransactionHistory(detail)}">
  View Transaction History
</button>

    <div>
      <h4>${initialContributionAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || 'N/A'}</h4>
      <p>Initial Contribution</p>
    </div>
    <div>
      <h4>${regularContributionAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || 'N/A'}</h4>
      <p>Regular Contribution</p>
    </div>
    <div>
      <h4>${regularWithdrawalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || 'N/A'}</h4>
      <p>Regular Withdrawal</p>
    </div>
  </div>

  <!-- More Info Dropdown -->
  <div class="footer">
    <details>
      <summary>More Info</summary>
      <div class="more-info">
        <table>
          <thead>
            <tr>
              <th>Instrument Name</th>
              <th>ISIN Number</th>
              <th>One Year Return</th>
              <th>Three Year Returns</th>
            </tr>
          </thead>
          <tbody>
            ${portfolioEntryTreeModels.length > 0
        ? portfolioEntryTreeModels.map(
          (entry) => html`
                    <tr>
                      <td>${entry.instrumentName || 'N/A'}</td>
                      <td>${entry.isinNumber || 'N/A'}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  `
        )
        : html`
                  <tr>
                    <td colspan="4">No data available</td>
                  </tr>
                `}
          </tbody>
        </table>
      </div>
    </details>
  </div>
</div>
    `;
  }

  render() {
    const filteredDetails = this.getFilteredDetails(); // Get filtered models

    return html`
      <h1>Products</h1>
      <div class="back-button">
        <button class="button" @click="${() => this.navigateBack()}">Back</button>
      </div>
      <input
        type="text"
        placeholder="Search by Portfolio Name..."
        @input="${this.handleSearchInput}"
        .value="${this.searchQuery}"
      />
      <div class="container">
        ${filteredDetails.map((detail) => this.renderDetailModel(detail))}
      </div>
    `;
  }
}

customElements.define('product-view', Products);