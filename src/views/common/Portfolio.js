import { LitElement, html, css } from 'lit';
import { router } from '/src/shell/Routing.js';
import { ViewBase } from './ViewBase.js';

class Portfolio extends ViewBase {
  static styles = css`
    .container {
      padding: 20px;
      background-color: #f9f9f9;
    }
    .portfolio-card {
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      background-color: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
    }
    .portfolio-card-header {
      background-color: #278AB0;
      color: white;
      padding: 10px;
      font-size: 1.2em;
      font-weight: bold;
    }
    .portfolio-card-content {
      padding: 15px;
    }
    .portfolio-card-content p {
      margin: 5px 0;
    }
    button {
      padding: 10px;
      margin-bottom: 15px;
      background-color: #278AB0;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background-color: #278AB0;
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
      <div class="portfolio-card">
        <div class="portfolio-card-header">${instrumentName || "N/A"}</div>
        <div class="portfolio-card-content">
          <p><strong>Portfolio Entry ID:</strong> ${portfolioEntryId || "N/A"}</p>
          <p><strong>Parent Portfolio Entry ID:</strong> ${parentPortfolioEntryId || "N/A"}</p>
          <p><strong>Root Portfolio Entry ID:</strong> ${rootPortfolioEntryId || "N/A"}</p>
          <p><strong>Level:</strong> ${level || "N/A"}</p>
          <p><strong>Is Root:</strong> ${isRoot ? "Yes" : "No"}</p>
          <p><strong>Is Lowest Level:</strong> ${isLowestLevel ? "Yes" : "No"}</p>
          <p><strong>ISIN Number:</strong> ${isinNumber || "N/A"}</p>
          <p><strong>MorningStar ID:</strong> ${morningStarId || "N/A"}</p>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="container">
        <h2>Portfolio Details</h2>
        <button @click="${super.navigateBack}">Back</button>
        ${this.renderPortfolio()}
      </div>
    `;
  }
}

customElements.define('portfolio-view', Portfolio);