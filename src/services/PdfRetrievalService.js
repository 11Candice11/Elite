import { Service } from '/src/services/Service.js';

export class PdfRetrievalService extends Service {
    constructor() {
        // Uncomment the line below to use the production API
        super('https://elite-e9d0awa6hfgsfhav.southafricanorth-01.azurewebsites.net'); // Production API

        // Local development API endpoint
        // super('http://localhost:6200');
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

    async updatePortfolioRatings(isinNumber, data) {
        try {
            const response = await fetch(`/api/ratings/${isinNumber}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Failed to update ratings for ${isinNumber}`);
            }

            return await response.json();
        } catch (error) {
            console.error("❌ Error updating portfolio ratings:", error);
            throw error;
        }
    }

    async getSavedRatings() {
        try {
            const endpoint = `/api/ratings`;
            return await this.get(endpoint);
        } catch (error) {
            console.error('Failed to get saved ratings:', error);
            throw error;
        }
    }
}