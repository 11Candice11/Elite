import { LitElement } from 'lit';
import { router } from '/src/shell/Routing.js'

export class ViewBase extends LitElement {
    constructor() {
        super(); // Ensure this is called
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

  navigateToClientInformation() {
    router.navigate('/client-information');
  }
}
