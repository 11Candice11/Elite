import { LitElement, html, css } from 'lit';

class Transactions extends LitElement {
  static styles = css`
    .container {
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .transaction-item {
      margin-bottom: 10px;
      padding: 10px;
      border-bottom: 1px solid #ccc;
    }
    .filter-container {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
    }
    .filters {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    input,
    select {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    .chips {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      margin-bottom: 15px;
    }
    .chip {
      display: flex;
      align-items: center;
      background: #007bff;
      color: white;
      padding: 5px 10px;
      border-radius: 15px;
      cursor: pointer;
    }
    .chip span {
      margin-right: 5px;
    }
    .chip:hover {
      background-color: #0056b3;
    }
    button {
      padding: 10px;
      margin-top: 15px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
  `;

  static properties = {
    transactions: { type: Array },
    filteredTransactions: { type: Array },
    filters: { type: Object },
  };

  constructor() {
    super();
    this.transactions = [];
    this.filteredTransactions = [];
    this.filters = {
      transactionDateStart: '',
      transactionDateEnd: '',
      currencyRange: [0, 0], // Start at 0
      exchangeRate: '',
      transactionType: '',
    };
  }

  connectedCallback() {
    super.connectedCallback();

    // Example transactions
    this.transactions = [
      {
        portfolioEntryId: '123e4567-e89b-12d3-a456-426614174000',
        transactionType: 'Contribution',
        transactionDate: '2023-01-01',
        currencyAbbreviation: 'USD',
        exchangeRate: 1.2,
        convertedAmount: 1200.0,
      },
      {
        portfolioEntryId: '123e4567-e89b-12d3-a456-426614174001',
        transactionType: 'Withdrawal',
        transactionDate: '2023-02-15',
        currencyAbbreviation: 'USD',
        exchangeRate: 1.1,
        convertedAmount: 1100.0,
      },
    ];
    this.filteredTransactions = [...this.transactions];
  }

  updateFilter(key, value) {
    this.filters[key] = value;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredTransactions = this.transactions.filter((txn) => {
      const { transactionDateStart, transactionDateEnd, currencyRange, exchangeRate, transactionType } = this.filters;

      // Filter by transactionDate
      if (
        transactionDateStart &&
        new Date(txn.transactionDate) < new Date(transactionDateStart)
      ) {
        return false;
      }
      if (
        transactionDateEnd &&
        new Date(txn.transactionDate) > new Date(transactionDateEnd)
      ) {
        return false;
      }

      // Filter by currency range
      if (
        txn.convertedAmount < currencyRange[0] ||
        txn.convertedAmount > currencyRange[1]
      ) {
        return false;
      }

      // Filter by exchange rate
      if (exchangeRate && txn.exchangeRate !== parseFloat(exchangeRate)) {
        return false;
      }

      // Filter by transactionType
      if (
        transactionType &&
        !txn.transactionType
          .toLowerCase()
          .includes(transactionType.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }

  removeFilter(key) {
    const inputField = this.shadowRoot.querySelector(`#${key}`);
    if (inputField) {
      inputField.value = '';
    }

    if (key === 'currencyRange') {
      this.filters[key] = [0, 0]; // Reset to 0
    } else {
      this.filters[key] = '';
    }
    this.applyFilters();
  }

  renderFilters() {
    return html`
      <div class="filter-container">
        <h4>Filters</h4>
        <div class="chips">
          ${Object.entries(this.filters)
            .filter(([key, value]) =>
              key === 'currencyRange'
                ? value[1] > 0 // Only show chip if currencyRange has a non-zero upper limit
                : value && value.length > 0
            )
            .map(
              ([key, value]) => html`
                <div class="chip" @click="${() => this.removeFilter(key)}">
                  <span>${key}: ${Array.isArray(value) ? value.join(' - ') : value}</span>
                  &times;
                </div>
              `
            )}
        </div>
        <div class="filters">
          <input
            id="transactionDateStart"
            type="date"
            @change="${(e) => this.updateFilter('transactionDateStart', e.target.value)}"
            placeholder="Start Date"
          />
          <input
            id="transactionDateEnd"
            type="date"
            @change="${(e) => this.updateFilter('transactionDateEnd', e.target.value)}"
            placeholder="End Date"
          />
          <div>
            <label for="currencyRange">Currency Range:</label>
            <input
              id="currencyRange"
              type="range"
              min="0"
              max="10000"
              value="${this.filters.currencyRange[1]}"
              @input="${(e) =>
                this.updateFilter('currencyRange', [0, parseInt(e.target.value, 10)])}"
            />
            <span>${this.filters.currencyRange[1]}</span>
          </div>
          <input
            id="exchangeRate"
            type="text"
            @input="${(e) => this.updateFilter('exchangeRate', e.target.value)}"
            placeholder="Exchange Rate"
          />
          <input
            id="transactionType"
            type="text"
            @input="${(e) => this.updateFilter('transactionType', e.target.value)}"
            placeholder="Transaction Type"
          />
        </div>
      </div>
    `;
  }

  navigateBack() {
    this.dispatchEvent(
      new CustomEvent('navigate', {
        detail: { view: 'home' },
        bubbles: true,
        composed: true,
      })
    );
  }

  renderTransactions() {
    return html`
      <div>
        <h4>Transaction Details</h4>
        ${this.filteredTransactions.map(
          (txn) => html`
            <div class="transaction-item">
              <p><strong>Portfolio Entry ID:</strong> ${txn.portfolioEntryId || 'N/A'}</p>
              <p><strong>Transaction Type:</strong> ${txn.transactionType || 'N/A'}</p>
              <p><strong>Transaction Date:</strong> ${txn.transactionDate || 'N/A'}</p>
              <p><strong>Currency Abbreviation:</strong> ${txn.currencyAbbreviation || 'N/A'}</p>
              <p><strong>Exchange Rate:</strong> ${txn.exchangeRate?.toFixed(2) || 'N/A'}</p>
              <p><strong>Converted Amount:</strong> ${txn.convertedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || 'N/A'}</p>
            </div>
          `
        )}
      </div>
    `;
  }

  render() {
    return html`
      <div class="container">
        ${this.renderFilters()}
        ${this.renderTransactions()}
        <button @click="${this.navigateBack}">Back</button>
      </div>
    `;
  }
}

customElements.define('transactions-view', Transactions);