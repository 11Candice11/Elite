import { LitElement, html, css } from 'lit';
import { store } from '/src/store/EliteStore.js';
import { ViewBase } from './ViewBase.js';
import { router } from '/src/shell/Routing.js';

export class RootTransactionHistory extends ViewBase {
  static styles = [
    ViewBase.styles,
    css`
    :host {
      display: block;
      background-color: #EAEAE0;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .transaction-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin: 20px;
      border-left: 5px solid #1DC690; 
    }

    .header {
      background-color: #278ABD; 
      color: white;
      padding: 15px;
      border-radius: 8px 8px 0 0;
    }

    .content {
      padding: 15px;
    }

    .value-section {
      display: flex;
      justify-content: space-around;
      background-color: #F9F9F9;
      padding: 10px;
      border-radius: 8px;
    }

    button {
      background-color: #1DC690; 
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
    }

    button:hover {
      background-color: #1C4670; 
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background-color: #278ABD;
      color: white;
      padding: 10px;
    }

    td {
      padding: 10px;
      border: 1px solid #ccc;
    }

    tbody tr:nth-child(odd) {
      background-color: #F9F9F9;
    }
    `,
  ];

  static properties = {
    rootValueDateModels: { type: Array },
  };

  constructor() {
    super();
    this.rootValueDateModels = [];
  }

  connectedCallback() {
    super.connectedCallback();
    const data = store.get('rootValueDateModels') || [];

    // ✅ Check if it's a string (deserialize if needed), else assign directly
    if (typeof data === 'string') {
      try {
        this.rootValueDateModels = JSON.parse(data);
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        this.rootValueDateModels = []; // Fallback
      }
    } else {
      this.rootValueDateModels = data; // Direct assignment if already an object
    }
  
    console.log("Transaction data:", this.rootValueDateModels);
}

  renderTransaction(model) {
    return html`
      <div class="transaction-card">
        <div class="header">Market Value on ${new Date(model.convertedValueDate).toLocaleDateString()}</div>
        <div class="content">
          <div class="value-section">
            <div><strong>Currency:</strong> ${model.currencyAbbreviation}</div>
            <div><strong>Total Amount:</strong> ${model.totalConvertedAmount.toLocaleString()}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Portfolio ID</th>
                <th>Value Date</th>
                <th>Exchange Rate</th>
                <th>Converted Amount</th>
                <th>Share %</th>
              </tr>
            </thead>
            <tbody>
              ${model.valueModels.map(
                (value) => html`
                  <tr>
                    <td>${value.portfolioEntryId}</td>
                    <td>${new Date(value.valueDate).toLocaleDateString()}</td>
                    <td>${value.exchangeRate}</td>
                    <td>${value.convertedAmount.toLocaleString()}</td>
                    <td>${value.portfolioSharePercentage}%</td>
                  </tr>
                `
              )}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <button class="back-button" @click="${this.navigateBack}">⬅ Back to Products</button>
      <h1>Interaction History</h1>
      ${this.rootValueDateModels.length > 0
        ? this.rootValueDateModels.map((model) => this.renderTransaction(model))
        : html`<p>No transactions found for this portfolio.</p>`}
    `;
  }
}

customElements.define('root-transaction-history', RootTransactionHistory);