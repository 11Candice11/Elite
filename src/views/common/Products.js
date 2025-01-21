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
    background-color: #f7f9fc;
    margin: 0;
    padding: 20px;
  }
  
  .quote-card {
    width: 100%;
    max-width: 1000px;
    margin: 20px auto;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    background-color: #dbeafe; /* Soft Blue Background */
    color: #222222;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 8px 8px 0 0; /* Round the top corners */
    margin: -20px -20px 20px -20px; /* Extend header across the card */
  }
  
  .header h3 {
    margin: 0;
    font-size: 18px;
    color: #222222;
  }
  
  .header p {
    margin: 0;
    font-size: 14px;
    color: #222222;
  }
  
  .date {
    text-align: right;
  }
  
  .date h4 {
    margin: 0;
    font-size: 16px;
    color: #222222;
  }
  
  .stats {
    display: flex;
    justify-content: space-between;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .stats div {
    flex: 1;
    padding: 10px;
  }
  
  .stats div p {
    margin: 5px 0;
    font-size: 14px;
    color: #333;
  }
  
  .stats div h4 {
    margin: 0;
    font-size: 16px;
    // color: #D4FF00;
  }
  
  .footer {
    margin-top: 10px;
  }
  
  footer details {
    font-size: 14px;
    color: #D4FF00;
    cursor: pointer;
  }
  
  footer details summary {
    font-size: 14px;
    color: #D4FF00;
    cursor: pointer;
    list-style: none;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  
  thead th {
    background-color: #dbeafe; /* Soft Blue for Table Header */
    color: white;
    padding: 10px;
    text-align: left;
  }
  
  tbody td {
    padding: 10px;
    border: 1px solid #ccc;
  }
  
  tbody tr:nth-child(odd) {
    background-color: #f9f9f9;
  }
  
  .more-info {
    margin-top: 10px;
  }
  .back-button {
    margin: 10px;
  }
  input{
    width: 300px;
    height: 30px;
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