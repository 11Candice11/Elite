// src/services/ClientProfileService.js
import { Service } from '/src/services/Service.js';

export class ClientProfileService extends Service {
    constructor() {
        // super('https://elite-e9d0awa6hfgsfhav.southafricanorth-01.azurewebsites.net/api/elite/v1') // Production API
        super('http://localhost:6200/api/elite/v1'); // Local development API
    }

    async login(username, password, email) {
        try {
            const endpoint = '/login';
            const body = { username, password, email };
            return await this.post(endpoint, body);
        } catch (error) {
            if (error.message.includes('401')) {
                console.warn('Unauthorized - Invalid username or password');
                return { success: false, message: 'Invalid username or password.' };
            }
            console.error('Failed to login:', error);
            throw error;
        }
    }    

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
     * Create a new user
     */
    async createUser(username, email, password) {
        try {
            const endpoint = '/create';
            const body = { username, email, password };
            return await this.post(endpoint, body);
        } catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    }

    /**
     * Get all users (Uses base URL due to [HttpGet] in controller)
     */
    async getAllUsers() {
        try {
            const endpoint = '/'; // No specific path since [HttpGet] is set at the base
            return await this.get(endpoint);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw error;
        }
    }

    /**
     * Get a specific user by username
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
     * Update user's email
     */
    async updateUserEmail(username, newEmail) {
        try {
            const endpoint = '/update-user-email';
            const body = { username, newEmail };
            return await this.put(endpoint, body);
        } catch (error) {
            console.error(`Failed to update email for user: ${username}`, error);
            throw error;
        }
    }

    /**
     * Delete a user by username
     */
    async deleteUser(username) {
        try {
            const endpoint = `/delete-user/${encodeURIComponent(username)}`;
            return await this.delete(endpoint);
        } catch (error) {
            console.error(`Failed to fetch client profile for entity ID: ${request.InputEntityModels.RegistrationNumber}`, error);
            throw error;
        }
    }
}