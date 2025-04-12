import { ViewBase } from './ViewBase.js';
import { html, css } from 'lit';
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
    transactions: { type: Array }
  };

  constructor() {
    super();
    this.transactions = [];
    this.loadTransactions();
  }

  loadTransactions() {
    const clientInfo = store.get('clientInfo');
    const selectedInstrumentName = store.get('selectedPortfolio');
    const rawTransactions = selectedInstrumentName?.transactionModels || [];
    
    // Group transactions by date and sum amounts
    const groupedTransactions = rawTransactions.reduce((acc, transaction) => {
      const dateKey = new Date(transaction.transactionDate).toLocaleDateString();
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          transactionDate: transaction.transactionDate,
          convertedAmount: 0,
          currencyAbbreviation: transaction.currencyAbbreviation || 'ZAR',
          exchangeRate: transaction.exchangeRate || 'N/A',
          transactionType: transaction.transactionType || 'N/A'
        };
      }

      acc[dateKey].convertedAmount += transaction.convertedAmount;
      return acc;
    }, {});

    this.transactions = Object.values(groupedTransactions);
  }

  render() {
    return html`
      <div class="container">
        <button @click="${super.navigateBack}">Back</button>
        <h2>Transaction History</h2>

        ${this.transactions.length === 0
        ? html`<div class="empty-message">No transactions available for this portfolio.</div>`
        : this.transactions.map((transaction) => html`
              <div class="transaction-card">
                <div class="transaction-details">
                  <div class="detail-item">
                    <span class="label">Date:</span>
                    <span class="value">${new Date(transaction.transactionDate).toLocaleDateString()}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Amount:</span>
                    <span class="value">
                      ${transaction.convertedAmount.toLocaleString('en-ZA', {
                        style: 'currency',
                        currency: transaction.currencyAbbreviation
                      })}
                      (${transaction.currencyAbbreviation})
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Currency:</span>
                    <span class="value">${transaction.currencyAbbreviation}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Exchange Rate:</span>
                    <span class="value">${transaction.exchangeRate !== 'N/A' ? transaction.exchangeRate.toFixed(2) : 'N/A'}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Transaction Type:</span>
                    <span class="value">${transaction.transactionType}</span>
                  </div>
                </div>
              </div>
            `)}
      </div>
    `;
  }
}

customElements.define('transactions-view', Transactions);