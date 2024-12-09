// src/services/ClientProfileService.js
import { Service } from '/src/services/Service';

export class ClientProfileService extends Service {
    constructor() {
        super('https://bytemeservice-dkhsbpdbbcacbgcp.southafricanorth-01.azurewebsites.net'); // Base URL pointing to the backend
    }

    async getAllClients() {
        try {
            const endpoint = '/ClientProfile/GetAllClients';
            const clientProfile = await this.get(endpoint);
            return clientProfile;
        } catch (error) {
            if (error.message.includes('404')) {
                console.warn('404 Not Found - The requested resource was not found');
                return []; // Return an empty array or handle as needed
            }
            console.error('Failed to fetch clients', error);
            throw error; // Re-throw the error for other handlers to catch
        }
    }

    async getClientProfile(entityId) {
        try {
            const endpoint = '/ClientProfile/ClientProfile';
            const body = { entityId }; // Create a JSON object with the entityId
            const clientProfile = await this.post(endpoint, body);
            return clientProfile;
        } catch (error) {
            console.error(`Failed to fetch client profile for entity ID: ${entityId}`, error);
            throw error;
        }
    }
}
