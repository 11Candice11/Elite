// NavigationContext.js
class NavigationContext {
    constructor(rootElement) {
      this.rootElement = rootElement;
      this.routes = {
        login: () => html`<login-view @navigate="${this._navigate.bind(this)}"></login-view>`,
        home: () => html`<home-view @navigate="${this._navigate.bind(this)}"></home-view>`
      };
      this.currentRoute = 'login';
    }
  
    _navigate(event) {
      const { route } = event.detail;
      if (this.routes[route]) {
        this.currentRoute = route;
        this.render();
      }
    }
  
    render() {
      if (this.rootElement) {
        const template = this.routes[this.currentRoute]();
        html`<div>${template}</div>`.render(this.rootElement);
      }
    }
  }
  
  export { NavigationContext };
  