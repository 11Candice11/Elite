import { ViewBase } from './ViewBase.js';
import { html, css } from 'lit';
import { store } from '/src/store/EliteStore.js';
import Chart from 'chart.js/auto';

export class StatsView extends ViewBase {
  static styles = css`
    .container {
      align-items: center;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      padding: 1rem;
      align-items: start;
    }

    .card {
      background: #fff;
      border-radius: 10px;
      padding: 1rem;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      min-height: 280px;
    }

    .stats-panel {
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8f8f8;
      border-radius: 8px;
      font-family: sans-serif;
    }

    .stats-panel p {
      margin: 0.3rem 0;
    }

    canvas {
      max-width: 100%;
      height: auto;
    }

    .title {
      font-weight: bold;
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      color: rgb(0, 50, 100);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      font-size: 0.9rem;
    }

    th, td {
      text-align: left;
      padding: 0.5rem;
      border-bottom: 1px solid #ccc;
    }
  `;

  static properties = {
    isLoading: { type: Boolean },
    hasLoaded: { type: Boolean },
  };

  constructor() {
    super();
    this.isLoading = false;
    this.hasLoaded = false;
    this._charts = {};
  }

  connectedCallback() {
    super.connectedCallback();
  }

  firstUpdated() {
    this.clientInfo = store.get('clientInfo') || {};
    this.selectedPortfolio = store.get('selectedPortfolio') || null;
    this.detail = this.selectedPortfolio || {};
    this.hasLoaded = true;
  }
  
  async updated() {
    await this.updateComplete; // ✅ Wait until DOM is fully rendered
    this.renderCharts();
  }

  renderCharts() {
    if (!this.detail || !this.detail.rootValueDateModels) {
      return;
    }

    const validSnapshots = this.detail.rootValueDateModels.filter(
      m => Array.isArray(m.valueModels) && m.valueModels.length > 0
    );

    if (!validSnapshots.length) {
      return;
    }

    const labels = [];
    const values = [];

    validSnapshots.forEach(m => {
      if (m.convertedValueDate && !isNaN(new Date(m.convertedValueDate))) {
        labels.push(new Date(m.convertedValueDate).toISOString().slice(0, 10));
        values.push(m.valueModels.reduce((sum, v) => sum + v.convertedAmount, 0));
      }
    });

    const lineCanvas = this.shadowRoot.querySelector('#lineChart');
    const barCanvas = this.shadowRoot.querySelector('#barChart');
    const pieCanvas = this.shadowRoot.querySelector('#pieChart');
    const donutCanvas = this.shadowRoot.querySelector('#donutChart');

    const createChart = (ctx, type, config, chartKey) => {
      if (this._charts[chartKey]) {
        this._charts[chartKey].destroy();
      }
      this._charts[chartKey] = new Chart(ctx, {
        type,
        data: config.data,
        options: config.options || {
          responsive: true,
          plugins: {
            legend: { display: true }
          }
        }
      });
    };

    if (lineCanvas && labels.length && values.length) {
      createChart(lineCanvas, 'line', {
        data: {
          labels,
          datasets: [{
            label: 'Portfolio Value',
            data: values,
            borderColor: 'rgb(0, 50, 100)',
            backgroundColor: 'rgba(0, 50, 100, 0.2)',
            fill: true,
            tension: 0.3
          }]
        }
      }, 'lineChart');
    } else {
      console.warn("📉 No data or missing canvas for Investment Growth chart");
    }

    if (barCanvas && labels.length && values.length) {
      createChart(barCanvas, 'bar', {
        data: {
          labels,
          datasets: [{
            label: 'Portfolio Value',
            data: values,
            backgroundColor: 'rgb(0, 50, 100)'
          }]
        }
      }, 'barChart');
    } else {
      console.warn("📉 No data or missing canvas for Asset Returns chart");
    }

    if (pieCanvas && this.detail.portfolioEntryTreeModels?.length) {
      const lowestLevelEntries = this.detail.portfolioEntryTreeModels.filter(e => e.isLowestLevel);

      const instrumentCounts = {};
      for (const entry of lowestLevelEntries) {
        const name = entry.instrumentName || "Unknown";
        instrumentCounts[name] = (instrumentCounts[name] || 0) + 1;
      }

      const pieLabels = Object.keys(instrumentCounts);
      const pieData = Object.values(instrumentCounts);

      createChart(pieCanvas, 'pie', {
        data: {
          labels: pieLabels,
          datasets: [{
            label: 'Holdings per Instrument',
            data: pieData,
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(0, 50, 100)',
              'rgb(140, 120, 80)',
              'rgb(180, 100, 150)',
              'rgb(100, 180, 200)'
            ]
          }]
        }
      }, 'pieChart');
    } else {
      console.warn("📉 No data or missing canvas for Asset Allocation chart");
    }

