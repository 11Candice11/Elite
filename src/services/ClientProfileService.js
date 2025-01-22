// src/services/ClientProfileService.js
import { Service } from '/src/services/Service.js';

export class ClientProfileService extends Service {
    constructor() {
        // super('https://bytemeservice-dkhsbpdbbcacbgcp.southafricanorth-01.azurewebsites.net'); // Base URL pointing to the backend
    
        super('https://elite-e9d0awa6hfgsfhav.southafricanorth-01.azurewebsites.net/api/elite/v1')
    }

    async login(username, password) {
        try {
            const endpoint = '/login'; // Backend login endpoint
            const body = { username, password }; // Request payload
            const response = await this.post(endpoint, body); // POST method inherited from Service
            return response; // Return the response from the API
        } catch (error) {
            if (error.message.includes('401')) {
                console.warn('Unauthorized - Invalid username or password');
                return { success: false, message: 'Invalid username or password.' };
            }
            console.error('Failed to login:', error);
            throw error; // Re-throw the error for the caller to handle
        }
    }    

    async getClientProfile(request) {
        try {
            const endpoint = '/get-client-profile';
            const body = request; // Create a JSON object with the entityId
            const clientProfile = await this.post(endpoint, body);
            return clientProfile;
        } catch (error) {
            console.error(`Failed to fetch client profile for entity ID: ${request.InputEntityModels.SouthAfricanIdNumber}`, error);
            throw error;
        }
    }
}
