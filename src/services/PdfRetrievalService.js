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
        return await this.post('/api/ratings', { Key: isinNumber, ...data });
    }

    async getRatingsByClient(clientId) {
        return await this.get(`/api/ratings/${clientId}`);
    }

    // async updatePortfolioRatings(isinNumber, data) {
    //     try {
    //         const response = await fetch(`/api/ratings`, {
    //             method: 'POST',
    //             body: JSON.stringify({ key: isinNumber, ...data }),
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //         });

    //         if (!response.ok) {
    //             throw new Error(`Failed to update ratings for ${isinNumber}`);
    //         }

    //         return await response.json();
    //     } catch (error) {
    //         console.error("❌ Error updating portfolio ratings:", error);
    //         throw error;
    //     }
    // }

    // async getRatingsByClient(clientId) {
    //     try {
    //         const response = await fetch(`/api/ratings/${clientId}`);
    //         if (!response.ok) {
    //             throw new Error(`Failed to fetch ratings for client ${clientId}`);
    //         }
    //         return await response.json();
    //     } catch (error) {
    //         console.error("❌ Error fetching client ratings:", error);
    //         return {}; // fallback
    //     }
    // }

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