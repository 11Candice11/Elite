// AppShell.js
import { LitElement, html } from 'lit';
import '/src/views/LoginView.js';
import '/src/views/common/Transactions.js';
import '/src/views/HomeView.js';
import '/src/views/common/ClientInformation.js';
import '/src/views/common/Portfolio.js';

class AppShell extends LitElement {
  static properties = {
    currentView: { type: String },
  };

  constructor() {
    super();
    this.currentView = 'login'; // Start with the login view
  }

  handleNavigation(event) {
    const { view } = event.detail;
    this.currentView = view || 'login';
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('navigate', this.handleNavigation);
  }

  disconnectedCallback() {
    this.removeEventListener('navigate', this.handleNavigation);
    super.disconnectedCallback();
  }

  render() {
    return html`
      ${this.currentView === 'login' ? html`<login-view></login-view>` : ''}
      ${this.currentView === 'home' ? html`<home-view></home-view>` : ''}
      ${this.currentView === 'transactions' ? html`<transactions-view></transactions-view>` : ''}
      ${this.currentView === 'clientInformation' ? html`<client-information></client-information>` : ''}
      ${this.currentView === 'portfolio' ? html`<portfolio-view></portfolio-view>` : ''}
    `;
  }
}

customElements.define('app-shell', AppShell);
