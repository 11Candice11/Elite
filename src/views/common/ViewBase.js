import { router } from '/src/shell/Routing.js'
import { store } from '/src/store/EliteStore.js';
import { LitElement, html, css } from 'lit';

export class ViewBase extends LitElement {
    constructor() {
        super(); // Ensure this is called
    }
    
    isNullOrEmpty(fieldValue) {
      return fieldValue === `` || fieldValue === null || fieldValue === undefined;
    }

  navigateBack() {
    store.set('currentRoute', 'dashboard');
    router.navigate('/dashboard');
  }

  navigateHome() {
    store.set('currentRoute', 'home');
    router.navigate('/home');
  }

  navigateToTransactions() {
    store.set('currentRoute', 'transactions');
    router.navigate('/transactions');
  }

  navigateToRootTransactions() {
    store.set('currentRoute', 'transaction-history');
    router.navigate('/transaction-history');
  }

  navigateToPortfolio() {
    store.set('currentRoute', 'portfolio');
    router.navigate('/portfolio');
  }

  navigateToProducts() {
    store.set('currentRoute', 'products');
    router.navigate('/products');
  }

  navigateToPDFViewer() {
    store.set('currentRoute', 'pdf');
    router.navigate('/documents');
  }

  navigateToDocuments() {
    store.set('currentRoute', 'documents');
    router.navigate('/documents');
  }

  navigateToLogin() {
    store.set('currentRoute', 'login');
    router.navigate('/login');
  }

  formatDateToISO(date) {
    return `${date.toISOString().split('T')[0]}T00:00:00+02:00`;
  }

  static styles = css`
  button {
    background-color: rgb(0, 50, 100);
    color: white; /* Black text */
    border: none; /* Remove borders */
    border-radius: 30px; /* Rounded edges */
    padding: 10px 20px; /* Add padding for size */
    font-size: 16px; /* Adjust font size */
    font-weight: bold; /* Bold text */
    cursor: pointer; /* Pointer cursor for interactivity */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */
    transition: background-color 0.3s ease, box-shadow 0.3s ease; /* Smooth hover effects */
  }
  
  button:hover {
    background-color: rgb(50, 100, 150);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2); /* More pronounced shadow on hover */
  }
  
  button:active {
    background-color: rgb(50, 100, 150);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Reduced shadow on click */
  }
  
  button:disabled {
    background-color: #e0e0e0; /* Light gray for disabled state */
    color: #a0a0a0; /* Gray text */
    cursor: not-allowed; /* Disable pointer interaction */
    box-shadow: none; /* Remove shadow */
  }
  `;
}
