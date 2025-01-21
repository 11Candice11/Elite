import { LitElement, html, css } from 'lit';
import { store } from '/src/store/EliteStore.js';
import { ViewBase } from './ViewBase.js';

class PortfolioDetails extends ViewBase {
  static styles = css`
  .container {
    padding: 20px;
  }
  h2 {
    margin-bottom: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
  }
  th {
    background-color: #007bff;
    color: white;
    font-weight: bold;
  }
  td {
    color: #333;
  }
  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  .card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background-color: #fff;
  }
  .card-header {
    background-color: #007bff;
    color: #fff;
    font-size: 1.2em;
    font-weight: bold;
    padding: 10px 15px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  .card-content {
    padding: 15px;
  }
  .card-content p {
    margin: 8px 0;
    font-size: 1em;
    color: #333;
  }
  .card-content strong {
    font-weight: bold;
  }
  button {
    padding: 10px 20px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
  `;

  static properties = {
    portfolioEntryTreeModels: { type: Array },
  };

  constructor() {
    super();
    this.portfolioEntryTreeModels = store.get('portfolioEntryTreeModels') || [];
  }

  render() {
    return html`
      <div class="container">
        <h2>Portfolio Entry Details</h2>
        <button @click="${() => history.back()}">Back</button>
        ${this.portfolioEntryTreeModels.length > 0
          ? html`
              <table>
                <thead>
                  <tr>
                    <th>Instrument Name</th>
                    <!-- <th>Is Lowest Level</th>
                    <th>Is Root</th> -->
                    <th>ISIN Number</th>
                    <!-- <th>Level</th> -->
                    <th>One year returns</th>
                    <th>Three year returns</th>
                    <!-- <th>Parent Portfolio Entry ID</th>
                    <th>Portfolio Entry ID</th>
                    <th>Root Portfolio Entry ID</th> -->
                  </tr>
                </thead>
                <tbody>
                  ${this.portfolioEntryTreeModels.map(
                    (entry) => html`
                      <tr>
                        <td>${entry.instrumentName || 'N/A'}</td>
                        <!-- <td>${entry.isLowestLevel ? 'Yes' : 'No'}</td>
                        <td>${entry.isRoot ? 'Yes' : 'No'}</td> -->
                        <td>${entry.isinNumber || 'N/A'}</td>
                        <!-- <td>${entry.level}</td>
                        <td>${entry.parentPortfolioEntryId || 'N/A'}</td>
                        <td>${entry.portfolioEntryId || 'N/A'}</td>
                        <td>${entry.rootPortfolioEntryId || 'N/A'}</td> -->
                        <td></td>
                        <td></td>
                      </tr>
                    `
                  )}
                </tbody>
              </table>
            `
          : html`<p>No portfolio details available.</p>`}
      </div>
    `;
  }
}

customElements.define('portfolio-details', PortfolioDetails);