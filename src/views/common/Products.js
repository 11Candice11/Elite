import { LitElement, html, css } from 'lit';
import { store } from '/src/store/EliteStore.js';
import { ViewBase } from './ViewBase.js';
import { router } from '/src/shell/Routing.js';

class Products extends ViewBase {
  static styles = css`
    .container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .back-button {
      display: flex;
      justify-content: flex-start;
      padding: 10px;
      margin-bottom: 20px;
    }
    .back-button button {
      padding: 10px 15px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .back-button button:hover {
      background-color: #0056b3;
    }
    .card {
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      background-color: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .card-header {
      background-color: #007bff;
      color: white;
      padding: 10px;
      font-size: 1.2em;
      font-weight: bold;
    }
    .card-content {
      padding: 15px;
    }
    .card-content p {
      margin: 5px 0;
    }
    .divider {
      border-top: 1px solid #ccc;
      margin: 10px 0;
    }
    input[type='text'] {
      width: 100%;
      padding: 10px;
      margin-bottom: 20px;
      font-size: 1em;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
  `;

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
      productDescription,
      reportingName,
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
    } = detail;

    return html`
      <div class="card">
        <div class="card-header">${instrumentName || 'N/A'}</div>
        <div class="card-content">
          <p><strong>Product Description:</strong> ${productDescription || 'N/A'}</p>
          <p><strong>Reporting Name:</strong> ${reportingName || 'N/A'}</p>
          <p><strong>Reference Number:</strong> ${referenceNumber || 'N/A'}</p>
          <p><strong>Inception Date:</strong> ${inceptionDate || 'N/A'}</p>
          <p><strong>Initial Contribution Amount:</strong> 
            ${initialContributionAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || 'N/A'} 
            (${initialContributionCurrencyAbbreviation || 'N/A'})
          </p>
          <div class="divider"></div>
          <p><strong>Regular Contribution:</strong> 
            ${regularContributionAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || 'N/A'} 
            (${regularContributionCurrencyAbbreviation || 'N/A'})
          </p>
          <p><strong>Frequency:</strong> ${regularContributionFrequency || 'N/A'}</p>
          <p><strong>Escalation %:</strong> ${regularContributionEscalationPercentage || 'N/A'}%</p>
          <div class="divider"></div>
          <p><strong>Regular Withdrawal:</strong> 
            ${regularWithdrawalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || 'N/A'} 
            (${regularWithdrawalCurrencyAbbreviation || 'N/A'})
          </p>
          <p><strong>Percentage:</strong> ${regularWithdrawalPercentage || 'N/A'}%</p>
          <p><strong>Frequency:</strong> ${regularWithdrawalFrequency || 'N/A'}</p>
          <p><strong>Escalation %:</strong> ${regularWithdrawalEscalationPercentage || 'N/A'}%</p>
          <p><strong>Report Notes:</strong> ${reportNotes || 'N/A'}</p>
        </div>
        <p><strong>Report Notes:</strong> ${reportNotes || 'N/A'}</p>
<div class="divider"></div>
<button @click="${() => this.navigateToMoreInfo(detail.portfolioEntryTreeModels)}">More Info</button>
      </div>
    `;
  }

  render() {
    const filteredDetails = this.getFilteredDetails(); // Get filtered models

    return html`
      <h1>Products</h1>
      <div class="back-button">
        <button @click="${() => this.navigateBack()}">Back</button>
      </div>
      <input
        type="text"
        placeholder="Search by Instrument Name..."
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