import { LitElement, html, css } from 'lit';
import { store } from '/src/store/EliteStore.js';
import { ViewBase } from './common/ViewBase.js';

class ViewExample extends ViewBase {
  static styles = css`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #f4f4f9;
    }
  `;

  static properties = {
    isLoading: { type: Boolean },
  };

  constructor() {
    super();
    this.isLoading = false;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    return html`
      <div class="login-container">
        <div class="login-box">
          <h2>Login</h2>
          <form @submit=${this.handleLogin}>
            <div class="form-group">
              <label for="username">Username</label>
              <input
                type="text"
                id="username"
                .value=${this.username}
                @input=${(e) => (this.username = e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                .value=${this.password}
                @input=${(e) => (this.password = e.target.value)}
                placeholder="Enter your password"
              />
            </div>
                  <!-- Loading Indicator -->
            <button class="button" type="submit">${this.isLoading ? `Processing` : `Login`}</button>
          </form>
        </div>
      </div>
    `;
  }
}

customElements.define('view-example', ViewExample);
