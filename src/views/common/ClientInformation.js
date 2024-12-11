import { LitElement, html, css } from 'lit';

class ClientInformation extends LitElement {
  static styles = css`
    .container {
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .detail-item {
      margin-bottom: 10px;
      padding: 10px;
      border-bottom: 1px solid #ccc;
    }
    h4 {
      margin-bottom: 5px;
    }
    button {
      margin-top: 15px;
      padding: 10px;
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
    detailModel: { type: Object },
  };

  constructor() {
    super();
    this.detailModel = {};
  }

  connectedCallback() {
    super.connectedCallback();

    // Simulated example - replace with actual data logic
    this.detailModel = {
      instrumentName: "Sample Instrument",
      productDescription: "Description of Product",
      reportingName: "Reporting Name",
      referenceNumber: "REF123456",
      inceptionDate: "2023-01-01",
      initialContributionAmount: 100000,
      initialContributionCurrencyAbbreviation: "USD",
      regularContributionAmount: 500,
      regularContributionCurrencyAbbreviation: "USD",
      regularContributionFrequency: "Monthly",
      regularContributionEscalationPercentage: 5,
      regularWithdrawalAmount: 100,
      regularWithdrawalPercentage: 1,
      regularWithdrawalCurrencyAbbreviation: "USD",
      regularWithdrawalFrequency: "Monthly",
      regularWithdrawalEscalationPercentage: 2,
      reportNotes: "This is a sample report note.",
    };
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

  renderDetailModel() {
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
    } = this.detailModel;

    return html`
      <div class="detail-item">
        <h4>Detail Information</h4>
        <p><strong>Instrument Name:</strong> ${instrumentName || "N/A"}</p>
        <p><strong>Product Description:</strong> ${productDescription || "N/A"}</p>
        <p><strong>Reporting Name:</strong> ${reportingName || "N/A"}</p>
        <p><strong>Reference Number:</strong> ${referenceNumber || "N/A"}</p>
        <p><strong>Inception Date:</strong> ${inceptionDate || "N/A"}</p>
        <p><strong>Initial Contribution Amount:</strong> ${initialContributionAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "N/A"} (${initialContributionCurrencyAbbreviation || "N/A"})</p>
        <p><strong>Regular Contribution Amount:</strong> ${regularContributionAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "N/A"} (${regularContributionCurrencyAbbreviation || "N/A"})</p>
        <p><strong>Regular Contribution Frequency:</strong> ${regularContributionFrequency || "N/A"}</p>
        <p><strong>Regular Contribution Escalation %:</strong> ${regularContributionEscalationPercentage || "N/A"}%</p>
        <p><strong>Regular Withdrawal Amount:</strong> ${regularWithdrawalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "N/A"} (${regularWithdrawalCurrencyAbbreviation || "N/A"})</p>
        <p><strong>Regular Withdrawal %:</strong> ${regularWithdrawalPercentage || "N/A"}%</p>
        <p><strong>Regular Withdrawal Frequency:</strong> ${regularWithdrawalFrequency || "N/A"}</p>
        <p><strong>Regular Withdrawal Escalation %:</strong> ${regularWithdrawalEscalationPercentage || "N/A"}%</p>
        <p><strong>Report Notes:</strong> ${reportNotes || "N/A"}</p>
      </div>
    `;
  }

  render() {
    return html`
      <div class="container">
        <h2>Client Information</h2>
        ${this.renderDetailModel()}
        <button @click="${this.navigateBack}">Back</button>
      </div>
    `;
  }
}

customElements.define('client-information', ClientInformation);