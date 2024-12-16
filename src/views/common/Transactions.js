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
    .transaction-card-content p {
      margin: 5px 0;
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
  };

  constructor() {
    super();
    this.groupedTransactions = {};
    const clientInfo = store.get('clientInfo') || {};

    if (clientInfo && Array.isArray(clientInfo.detailModels)) {
      // Group transactions by instrumentName
      clientInfo.detailModels.forEach((detail) => {
        const instrumentName = detail.instrumentName || 'Unknown Instrument';
        if (!this.groupedTransactions[instrumentName]) {
          this.groupedTransactions[instrumentName] = [];
        }
        if (detail.transactionModels && Array.isArray(detail.transactionModels)) {
          this.groupedTransactions[instrumentName].push(...detail.transactionModels);
        }
      });
    }
  }

  renderGroupedTransactions() {
    return html`
      ${Object.entries(this.groupedTransactions).map(
        ([instrumentName, transactions]) => html`
          <div class="instrument-section">
            <div class="instrument-header">${instrumentName}</div>
            ${transactions.map(
              (txn) => html`
                <div class="transaction-card">
                  <div class="transaction-card-content">
                    <p><strong>Portfolio Entry ID:</strong> ${txn.portfolioEntryId || 'N/A'}</p>
                    <p><strong>Transaction Date:</strong> ${txn.transactionDate || 'N/A'}</p>
                    <p><strong>Transaction Type:</strong> ${txn.transactionType || 'N/A'}</p>
                    <p><strong>Currency:</strong> ${txn.currencyAbbreviation || 'N/A'}</p>
                    <p><strong>Exchange Rate:</strong> ${txn.exchangeRate?.toFixed(2) || 'N/A'}</p>
                    <p><strong>Converted Amount:</strong> ${txn.convertedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || 'N/A'}</p>
                  </div>
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
        ${this.renderGroupedTransactions()}
      </div>
    `;
  }
}

customElements.define('transactions-view', Transactions);