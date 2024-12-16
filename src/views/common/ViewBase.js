import { LitElement } from 'lit';
import { router } from '/src/shell/Routing.js'

export class ViewBase extends LitElement {
    constructor() {
        super(); // Ensure this is called
    }
    
    isNullOrEmpty(fieldValue) {
      return fieldValue === `` || fieldValue === null || fieldValue === undefined;
    }

  navigateBack() {
    router.navigate('/home');
  }

  navigateToTransactions() {
    router.navigate('/transactions');
  }

  navigateToPortfolio() {
    router.navigate('/portfolio');
  }

  navigateToProducts() {
    router.navigate('/products');
  }
}
