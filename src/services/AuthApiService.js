import { API_BASE_URL } from './config'; // Adjust path as needed

class AuthApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Handles the response from the fetch API.
   * Checks for errors and parses JSON.
   * @param {Response} response - The fetch Response object.
   * @returns {Promise<any>} - The parsed JSON data.
   * @throws {Error} - If the response is not OK.
   */
  async _handleResponse(response) {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json(); // Try to parse error details from API
      } catch (e) {
        // If response body is not JSON or empty
        errorData = { message: response.statusText || 'An unknown error occurred' };
      }
      const error = new Error(errorData.message || `API Error: ${response.status}`);
      error.status = response.status;
      error.data = errorData; // Attach full error data if available
      throw error;
    }
    // If response is OK but has no content (e.g., 204 No Content)
    if (response.status === 204) {
      return null;
    }
    return response.json(); // Parse and return JSON data
  }

  /**
   * Logs in a user.
   * POST /v1.0/auths/login
   * @param {string} username - The user's username.
   * @param {string} password - The user's password.
   * @returns {Promise<{userId: string, username: string, email: string, role: string, status: string, authToken: string}>}
   */
  async login(username, password) {
    const url = `${this.baseUrl}/v1.0/auths/login`;
    const requestBody = {
      username,
      password,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Accept': 'application/json' // Server says */*, so this is optional but good practice
        },
        body: JSON.stringify(requestBody),
      });
      return this._handleResponse(response);
    } catch (error) {
      console.error('Login API call failed:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  }

  /**
   * Registers a new customer.
   * POST /v1.0/auths/register-cus
   * @param {string} email - The customer's email.
   * @param {string} username - The customer's username.
   * @param {string} password - The customer's password.
   * @returns {Promise<{messages: string, success: boolean, data: {userId: string, username: string, email: string, role: string, status: string}}>}
   */
  async registerCustomer(email, username, password) {
    const url = `${this.baseUrl}/v1.0/auths/register-cus`;
    const requestBody = {
      email,
      username,
      password,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });
      return this._handleResponse(response);
    } catch (error) {
      console.error('Register Customer API call failed:', error);
      throw error; // Re-throw
    }
  }
}

// Export an instance of the service
const authApiService = new AuthApiService();
export default authApiService;