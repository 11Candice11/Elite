export class Service {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, { method = "GET", body = null, headers = {} } = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const mergedHeaders = {
          "Content-Type": "application/json",
          ...headers
        };
    
        const fetchOptions = {
          method,
          headers: mergedHeaders
        };
    
        // Stringify the body if it's an object
        if (body && typeof body === "object") {
          fetchOptions.body = JSON.stringify(body);
        }
    
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
    
        // If the server returns JSON, parse it
        return await response.json();
      }
    
      async post(endpoint, data) {
        return this.request(endpoint, { method: "POST", body: data });
      }
    
      // post(endpoint, body, options = {}) {
      //     return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
      // }

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }


    put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    // ================================
    // New Methods for Blob (PDF) Fetch
    // ================================

    async requestBlob(endpoint, { method = "GET", headers = {} } = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        // We do NOT set "Content-Type: application/json" here,
        // since we want to fetch binary data
        const fetchOptions = {
          method,
          headers: {
            ...headers
          }
        };

        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        // Return the raw PDF bytes as a Blob
        return await response.blob();
    }

    getBlob(endpoint, options = {}) {
      return this.requestBlob(endpoint, { ...options, method: 'GET' });
    }
}
