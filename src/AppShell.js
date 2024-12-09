// AppShell.js
import { LitElement, html } from 'lit';
import '/src/views/LoginView.js';
import '/src/views/HomeView.js';

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
    `;
  }
}

customElements.define('app-shell', AppShell);
