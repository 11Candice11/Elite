import { LitElement, html, css } from 'lit';
import { ViewBase } from './ViewBase.js';
import { store } from '/src/store/EliteStore.js';

class Transactions extends ViewBase {
  static styles = css`
    .container {
      padding: 20px;
      background-color: #f9f9f9;
    }
    .instrument-section {
      margin-bottom: 20px;
    }
    .instrument-header {
      background-color: #007bff;
      color: white;
      padding: 10px;
      font-size: 1.2em;
      font-weight: bold;
      border-radius: 5px;
      margin-bottom: 10px;
    }
    .transaction-card {
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      background-color: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;
    }
    .transaction-card-content {
      padding: 15px;
    }
    .month-group {
      margin-top: 20px;
    }
    .portfolio-group {
      margin-bottom: 30px;
    }
    
    .portfolio-name {
      font-size: 1.8em;
      color: #007bff;
      margin-bottom: 15px;
    }
    
    .month-group h3 {
      font-size: 1.5em;
      color: #333;
      margin-bottom: 10px;
    }
    
    .transaction-card {
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      background-color: white;
      overflow: hidden;
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
    }
    
    .transaction-card-header {
      background-color: #007bff;
      color: white;
      font-size: 1.2em;
      font-weight: bold;
      padding: 10px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    
    .transaction-card-content {
      padding: 15px;
    }
    .transaction-card-content p {
      margin: 5px 0;
    }
    .month-group h3 {
      margin-bottom: 10px;
      font-size: 1.5em;
      color: #007bff;
    }
    
    .transaction-card-header {
      background-color: #007bff;
      color: white;
      font-size: 1.2em;
      font-weight: bold;
      padding: 10px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    .transaction-card {
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      background-color: white;
      overflow: hidden;
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
    }
    .transaction-card-content {
      padding: 15px;
    }
    .transaction-card-content p {
      margin: 5px 0;
    }
    .instrument-section {
      margin-bottom: 20px;
    }
    .instrument-header {
      background-color: #007bff;
      color: white;
      padding: 10px;
      font-size: 1.2em;
      font-weight: bold;
      border-radius: 5px;
      margin-bottom: 10px;
    }
    .transaction-card {
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      background-color: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;
    }
    .transaction-card-content {
      padding: 15px;
    }
    .transaction-card-content p {
      margin: 5px 0;
    }
    input[type='text'] {
      width: 100%;
      padding: 10px;
      margin-bottom: 20px;
      font-size: 1em;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    button {
      margin-bottom: 20px;
      padding: 10px;
      border: none;
      background-color: #007bff;
      color: white;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
  `;

  static properties = {
    groupedTransactions: { type: Object },
    searchQuery: { type: String },
    startDate: { type: String },
    endDate: { type: String }  
  };

  constructor() {
    super();
    this.groupedTransactions = {};
    this.searchQuery = '';
    this.startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]; // Default to 1 year ago
    this.endDate = new Date().toISOString().split('T')[0]; // Default to today
  
    const clientInfo = store.get('clientInfo') || {};

    if (clientInfo && Array.isArray(clientInfo.detailModels)) {
      // Group transactions by instrumentName
      clientInfo.detailModels.forEach((detail) => {
        const instrumentName = detail.instrumentName;
        if (!this.groupedTransactions[instrumentName]) {
          this.groupedTransactions[instrumentName] = [];
        }
        if (detail.transactionModels && Array.isArray(detail.transactionModels)) {
          this.groupedTransactions[instrumentName].push(...detail.transactionModels);
        }
        this.groupedTransactions[instrumentName].instrumentName = instrumentName;
      });
    }
  }

  getFilteredTransactions() {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
  
    const groupedByMonth = new Map();
  
    Object.entries(this.groupedTransactions).forEach(([instrumentName, transactions]) => {
      transactions
        .filter((txn) => {
          const txnDate = new Date(txn.transactionDate);
          return txnDate >= startDate && txnDate <= endDate;
        })
        .sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)) // Sort by date
        .forEach((txn) => {
          const txnDate = new Date(txn.transactionDate);
          const monthYear = txnDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  
          if (!groupedByMonth.has(monthYear)) {
            groupedByMonth.set(monthYear, []);
          }
          groupedByMonth.get(monthYear).push(txn);
        });
    });
  
    return groupedByMonth;
  }

  handleSearchInput(event) {
    this.searchQuery = event.target.value;
  }

  renderGroupedTransactions() {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
  
    const filteredAndGrouped = {};
  
    // Filter and group transactions by portfolio and then by month
    Object.entries(this.groupedTransactions).forEach(([portfolioName, transactions]) => {
      const groupedByMonth = {};
  
      transactions
        .filter((txn) => {
          const txnDate = new Date(txn.transactionDate);
          return txnDate >= startDate && txnDate <= endDate;
        })
        .sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)) // Sort by date
        .forEach((txn) => {
          const txnDate = new Date(txn.transactionDate);
          const monthYear = txnDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  
          if (!groupedByMonth[monthYear]) {
            groupedByMonth[monthYear] = [];
          }
          groupedByMonth[monthYear].push(txn);
        });
  
      if (Object.keys(groupedByMonth).length > 0) {
        filteredAndGrouped[portfolioName] = groupedByMonth;
      }
    });
  
    // Render filtered and grouped transactions
    return html`
      ${Object.entries(filteredAndGrouped).map(
        ([portfolioName, transactionsByMonth]) => html`
          <div class="portfolio-group">
            <h2 class="portfolio-name">${portfolioName}</h2>
            ${Object.entries(transactionsByMonth).map(
              ([monthYear, transactions]) => html`
                <div class="month-group">
                  <h3>${monthYear}</h3>
                  ${transactions.map(
                    (txn) => html`
                      <div class="transaction-card">
                        <div class="transaction-card-header">
                          ${portfolioName}
                        </div>
                        <div class="transaction-card-content">
                          <p><strong>Portfolio Entry ID:</strong> ${txn.portfolioEntryId || 'N/A'}</p>
                          <p><strong>Transaction Date:</strong> ${new Date(txn.transactionDate).toLocaleDateString()}</p>
                          <p><strong>Transaction Type:</strong> ${txn.transactionType || 'N/A'}</p>
                          <p><strong>Currency:</strong> ${txn.currencyAbbreviation || 'N/A'}</p>
                          <p><strong>Exchange Rate:</strong> ${txn.exchangeRate?.toFixed(2) || 'N/A'}</p>
                          <p><strong>Converted Amount:</strong> ${txn.convertedAmount?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          }) || 'N/A'}</p>
                        </div>
                      </div>
                    `
                  )}
                </div>
              `
            )}
          </div>
        `
      )}
    `;
  }

  render() {
    return html`
      <div class="container">
        <button @click="${super.navigateBack}">Back</button>
        <h2>Transactions</h2>
        <div>
          <label for="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            .value="${this.startDate}"
            @change="${(e) => (this.startDate = e.target.value)}"
          />
          <label for="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            .value="${this.endDate}"
            @change="${(e) => (this.endDate = e.target.value)}"
          />
        </div>
        <input
          type="text"
          placeholder="Search by Portfolio Name..."
          @input="${this.handleSearchInput}"
          .value="${this.searchQuery}"
        />
        ${this.renderGroupedTransactions()}
      </div>
    `;
  }
}

customElements.define('transactions-view', Transactions);