import { LitElement, html, css } from 'lit';
import { router } from '/src/shell/Routing.js'
import { ViewBase } from './ViewBase.js';
class Portfolio extends ViewBase {
  static styles = css`
    .container {
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .portfolio-item {
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
    portfolio: { type: Object },
  };

  constructor() {
    super();
    this.portfolio = {};
  }

  connectedCallback() {
    super.connectedCallback();

    // Simulated example - replace this with the actual data fetching or shared state logic
    this.portfolio = {
      portfolioEntryId: "123e4567-e89b-12d3-a456-426614174000",
      parentPortfolioEntryId: "123e4567-e89b-12d3-a456-426614174001",
      rootPortfolioEntryId: "123e4567-e89b-12d3-a456-426614174002",
      level: 2,
      isRoot: false,
      isLowestLevel: true,
      instrumentName: "Global Equities Portfolio",
      isinNumber: "US1234567890",
      morningStarId: "MST12345",
    };
  }

  renderPortfolio() {
    const {
      portfolioEntryId,
      parentPortfolioEntryId,
      rootPortfolioEntryId,
      level,
      isRoot,
      isLowestLevel,
      instrumentName,
      isinNumber,
      morningStarId,
    } = this.portfolio;

    return html`
      <div class="portfolio-item">
        <h4>Portfolio Information</h4>
        <p><strong>Portfolio Entry ID:</strong> ${portfolioEntryId || "N/A"}</p>
        <p><strong>Parent Portfolio Entry ID:</strong> ${parentPortfolioEntryId || "N/A"}</p>
        <p><strong>Root Portfolio Entry ID:</strong> ${rootPortfolioEntryId || "N/A"}</p>
        <p><strong>Level:</strong> ${level || "N/A"}</p>
        <p><strong>Is Root:</strong> ${isRoot ? "Yes" : "No"}</p>
        <p><strong>Is Lowest Level:</strong> ${isLowestLevel ? "Yes" : "No"}</p>
        <p><strong>Instrument Name:</strong> ${instrumentName || "N/A"}</p>
        <p><strong>ISIN Number:</strong> ${isinNumber || "N/A"}</p>
        <p><strong>MorningStar ID:</strong> ${morningStarId || "N/A"}</p>
      </div>
    `;
  }

  render() {
    return html`
      <div class="container">
        <h2>Portfolio Details</h2>
        ${this.renderPortfolio()}
        <button @click="${super.navigateBack}">Back</button>
      </div>
    `;
  }
}

customElements.define('portfolio-view', Portfolio);