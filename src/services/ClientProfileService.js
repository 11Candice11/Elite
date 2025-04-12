// src/services/ClientProfileService.js
import { Service } from '/src/services/Service.js';

/**
 * ClientProfileService handles all API interactions related to clients and users.
 * It interacts with the backend services to manage users, clients, and their associated data.
 */
export class ClientProfileService extends Service {
    constructor() {
        // Uncomment the line below to use the production API
        super('https://elite-e9d0awa6hfgsfhav.southafricanorth-01.azurewebsites.net/api/elite/v1'); // Production API
        
        // Local development API endpoint
        // super('http://localhost:6200/api/elite/v1');
    }

    /**
     * Logs in a user with the given credentials.
     * @param {string} username - The user's username.
     * @param {string} password - The user's password.
     * @param {string} idNumber - The user's ID number.
     * @returns {Promise<Object>} The login response.
     */
    async login(username, password, idNumber) {
        try {
          const endpoint = "/login";
          const body = { username, password, idNumber };
          return await this.post(endpoint, body);
        } catch (error) {
          console.error("Failed to login:", error);
          throw error;
        }
      }

    /**
     * Fetches the profile of a client.
     * @param {Object} request - The request payload containing client details.
     * @returns {Promise<Object>} The client profile data.
     */
    async getClientProfile(request) {
        try {
            const endpoint = '/get-client-profile';
            return await this.post(endpoint, request);
        } catch (error) {
            console.error(`Failed to fetch client profile`, error);
            throw error;
        }
    }

    /**
     * Creates a new user.
     * @param {string} username - The username of the new user.
     * @param {string} email - The email of the new user.
     * @param {string} password - The password of the new user.
     * @returns {Promise<Object>} The response from the server.
     */
    async createUser(username, email, password) {
        try {
            const endpoint = '/save-client';
            const body = { username, email, password };
            return await this.post(endpoint, body);
        } catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    }

    /**
     * Retrieves all users from the database.
     * @returns {Promise<Array>} An array of users.
     */
    async getAllUsers() {
        try {
            const endpoint = '/';
            return await this.get(endpoint);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw error;
        }
    }

    /**
     * Fetches details of a specific user.
     * @param {string} username - The username of the user to fetch.
     * @returns {Promise<Object>} The user details.
     */
    async getUser(username) {
        try {
            const endpoint = `/${encodeURIComponent(username)}`;
            return await this.get(endpoint);
        } catch (error) {
            console.error(`Failed to fetch user: ${username}`, error);
            throw error;
        }
    }

    /**
     * Retrieves all client data for a specific client.
     * @param {string} clientID - The ID of the client.
     * @returns {Promise<Array>} An array of client data records.
     */
    async getClientData(clientID) {
        try {
            const endpoint = `/client-data/${encodeURIComponent(clientID)}`;
            return await this.get(endpoint);
        } catch (error) {
            console.error(`Failed to fetch client data for: ${clientID}`, error);
            throw error;
        }
    }

    /*
     * Retrieves all clients assigned to a specific consultant.
     * @param {string} consultantIDNumber - The consultant's ID number.
     * @returns {Promise<Array>} An array of clients.
     */
    async getClientsByConsultant(ConsultantIDNumber) {
        try {
            const endpoint = `/get-clients`;
            return await this.post(endpoint, { ConsultantIDNumber });
        } catch (error) {
            console.error(`Failed to fetch clients for consultant: ${ConsultantIDNumber}`, error);
            throw error;
        }
    }

    /**
     * Retrieves a single client's information by ClientID.
     * @param {string} clientID - The unique identifier of the client.
     * @returns {Promise<Object>} The client information.
     */
    async getClient(clientID) {
        try {
            const endpoint = `/client/${encodeURIComponent(clientID)}`;
            return await this.get(endpoint);
        } catch (error) {
            console.error(`Failed to fetch client data for ClientID: ${clientID}`, error);
            throw error;
        }
    }

    /**
     * Adds a new client to the database.
     * @param {Object} clientData - The client data to be added.
     * @returns {Promise<Object>} The response from the server.
     */
    async addClient(clientData) {
        try {
            const endpoint = '/clients';
            return await this.post(endpoint, clientData);
        } catch (error) {
            console.error('Failed to add new client:', error);
            throw error;
        }
    }

    /**
     * Adds a new client to the database.
     * @param {string} clientID - The unique identifier for the client.
     * @param {Array<string>} listDates - A list of dates associated with the client.
     * @param {string} consultantIDNumber - The consultant ID linked to the client.
     * @returns {Promise<Object>} The response from the server.
     */
    async addClientData(clientID, listDates, consultantIDNumber) {
        try {
            const endpoint = '/client-data';
            const body = {
                ClientID: clientID,
                ListDates: listDates || [], // Ensures it's always an array
                ConsultantIDNumber: consultantIDNumber
            };

            return await this.post(endpoint, body);
        } catch (error) {
            console.error('Failed to add new client:', error);
            throw error;
        }
    }
}