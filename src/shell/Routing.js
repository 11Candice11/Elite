import { html, render } from 'lit';
import '/src/views/LoginView.js';  
import '/src/views/HomeView.js';   
import '/src/views/Dashboard.js';   
import '/src/views/common/Products.js';  
import '/src/views/common/Portfolio.js';  
import '/src/views/common/Transactions.js';  
import '/src/views/common/PortfolioDetails.js';
import '/src/views/common/PDFViewer.js';
import '/src/views/common/RootTransactionHistory.js';


export class Routing {
  constructor() {
    // Define routes and their associated templates
    this.routes = {
      '/login': () => html`<login-view></login-view>`,
      '/home': () => html`<home-view></home-view>`,
      '/transactions': () => html`<transactions-view></transactions-view>`,
      '/products': () => html`<product-view></product-view>`,
      '/portfolio': () => html`<portfolio-view></portfolio-view>`,
      '/portfolio-details': () => html`<portfolio-details></portfolio-details>`,
      '/dashboard': () => html`<dashboard-view></dashboard-view>`,
      '/pdf': () => html`<pdf-viewer></pdf-viewer>`,
      '/transaction-history': () => html`<root-transaction-history></root-transaction-history>`
    };

    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname);
    });

    // Initialize the app with the current route
    this.navigate(window.location.pathname);
  }

  navigate(route) {
    const appContainer = document.getElementById('app');

      // Check if the route exists in the routes object
      if (this.routes[route]) {
        // Render the corresponding template by invoking the function from the routes object
        render(this.routes[route](), appContainer);  // Notice we invoke the function
        
        // Conditionally render the sidebar
        // this.renderSidebar(route);
        
        // Update the URL without reloading the page
        if (window.location.pathname !== route) {
          window.history.pushState({}, '', route);
        }
      } else {
        console.error('Route not found, redirecting to /login');
        this.navigate('/login');  // Handle unknown routes
      }
  }

  static handleNavigation(event, route) {
    event.preventDefault();
    router.navigate(route);
  }
}

export const router = new Routing();
