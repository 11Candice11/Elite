import { LitElement, html, css } from 'lit';
import { ClientProfileService } from '/src/services/ClientProfileService.js';
import { store } from '/src/store/EliteStore.js';
import { userInfoMixin } from '/src/views/mixins/UserInfoMixin.js';
import { ViewBase } from './common/ViewBase.js';
class LoginView extends ViewBase {
  static styles = css`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #f4f4f9;
    }
    .login-box {
      background: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }
    .login-box h2 {
      text-align: center;
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    .form-group input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    .form-group input:focus {
      outline: none;
      border-color: #1DC690;
    }
    .form-group .error {
      color: red;
      font-size: 12px;
    }
    button {
      width: 100%;
      padding: 10px;
      background-color: rgb(0, 50, 100);
      border: none;
      color: white;
      font-weight: bold;
      border-radius: 5px;
      color: white;
      cursor: pointer;
    }
    button:hover {
      background-color: rgb(50, 100, 150);
    }
  `;

  static properties = {
    username: { type: String },
    password: { type: String },
    errorMessage: { type: String },
    isLoading: { type: Boolean },
  };

  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.errorMessage = '';
    this.isLoading = false;
    localStorage.setItem("username", null);
    this.clientProfileService = new ClientProfileService(); // Initialize service
    Object.assign(LoginView.prototype, userInfoMixin);
  }

  
  async handleLogin(e) {
    e.preventDefault();
    this.errorMessage = '';

    // Validate inputs
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter a valid username and password.';
      return;
    }
    this.isLoading = true;

    store.set('username', this.password);
    localStorage.setItem("username", this.password);

    await this.loginUser(this.username, this.password);
    this.isLoading = false;
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
            ${this.errorMessage
              ? html`<div class="form-group error">${this.errorMessage}</div>`
              : ''}
            <button class="button" type="submit">${this.isLoading ? `Processing` : `Login`}</button>
          </form>
        </div>
      </div>
    `;
  }
}

customElements.define('login-view', LoginView);
