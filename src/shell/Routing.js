import { html, render } from 'lit';
import '/src/views/LoginView.js';  // Import Login component
import '/src/views/HomeView.js';   // Import Home component
import '/src/views/common/ClientInformation.js';  // Import client details component
import '/src/views/common/Portfolio.js';  // Import client list component
import '/src/views/common/Transactions.js';  // Import pipedrive dashboard component

export class Routing {
  constructor() {
    // Define routes and their associated templates
    this.routes = {
      '/login': () => html`<login-view></login-view>`,
      '/home': () => html`<home-view></home-view>`,
      '/transactions': () => html`<transactions-view></transactions-view>`,
      '/client-information': () => html`<client-information></client-information>`,
      '/portfolio': () => html`<portfolio-view></portfolio-view>`,
    };

    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname);
    });

    // Initialize the app with the current route
    this.navigate(window.location.pathname);
  }

  // renderSidebar(route) {
  //   const sidebarContainer = document.getElementById('sidebar');

  //   // Conditionally render the sidebar for non-login routes
  //   if (route !== '/login') {
  //     render(html`<my-sidebar></my-sidebar>`, sidebarContainer); // Safely render the sidebar
  //   } else {
  //     render(html``, sidebarContainer); // Clear the sidebar on the login page
  //   }
  // }

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
