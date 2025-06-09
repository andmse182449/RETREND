// src/services/AdminAPIService.js
import { API_BASE_URL } from './config';

class AdminAPIService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.apiVersion = 'v1.0';
    this.resourcePath = 'admin';
  }

  _getAuthToken() {
    return localStorage.getItem('authToken');
  }

  async _handleApiResponse(response) {
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText || ''}`;
      let errorStatus = response.status;
      let errorApiData = null;

      if (contentType && contentType.includes("application/json")) {
        try {
          errorApiData = await response.json();
          errorMessage = errorApiData.message || errorApiData.messages || JSON.stringify(errorApiData).substring(0, 200);
        } catch (e) {
          console.warn("AdminAPIService: Could not parse JSON error response.", e);
        }
      } else {
        try {
          const textError = await response.text();
          if (textError) errorMessage = textError.substring(0, 500);
        } catch (e) {}
      }
      const error = new Error(errorMessage);
      error.status = errorStatus;
      error.data = errorApiData;
      console.error('AdminAPIService API Error:', error);
      throw error;
    }

    if (response.status === 204) {
      return { success: true, message: "Operation successful (No Content)", data: null };
    }

    if (contentType && contentType.includes("application/json")) {
      const responseData = await response.json();
      return responseData;
    } else if (response.status >= 200 && response.status < 300) {
      const textData = await response.text();
      return { success: true, message: textData || "Operation successful (non-JSON OK)", data: textData };
    } else {
      throw new Error("Received unexpected response type from server.");
    }
  }

  async getTotalOrderCountByStatus() {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/total_order/status`;
    const token = this._getAuthToken();

    const headers = {
      'Accept': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      
      const result = await this._handleApiResponse(response);
      
      // Ensure the response structure matches what we expect
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      // The data should be a map of status to count
      if (!result.data || typeof result.data !== 'object') {
        console.warn('Order count by status data is not in expected format', result);
        return {
          success: result.success || false,
          message: result.message || 'Data format unexpected',
          data: {} // Return empty object instead of failing
        };
      }
      
      return result;
    } catch (error) {
      console.error('AdminAPIService: getTotalOrderCountByStatus failed:', error);
      // Return a consistent error structure
      throw {
        success: false,
        message: error.message || 'Failed to fetch order counts by status',
        data: null
      };
    }
}

  async getTotalOrderCount() {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/total_order`;
    const token = this._getAuthToken();

    const headers = {
      'Accept': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      return this._handleApiResponse(response);
    } catch (error) {
      console.error('AdminAPIService: getTotalOrderCount failed:', error);
      throw error;
    }
  }

  async getTotalPrice() {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/total_price`;
    const token = this._getAuthToken();

    const headers = {
      'Accept': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      return this._handleApiResponse(response);
    } catch (error) {
      console.error('AdminAPIService: getTotalPrice failed:', error);
      throw error;
    }
  }

  async getTotalCustomer() {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/total_customer`;
    const token = this._getAuthToken();

    const headers = {
      'Accept': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      return this._handleApiResponse(response);
    } catch (error) {
      console.error('AdminAPIService: getTotalCustomer failed:', error);
      throw error;
    }
  }
}

const adminAPIService = new AdminAPIService();
export default adminAPIService;
