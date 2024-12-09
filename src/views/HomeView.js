import { LitElement, html, css } from 'lit';

class HomeView extends LitElement {
  static styles = css`
    .container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      padding: 20px;
    }
    .section {
      border: 1px solid #ccc;
      padding: 15px;
      border-radius: 5px;
      background: #f9f9f9;
    }
    .section h3 {
      margin-top: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table, th, td {
      border: 1px solid #ccc;
    }
    th, td {
      padding: 10px;
      text-align: left;
    }
  `;

  static properties = {
    clientInfo: { type: Object },
    detailModels: { type: Array },
  };

  constructor() {
    super();
    this.clientInfo = {};
    this.detailModels = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchData();
  }

  async fetchData() {
    const request = {
      idNumber: this.idNumber
    };

    const returnvalue = this.clientService.getClientProfile(request);

    const response = {
      EntityModels: [
        {
          FirstNames: "Brian",
          Surname: "Wilmot",
          RegisteredName: "Wilmot",
          Title: "Mr",
          Nickname: "Brian",
          AdvisorName: "Tancred Melis",
          Email: "brianwwilmot@gmail.com",
          CellPhoneNumber: "+27 82 602 6159",
          DetailModels: [
            {
              InstrumentName: "Julius Baer Portfolio",
              ReferenceNumber: "031588990201",
              InceptionDate: "2017-11-03T00:00:00",
              InitialContributionAmount: 375633.0,
              InitialContributionCurrencyAbbreviation: "USD",
              RegularContributionAmount: 0.0,
              PortfolioEntryTreeModels: [
                { InstrumentName: "Global Equities", Level: 1 },
                { InstrumentName: "Cash - USD", Level: 1 },
              ],
              RootValueDateModels: [
                {
                  ValueType: "Market value",
                  ConvertedValueDate: "2022-08-02",
                  TotalConvertedAmount: 6754729.37,
                },
              ],
              TransactionModels: [
                { TransactionType: "Contribution", TransactionDate: "2021-03-02", ConvertedAmount: 1562646.4 },
              ],
              ReportNotes: "Value in USD as of 30/04/2024 $469 319.68",
            },
          ],
        },
      ],
    };

    const entity = response.EntityModels[0];
    this.clientInfo = {
      firstName: entity.FirstNames,
      surname: entity.Surname,
      registeredName: entity.RegisteredName,
      title: entity.Title,
      nickname: entity.Nickname,
      advisorName: entity.AdvisorName,
      email: entity.Email,
      cellPhone: entity.CellPhoneNumber,
    };
    this.detailModels = entity.DetailModels;
  }

  renderClientInfo() {
    const { firstName, surname, registeredName, title, nickname, advisorName, email, cellPhone } = this.clientInfo;
    return html`
      <div class="section">
        <h3>Client Information</h3>
        <p><strong>First Name:</strong> ${firstName || 'N/A'}</p>
        <p><strong>Surname:</strong> ${surname || 'N/A'}</p>
        <p><strong>Registered Name:</strong> ${registeredName || 'N/A'}</p>
        <p><strong>Title:</strong> ${title || 'N/A'}</p>
        <p><strong>Nickname:</strong> ${nickname || 'N/A'}</p>
        <p><strong>Advisor Name:</strong> ${advisorName || 'N/A'}</p>
        <p><strong>Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Cell Phone:</strong> ${cellPhone || 'N/A'}</p>
      </div>
    `;
  }

  renderPortfolioEntries(entries) {
    return html`
      <div>
        <h4>Portfolio Entries</h4>
        <ul>
          ${entries.map(
            (entry) => html`
              <li>${entry.InstrumentName || 'N/A'} (Level: ${entry.Level})</li>
            `
          )}
        </ul>
      </div>
    `;
  }

  renderRootValueDates(rootValues) {
    return html`
      <div>
        <h4>Root Value Dates</h4>
        <ul>
          ${rootValues.map(
            (value) => html`
              <li>
                <strong>Type:</strong> ${value.ValueType || 'N/A'}<br />
                <strong>Date:</strong> ${value.ConvertedValueDate || 'N/A'}<br />
                <strong>Total Amount:</strong>
                ${value.TotalConvertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </li>
            `
          )}
        </ul>
      </div>
    `;
  }

  renderTransactions(transactions) {
    return html`
      <div>
        <h4>Transactions</h4>
        <ul>
          ${transactions.map(
            (txn) => html`
              <li>
                <strong>Type:</strong> ${txn.TransactionType || 'N/A'}<br />
                <strong>Date:</strong> ${txn.TransactionDate || 'N/A'}<br />
                <strong>Amount:</strong>
                ${txn.ConvertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </li>
            `
          )}
        </ul>
      </div>
    `;
  }

  renderDetailModels() {
    return html`
      <div class="section">
        <h3>Detail Information</h3>
        ${this.detailModels.map(
          (detail) => html`
            <div>
              <h4>${detail.InstrumentName || 'N/A'}</h4>
              <p><strong>Reference Number:</strong> ${detail.ReferenceNumber || 'N/A'}</p>
              <p><strong>Inception Date:</strong> ${detail.InceptionDate || 'N/A'}</p>
              <p>
                <strong>Initial Contribution:</strong>
                ${detail.InitialContributionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                (${detail.InitialContributionCurrencyAbbreviation || 'N/A'})
              </p>
              <p><strong>Report Notes:</strong> ${detail.ReportNotes || 'N/A'}</p>
              ${this.renderPortfolioEntries(detail.PortfolioEntryTreeModels || [])}
              ${this.renderRootValueDates(detail.RootValueDateModels || [])}
              ${this.renderTransactions(detail.TransactionModels || [])}
            </div>
            <hr />
          `
        )}
      </div>
    `;
  }

  render() {
    return html`
      <div class="container">
        ${this.renderClientInfo()}
        ${this.renderDetailModels()}
      </div>
    `;
  }
}

customElements.define('home-view', HomeView);
