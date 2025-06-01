// src/services/VoucherApiService.js
import { API_BASE_URL } from './config';

class VoucherApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async _handleResponse(response) {
    if (!response.ok) {
      let errorData;
      let errorMessage = 'An unknown error occurred';
      try {
        errorData = await response.json();
        errorMessage = errorData.messages || errorData.message || `API Error: ${response.status}`;
        console.log("API error response data:", errorData);
      } catch (e) {
        errorMessage = response.statusText || 'An unknown error occurred (and no JSON error body)';
        errorData = { message: errorMessage }; // Ensure errorData has a message
        console.log("API error, but response body was not JSON. Status text:", response.statusText);
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = errorData;
      console.error("API Error (from _handleResponse):", error.status, errorData);
      throw error;
    }

    // If response is OK but has no content (e.g., 204 No Content)
    if (response.status === 204) {
      return null; // Or an empty array if that's more appropriate for vouchers
    }

    try {
      const responseData = await response.json();
      // --- MODIFICATION HERE ---
      // Check if the response structure matches the expected { success: true, data: [...] }
      if (responseData && typeof responseData.success === 'boolean' && Array.isArray(responseData.data)) {
        if (responseData.success) {
          return responseData.data; // Return the array of vouchers
        } else {
          // If success is false, use the message from the API
          const errorMessage = responseData.messages || 'API indicated failure but no specific message.';
          console.warn("API call successful (status 200) but operation failed:", errorMessage, responseData);
          const error = new Error(errorMessage);
          error.status = response.status; // Keep original status
          error.data = responseData; // Attach full response data
          throw error;
        }
      } else {
        // If the structure is not as expected, but status was OK
        console.error("Received unexpected JSON structure from server:", responseData);
        throw new Error("Received unexpected data structure from server.");
      }
    } catch (e) {
      // This catch handles errors from response.json() itself or errors thrown above
      if (e instanceof Error && e.message.startsWith("Received unexpected data structure")) {
        throw e; // Re-throw our custom error
      }
      if (e instanceof Error && e.message.startsWith("API indicated failure")) {
        throw e; // Re-throw our custom error
      }
      console.error("Failed to parse JSON response or unexpected structure (even on OK status):", e);
      // Attempt to get text if json parsing failed for other reasons
      try {
        const textResponse = await response.text();
        console.error("Response text was:", textResponse);
      } catch (textErr) {
        // Ignore error from response.text() if it also fails
      }
      throw new Error("Received non-JSON or malformed response from server.");
    }
  }

  async getAvailableVouchers() {
    const url = `${this.baseUrl}/v1.0/voucher/available`;
    const token = localStorage.getItem('authToken');

    console.log("Attempting to fetch vouchers. Token found:", !!token);

    if (!token) {
      console.warn("No auth token found, skipping voucher fetch.");
      return []; // Return empty array if no token
    }

    try {
      console.log("Fetching vouchers from URL:", url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log("Received response from /voucher/available:", response.status, response.ok);
      return this._handleResponse(response); // This will now return the data array
    } catch (error) {
      console.error('Get Available Vouchers API call failed (outer catch):', error, error.status, error.data);
      throw error;
    }
  }
}

const voucherApiService = new VoucherApiService();
export default voucherApiService;