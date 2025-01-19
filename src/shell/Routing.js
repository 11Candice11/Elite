import { html, render } from "lit";
import "/src/views/LoginView.js";
import "/src/views/HomeView.js";
import "/src/views/Dashboard.js";
import "/src/views/common/Products.js";
import "/src/views/common/Portfolio.js";
import "/src/views/common/Transactions.js";
import "/src/views/common/PortfolioDetails.js";

export class Routing {
  constructor() {
    // Define routes and their associated templates
    this.routes = {
      "/login": () => html`<login-view></login-view>`,
      "/home": () => html`<home-view></home-view>`,
      "/transactions": () => html`<transactions-view></transactions-view>`,
      "/products": () => html`<product-view></product-view>`,
      "/portfolio": () => html`<portfolio-view></portfolio-view>`,
      "/portfolio-details": () => html`<portfolio-details></portfolio-details>`,
      "/dashboard": () => html`<dashboard-view></dashboard-view>`,
    };

    window.addEventListener("popstate", () =>
      this.navigate(window.location.pathname)
    );

    // Initialize the app with the current route
    this.navigate(window.location.pathname);
  }

  navigate(route) {
    debugger;
    const appContainer = document.getElementById("app");

    // Check if the route exists in the routes object
    if (this.routes[route]) {
      // Render the corresponding template by invoking the function from the routes object
      render(this.routes[route](), appContainer); // Notice we invoke the function

      // Conditionally render the sidebar
      // this.renderSidebar(route);

      // Update the URL without reloading the page
      if (window.location.pathname !== route) {
        window.history.pushState({}, "", route);
      } else {
        render(this.routes[route](), appContainer);
      }
    } else {
      console.error("Route not found, redirecting to /login");
      render(html`<h1>404 - Page Not Found</h1>`, appContainer);
    }
  }

  static handleNavigation(event, route) {
    event.preventDefault();
    router.navigate(route);
  }
}

export const router = new Routing();
