// src/services/OrderItemsApiService.js
import { API_BASE_URL } from './config'; // Adjust path as needed

class OrderItemsApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.apiVersion = 'v1.0'; // Centralize API version
  }

  /**
   * Helper to get the authentication token from localStorage.
   * @returns {string|null} The auth token or null if not found.
   */
  _getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Handles the API response, checks for errors, and parses JSON.
   * @param {Response} response - The fetch Response object.
   * @returns {Promise<any>} - The parsed JSON data.
   * @throws {Error} - If the response is not OK or data structure is unexpected.
   */
  async _handleResponse(response) {
    const contentType = response.headers.get("content-type");
    let responseData;

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText || ''}`;
      let errorStatus = response.status;
      let errorApiData = null;

      if (contentType && contentType.includes("application/json")) {
        try {
          errorApiData = await response.json();
          errorMessage = errorApiData.messages || errorApiData.message || JSON.stringify(errorApiData).substring(0, 200);
        } catch (e) {
          // JSON parsing failed, stick with statusText
          console.warn("OrderItemsApiService: Could not parse JSON error response", e);
        }
      } else {
        try {
          const textError = await response.text();
          if (textError) {
            errorMessage = textError.substring(0, 500); // Show beginning of HTML/text error
          }
        } catch (e) {
            // Failed to read text body
        }
      }
      const error = new Error(errorMessage);
      error.status = errorStatus;
      error.data = errorApiData; // Attach parsed JSON error data if available
      console.error('OrderItemsApiService API Error:', error);
      throw error;
    }

    // Handle 204 No Content for DELETE or other successful empty responses
    if (response.status === 204) {
      return { success: true, messages: "Operation successful (No Content)" , data: null }; // Or just return null
    }
    
    // For successful responses with content (e.g., 200 OK for POST create)
    if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
        // Assuming your successful responses also follow { messages, success, data }
        if (responseData && typeof responseData.success === 'boolean') {
            if (responseData.success) {
                return responseData; // Return the full response object { messages, success, data }
            } else {
                const error = new Error(responseData.messages || 'API indicated operation was not successful.');
                error.data = responseData;
                throw error;
            }
        } else {
            // If it's JSON but not the expected structure, but still a 2xx response
            console.warn("OrderItemsApiService: Received JSON but not in expected {success, data} format. Returning raw JSON.", responseData);
            return responseData; 
        }
    } else {
        // If response is OK but not JSON (e.g. just plain text for a simple OK message)
        // For DELETE, a 200 OK with no body or non-JSON body is also possible
        // The API spec says DELETE /v1.0/order-items/delete/{orderItemId} returns 200 OK with no specified body schema.
        // Let's assume it's a success if we reach here for a non-JSON 200.
        return { success: true, messages: "Operation successful (non-JSON 200 OK)", data: null };
    }
  }

  /**
   * Creates an order item.
   * POST /v1.0/order-items/create?productId={productId}
   * @param {number} productId - The ID of the product to add to the order.
   * @returns {Promise<{messages: string, success: true, data: {orderItemsId: number, productId: number}}>}
   * @throws {Error} If the API call fails or token is missing for a protected route.
   */
  async createOrderItem(productId) {
    if (typeof productId !== 'number' || productId <= 0) {
        return Promise.reject(new Error("Invalid productId provided."));
    }

    const url = `${this.baseUrl}/${this.apiVersion}/order-items/create?productId=${productId}`;
    const token = this._getAuthToken();

    const headers = {
      'Accept': '*/*', // As per API spec
      // 'Content-Type': 'application/json', // POST usually has this, but this endpoint takes productId via query param
    };

    if (!token) {
      // If this endpoint is protected, throw an error or handle as per your app's auth flow
      // For now, we'll log a warning and proceed; the backend will return 401 if protected.
      console.warn("OrderItemsApiService: No auth token found. 'createOrderItem' might fail if endpoint is protected.");
      // return Promise.reject(new Error("Authentication token not found.")); // Option: Fail early
    } else {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`OrderItemsApiService: Calling POST ${url}`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        // No body for this POST request as per the API spec (productId is a query parameter)
      });
      return this._handleResponse(response);
    } catch (error) {
      // Network errors or errors from _handleResponse
      console.error(`OrderItemsApiService: createOrderItem failed for productId ${productId}`, error);
      throw error; // Re-throw to be handled by the caller
    }
  }

  /**
   * Deletes an order item.
   * DELETE /v1.0/order-items/delete/{orderItemId}
   * @param {number} orderItemId - The ID of the order item to delete.
   * @returns {Promise<{success: true, messages: string, data: null}>} A promise that resolves on successful deletion.
   * @throws {Error} If the API call fails or token is missing for a protected route.
   */
  async deleteOrderItem(orderItemId) {
    if (typeof orderItemId !== 'number' || orderItemId <= 0) {
        return Promise.reject(new Error("Invalid orderItemId provided."));
    }
    
    const url = `${this.baseUrl}/${this.apiVersion}/order-items/delete/${orderItemId}`;
    const token = this._getAuthToken();

    const headers = {
      'Accept': '*/*', // As per API spec
    };

    if (!token) {
      console.warn("OrderItemsApiService: No auth token found. 'deleteOrderItem' might fail if endpoint is protected.");
      // return Promise.reject(new Error("Authentication token not found.")); // Option: Fail early
    } else {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`OrderItemsApiService: Calling DELETE ${url}`);
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });
      // The API spec says 200 OK with no defined response body for DELETE.
      // _handleResponse will manage this.
      return this._handleResponse(response);
    } catch (error) {
      console.error(`OrderItemsApiService: deleteOrderItem failed for orderItemId ${orderItemId}`, error);
      throw error;
    }
  }
}


const orderItemsApiService = new OrderItemsApiService();
export default orderItemsApiService;
