import { Service } from '/src/services/Service.js';

export class PdfRetrievalService extends Service {
    constructor() {
        // Uncomment the line below to use the production API
        // super('https://elite-e9d0awa6hfgsfhav.southafricanorth-01.azurewebsites.net/api/elite/v1'); // Production API
        
        // Local development API endpoint
        super('http://localhost:6200');
    }

    async fetchPdf(pdfUrl) {
        try {
            const endpoint = `/PdfProxy/fetch?url=${encodeURIComponent(pdfUrl)}`;
            return await this.getBlob(endpoint);
        } catch (error) {
            console.error('Failed to fetch PDF:', error);
            throw error;
        }
    }
}