import { LitElement, html, css } from 'lit';
import { ViewBase } from './ViewBase.js';
import { store } from '/src/store/EliteStore.js';

class Transactions extends ViewBase {
  static styles = [
    ViewBase.styles,
    css`
      :host {
        display: block;
        background-color: #EAEAE0;
        color: #1C4670;
        padding: 20px;
        font-family: 'Arial', sans-serif;
      }

      .container {
        max-width: 900px;
        margin: 0 auto;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        padding: 20px;
      }

      h2 {
        color: #1DC690;
        text-align: center;
        margin-bottom: 20px;
      }

      .instrument-group {
        margin-bottom: 30px;
      }

      .instrument-header {
        background-color: #278ABD;
        color: white;
        padding: 12px;
        font-weight: bold;
        border-radius: 8px 8px 0 0;
      }

      .transaction-card {
        background-color: #FFFFFF;
        border: 2px solid #278ABD;
        border-radius: 8px;
        padding: 15px;
        margin: 10px 0;
        transition: box-shadow 0.3s ease;
      }

      .transaction-card:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }

      .transaction-details {
        padding: 15px;
        background-color: #F9F9F9;
        border-radius: 0 0 6px 6px;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px solid #ccc;
      }

      .detail-item:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: bold;
        color: #1C4670;
      }

      .value {
        color: #333;
      }

      button {
        background-color: #278ABD;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
        margin: 10px 0;
      }

      button:hover {
        background-color: #1C4670;
      }

      .empty-message {
        text-align: center;
        color: #888;
        padding: 20px;
        background-color: #f4f4f4;
        border-radius: 8px;
      }
    `
  ];

  static properties = {
    groupedTransactions: { type: Object }
  };

  constructor() {
    super();
    this.groupedTransactions = {};
    this.loadTransactions();
  }

  loadTransactions() {
    const clientInfo = store.get('clientInfo');
    console.log('Client Info:', clientInfo);

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

    console.log('Grouped Transactions:', this.groupedTransactions);
  }

  render() {
    return html`
      <div class="container">
        <button @click="${super.navigateBack}">Back</button>
        <h2>Transaction History</h2>

        ${Object.keys(this.groupedTransactions).length === 0
          ? html`<div class="empty-message">No transactions available.</div>`
          : Object.entries(this.groupedTransactions).map(([instrumentName, transactions]) => html`
              <div class="instrument-group">
                <div class="instrument-header">${instrumentName}</div>
                ${transactions.map(transaction => html`
                  <div class="transaction-card">
                    <div class="transaction-details">
                      <div class="detail-item">
                        <span class="label">Date:</span>
                        <span class="value">${transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">Amount:</span>
                        <span class="value">
                          ${transaction.convertedAmount !== undefined
                            ? transaction.convertedAmount.toLocaleString('en-ZA', {
                                style: 'currency',
                                currency: transaction.currencyAbbreviation || 'ZAR'
                              })
                            : 'N/A'}
                          (${transaction.currencyAbbreviation || 'ZAR'})
                        </span>
                      </div>
                      <div class="detail-item">
                        <span class="label">Currency:</span>
                        <span class="value">${transaction.currencyAbbreviation || 'ZAR'}</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">Exchange Rate:</span>
                        <span class="value">${transaction.exchangeRate ? transaction.exchangeRate.toFixed(2) : 'N/A'}</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">Transaction Type:</span>
                        <span class="value">${transaction.transactionType || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                `)}
              </div>
            `)
        }
      </div>
    `;
  }
}

customElements.define('transactions-view', Transactions);