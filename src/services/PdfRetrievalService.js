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

    async updatePortfolioRatings(isin, ratings) {
        try {
            const endpoint = `/ratings/update`;
            const body = {
                isin,
                ratings  // e.g., { "1": "5.06", "3": "7.2", "0.5": "3.8" }
            };
            return await this.post(endpoint, body);
        } catch (error) {
            console.error('Failed to update portfolio ratings:', error);
            throw error;
        }
    }

    async getSavedRatings() {
        try {
            const endpoint = `/ratings/get`;
            return await this.get(endpoint);
        } catch (error) {
            console.error('Failed to get saved ratings:', error);
            throw error;
        }
    }
}