import { LitElement, html, css } from 'lit';
import { router } from '/src/shell/Routing.js'
class LoginView extends LitElement {
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
      border-color: #D4FF00;
    }
    .form-group .error {
      color: red;
      font-size: 12px;
    }
    button {
      width: 100%;
      padding: 10px;
      background-color: #D4FF00;
      border: none;
      color: #222222;
      font-weight: bold;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background-color: #c0e600;
    }
  `;

  static properties = {
    username: { type: String },
    password: { type: String },
    pipelineToken: { type: String },
    showTokenField: { type: Boolean },
    errorMessage: { type: String },
  };

  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.pipelineToken = '';
    this.showTokenField = false;
    this.errorMessage = '';
  }

  handleLogin(e) {
    e.preventDefault();
    this.errorMessage = '';

    // Validate inputs
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter a valid username and password.';
      return;
    }

    // Optionally check for a pipeline token
    if (this.showTokenField && !this.pipelineToken) {
      this.errorMessage = 'Please enter a valid pipeline token.';
      return;
    }

    // Trigger navigation to HomeView
    this.navigateToHome();
  }

  navigateToHome() {
    // Dispatch a custom event to navigate to HomeView
    // this.dispatchEvent(
    //   new CustomEvent('navigate', {
    //     detail: { view: 'home' }, // Add detail if needed for routing logic
    //     bubbles: true,
    //     composed: true,
    //   })
    // );
    router.navigate('/home');
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
            ${this.showTokenField
              ? html`
                  <div class="form-group">
                    <label for="pipelineToken">Pipeline Token</label>
                    <input
                      type="text"
                      id="pipelineToken"
                      .value=${this.pipelineToken}
                      @input=${(e) => (this.pipelineToken = e.target.value)}
                      placeholder="Enter your pipeline token"
                    />
                  </div>
                `
              : ''}
            ${this.errorMessage
              ? html`<div class="form-group error">${this.errorMessage}</div>`
              : ''}
            <button class="button" type="submit">Login</button>
          </form>
        </div>
      </div>
    `;
  }
}

customElements.define('login-view', LoginView);
