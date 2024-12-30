import { LitElement, html, css } from 'lit';
import { ViewBase } from './ViewBase.js';
import { store } from '/src/store/EliteStore.js';

class Transactions extends ViewBase {
  static styles = css`
    .container {
      padding: 20px;
      background-color: #f9f9f9;
    }
    h2 {
      font-size: 1.8em;
      margin-bottom: 20px;
      color: #333;
    }
    input[type='date'],
    input[type='text'] {
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
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
    .portfolio-group {
      margin-top: 20px;
    }
    .portfolio-name {
      font-size: 1.5em;
      color: #007bff;
      margin-bottom: 10px;
    }
    .month-group {
      margin-top: 15px;
    }
    .transactions-container {
      display: flex;
      flex-direction: column;
      gap: 15px; /* Space between cards */
      padding: 10px;
    }    
    .transaction-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      padding: 15px;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      transition: transform 0.2s ease-in-out;
    }
    .transaction-card:hover {
      transform: translateY(-3px); /* Adds a lift effect on hover */
    }
    
        .transaction-card-header {
      background-color: #007bff;
      color: white;
      font-size: 1.2em;
      font-weight: bold;
      padding: 10px;
    }
    .transaction-card-content {
      padding: 15px;
    }
    .transaction-card-content p {
      margin: 5px 0;
      font-size: 0.95em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .transaction-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      gap: 20px; /* Space between transaction items */
    }
    
    .transaction-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: 1;
    }
        
    .transaction-item strong {
      color: #007bff; /* Highlighted titles */
      margin-right: 5px;
    }

.transaction-card-content p strong {
  color: #007bff; /* Highlighted titles */
}
    th, td {
      padding: 10px;
      border: 1px solid #ccc;
      text-align: left;
    }
    th {
      background-color: #007bff;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .header {
      font-size: 0.9em;
      font-weight: bold;
      text-decoration: underline;
      color: #007bff; /* Blue Header */
      margin-bottom: 5px;
    }
    
    .value {
      font-size: 0.95em;
      color: #000; /* Black Value */
      margin-bottom: 8px;
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
    this.startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
    this.endDate = new Date().toISOString().split('T')[0];

    const clientInfo = store.get('clientInfo') || {};

    if (clientInfo && Array.isArray(clientInfo.detailModels)) {
      clientInfo.detailModels.forEach((detail) => {
        const instrumentName = detail.instrumentName;
        if (!this.groupedTransactions[instrumentName]) {
          this.groupedTransactions[instrumentName] = [];
        }
        if (detail.transactionModels && Array.isArray(detail.transactionModels)) {
          this.groupedTransactions[instrumentName].push(...detail.transactionModels);
        }
      });
    }
  }

  getFilteredTransactions() {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    const searchLower = this.searchQuery.toLowerCase();
  
    const groupedByMonth = {};
  
    Object.entries(this.groupedTransactions).forEach(([portfolioName, transactions]) => {
      if (portfolioName.toLowerCase().includes(searchLower)) {
        const filteredTransactions = transactions
          .filter((txn) => {
            const txnDate = new Date(txn.transactionDate);
            return txnDate >= startDate && txnDate <= endDate;
          })
          .sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));
  
        if (filteredTransactions.length > 0) {
          groupedByMonth[portfolioName] = filteredTransactions.reduce((acc, txn) => {
            const txnDate = new Date(txn.transactionDate);
            const monthYear = txnDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  
            if (!acc[monthYear]) acc[monthYear] = [];
            acc[monthYear].push(txn);
            return acc;
          }, {});
        }
      }
    });
  
    return groupedByMonth;
  }

  handleSearchInput(event) {
    this.searchQuery = event.target.value;
    this.requestUpdate(); // Explicitly request a re-render
  }

  renderGroupedTransactions() {
    const filteredTransactions = this.getFilteredTransactions();
  
    return html`
      <div class="transactions-container">
        ${Object.entries(filteredTransactions)
          .flatMap(([portfolioName, transactionsByMonth]) =>
            Object.values(transactionsByMonth).flatMap((transactions) =>
              transactions.map(
                (txn) => html`
                  <div class="transaction-card">
                    <div class="portfolio-header">${portfolioName}</div>
                    <div class="transaction-row">
                      <div class="transaction-item">
                        <div class="header">Date:</div>
                        <div class="value">${new Date(txn.transactionDate).toLocaleDateString()}</div>
                      </div>
                      <div class="transaction-item">
                        <div class="header">Transaction Type:</div>
                        <div class="value">${txn.transactionType || 'N/A'}</div>
                      </div>
                      <div class="transaction-item">
                        <div class="header">Exchange Rate:</div>
                        <div class="value">${txn.exchangeRate?.toFixed(2) || 'N/A'}</div>
                      </div>
                      <div class="transaction-item">
                        <div class="header">Converted Amount:</div>
                        <div class="value">
                          ${txn.convertedAmount?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) || 'N/A'}
                        </div>
                      </div>
                      <div class="transaction-item">
                        <div class="header">Currency:</div>
                        <div class="value">${txn.currencyAbbreviation || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                `
              )
            )
          )}
      </div>
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