    if (donutCanvas && this.detail.portfolioEntryTreeModels?.length) {
      const lowestLevelEntries = this.detail.portfolioEntryTreeModels.filter(e => e.isLowestLevel);
      
      const instrumentCounts = {};
      for (const entry of lowestLevelEntries) {
        const name = entry.instrumentName || "Unknown";
        instrumentCounts[name] = (instrumentCounts[name] || 0) + 1;
      }

      const donutLabels = Object.keys(instrumentCounts);
      const donutData = Object.values(instrumentCounts);

      createChart(donutCanvas, 'doughnut', {
        data: {
          labels: donutLabels,
          datasets: [{
            label: 'Holdings per Instrument',
            data: donutData,
            backgroundColor: [
              'rgb(0, 50, 100)',
              'rgb(50, 100, 150)',
              'rgb(215, 180, 120)',
              'rgb(140, 120, 80)',
              'rgb(100, 180, 200)',
              'rgb(180, 100, 150)',
              'rgb(220, 120, 100)'
            ]
          }]
        }
      }, 'donutChart');
    } else {
      console.warn("📉 No data or missing canvas for Asset Allocation (Donut) chart");
    }
  }

  generatePortfolioStats(detail) {
    const now = new Date();
    const inceptionDate = new Date(detail.inceptionDate);
    const yearsInvested = ((now - inceptionDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);

    const snapshots = detail.rootValueDateModels || [];
    console.log("📊 rootValueDateModels:", snapshots);

    const sortedSnapshots = [...snapshots].sort((a, b) =>
      new Date(a.convertedValueDate) - new Date(b.convertedValueDate)
    );

    const latestSnapshot = sortedSnapshots.at(-1) || {};
    const previousSnapshot = sortedSnapshots.at(-2) || {};
    console.log("📊 latestSnapshot:", latestSnapshot);

    const latestValue = latestSnapshot?.totalConvertedAmount;
    const previousValue = previousSnapshot?.totalConvertedAmount;
    const valueChange = (latestValue ?? 0) - (previousValue ?? 0);
    const percentChange =
      previousValue && latestValue
        ? ((valueChange / previousValue) * 100).toFixed(1)
        : null;
    const trendArrow = percentChange
      ? valueChange >= 0
        ? `🔺 +${percentChange}%`
        : `🔻 ${percentChange}%`
      : "⚠ No previous value";

    const totalValue =
      latestValue !== undefined
        ? latestValue.toLocaleString('en-ZA', {
            style: 'currency',
            currency: latestSnapshot?.currencyAbbreviation || 'ZAR'
          })
        : "⚠ No latest value";

    const currency = latestSnapshot?.currencyAbbreviation || "⚠ Missing currency";

    let topHolding = "⚠ No value models";
    let topPercentage = 0;
    if (latestSnapshot?.valueModels?.length) {
      const top = [...latestSnapshot.valueModels].sort(
        (a, b) => b.portfolioSharePercentage - a.portfolioSharePercentage
      )[0];
      const entryName = detail.portfolioEntryTreeModels?.find(e => e.portfolioEntryId === top.portfolioEntryId)?.instrumentName;
      topHolding = entryName || "Unknown";
      topPercentage = top.portfolioSharePercentage;
    }

    console.log("📊 portfolioEntryTreeModels:", detail.portfolioEntryTreeModels);
    const activeHoldings = detail.portfolioEntryTreeModels?.filter(e => e.isLowestLevel)?.length || 0;

    // Simple health indicator logic
    let healthStatus = "🟢 Healthy";
    if (topPercentage > 0.75) {
      healthStatus = "🟡 Caution: Concentrated";
    }
    if (percentChange && Number(percentChange) < -10) {
      healthStatus = "🔴 Alert: Value Drop";
    }

    return html`
      <div class="stats-panel">
        <p><strong>📅 Years Invested:</strong> ${yearsInvested} years</p>
        <p><strong>💰 Total Value:</strong> ${totalValue} <span style="margin-left: 0.5rem;">${trendArrow}</span></p>
        <p><strong>📈 Top Holding:</strong> ${topHolding} (${(topPercentage * 100).toFixed(2)}%)</p>
        <p><strong>🌍 Currency:</strong> ${currency}</p>
        <p><strong>🎯 Instruments:</strong> ${activeHoldings} active holdings</p>
        <p><strong>🩺 Health Status:</strong> ${healthStatus}</p>
      </div>
    `;
  }

  render() {
    if (this.hasLoaded) {
      const hasValidData = this.detail?.rootValueDateModels?.some(
        m => Array.isArray(m.valueModels) && m.valueModels.length > 0
      );
      if (!hasValidData) {
        return html`
          <div class="container">
            <button @click="${() => history.back()}">← Back</button>
            <div class="card">
              <div class="title">No Portfolio Data</div>
              <p style="padding: 1rem; color: #555;">
                No portfolio data available. Please select a portfolio first or ensure your data is loaded correctly.
              </p>
            </div>
          </div>
        `;
      }
    }
    return html`
      <div class="container">
        <button @click="${() => history.back()}">← Back</button>
        <div class="dashboard-grid">
          <!-- Row 1 -->
          <div class="card" style="grid-column: span 1;">
            <div class="title">Portfolio Overview</div>
            ${this.detail ? this.generatePortfolioStats(this.detail) : ''}
          </div>
          <div class="card" style="grid-column: span 1;">
            <div class="title">Investment Growth</div>
            <canvas id="lineChart" width="400" height="200"></canvas>
          </div>

          <!-- Row 2 -->
          <div class="card" style="grid-column: span 1;">
            <div class="title">Asset Returns</div>
            <canvas id="barChart"></canvas>
          </div>
          <div class="card" style="grid-column: span 1;">
            <div class="title">Asset Allocation</div>
            <canvas id="pieChart"></canvas>
          </div>
          <div class="card" style="grid-column: span 1;">
            <div class="title">Asset Allocation (Donut)</div>
            <canvas id="donutChart"></canvas>
          </div>

          <!-- Scribble Notes -->
          <div class="card" style="grid-column: span 2;">
            <div class="title">📓 Analyst Notes</div>
            <p style="font-style: italic; color: #555; line-height: 1.5;">
              Remember: Portfolio heavily weighted in equity—good growth but higher volatility. <br>
              Client’s investment horizon supports this aggressive allocation. <br>
              Review in Q3 to consider rebalancing if market shifts persist.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

class PortfolioVisualizer {
  constructor(response_data) {
    this.response_data = response_data;
  }

  get_latest_detail_model() {
    for (const entity of this.response_data.entityModels || []) {
      if (entity.detailModels) {
        return entity.detailModels[0];
      }
    }
    return null;
  }

  draw_portfolio_distribution_pie() {
    const detail = this.get_latest_detail_model();
    if (!detail) {
      return;
    }

    const value_models = detail.rootValueDateModels[0]?.valueModels || [];
    const labels = [];
    const sizes = [];

    for (const value of value_models) {
      const entry_id = value.portfolioEntryId;
      const instrument_name = detail.portfolioEntryTreeModels.find(entry => entry.portfolioEntryId === entry_id)?.instrumentName || "Unknown Instrument";
      labels.push(instrument_name);
      sizes.push(value.portfolioSharePercentage);
    }

    // Plot pie chart
    const plt = require('matplotlib.pyplot');
    plt.figure({ figsize: [8, 8] });
    plt.pie(sizes, { labels: labels, autopct: '%1.1f%%', startangle: 140 });
    plt.title("Portfolio Allocation by Instrument");
    plt.axis('equal');
    plt.tight_layout();
    plt.show();
  }
}

customElements.define('stats-view', StatsView);
