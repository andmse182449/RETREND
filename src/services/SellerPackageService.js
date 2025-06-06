// src/services/SellerPackageService.js
import { API_BASE_URL } from './config'; // Adjust path if your config.js is elsewhere

class SellerPackageService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.apiVersion = 'v1.0';
    this.resourcePath = 'seller-package';
  }

  _getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Handles API responses specifically for the seller package creation.
   * Expects a direct JSON object { checkoutUrl, qrCode } on success.
   * @param {Response} response - The fetch Response object.
   * @returns {Promise<Object>} - The object { checkoutUrl, qrCode }.
   * @throws {Error} If the response is not OK or data is missing.
   */
  async _handleCreatePackageResponse(response) {
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText || ''}`;
      let errorStatus = response.status;
      try {
        // Attempt to get more specific error message if backend sends JSON error
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.messages || JSON.stringify(errorData).substring(0, 200);
      } catch (e) {
        // If error response is not JSON, use the text or statusText
        try {
            const textError = await response.text();
            if (textError) errorMessage = textError.substring(0, 500);
        } catch (textEx) { /* Fallback to statusText */ }
      }
      const error = new Error(errorMessage);
      error.status = errorStatus;
      console.error('SellerPackageService API Error:', error);
      throw error;
    }

    // For successful responses (200 OK), expect JSON directly
    if (response.headers.get("content-type")?.includes("application/json")) {
      const responseData = await response.json();
      if (responseData && responseData.checkoutUrl && responseData.qrCode) {
        return responseData; // Returns { checkoutUrl, qrCode }
      } else {
        console.error("SellerPackageService: Unexpected JSON structure for create package response.", responseData);
        throw new Error("Unexpected data structure from server after creating seller package.");
      }
    } else {
        // This endpoint is expected to return JSON
        throw new Error("Received non-JSON response from server for create seller package.");
    }
  }

  /**
   * Creates a seller package payment link for a given username.
   * This action typically initiates a payment process (e.g., via PayOS).
   * POST /v1.0/seller-package/create/{username}
   * @param {string} username - The username for whom the seller package is being created/purchased.
   * @returns {Promise<{checkoutUrl: string, qrCode: string}>} An object containing the PayOS checkout URL and QR code data.
   * @throws {Error} If the API call fails or the user is not authenticated.
   */
  async createSellerPackagePayment(username) {
    if (!username || typeof username !== 'string' || username.trim() === "") {
      console.error("SellerPackageService: Username is required.");
      return Promise.reject(new Error("Username is required to create a seller package."));
    }

    const url = `${this.baseUrl}/v1.0/seller-package/create/${encodeURIComponent(username)}`;
    const token = this._getAuthToken();

    if (!token) {
      console.error("SellerPackageService: Authentication token required to create seller package.");
      return Promise.reject(new Error("Authentication required."));
    }

    const headers = {
      'Accept': '*/*', // As per your API spec
      'Authorization': `Bearer ${token}`,
      // 'Content-Type' is not strictly needed for POST with empty body,
      // but some backends might expect it. If issues, add: 'Content-Type': 'application/json'
    };

    try {
      console.log(`SellerPackageService: Calling POST ${url} to create seller package for ${username}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: '' // Empty body as per your curl command (-d '')
      });

      return this._handleCreatePackageResponse(response);
    } catch (error) {
      // Catches network errors or errors thrown by _handleCreatePackageResponse
      console.error(`Error in createSellerPackagePayment for username '${username}':`, error);
      throw error; // Re-throw for the calling component to handle
    }
  }
}

// Export a single instance of the service
const sellerPackageApiService = new SellerPackageService();
export default sellerPackageApiService;

// Or, if you prefer to instantiate it yourself when you use it:
// export { SellerPackageService };