// src/services/FeedbackApiService.js
import { API_BASE_URL } from './config'; // Adjust path if your config.js is elsewhere

class FeedbackApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.apiVersion = 'v1.0';
    this.resourcePath = 'feedback'; // Base resource path for feedback
  }

  _getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Handles API responses, checks for errors, and parses JSON.
   * Expects API response in the format: { success, message/messages, data }
   * @param {Response} response - The fetch Response object.
   * @returns {Promise<Object>} - The full API response object { success, message, data }.
   * @throws {Error} If the response is not OK or data structure is unexpected.
   */
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
          console.warn("FeedbackApiService: Could not parse JSON error response.", e);
        }
      } else {
        try {
          const textError = await response.text();
          if (textError) errorMessage = textError.substring(0, 500);
        } catch (e) { /* Ignore if text body cannot be read */ }
      }
      const error = new Error(errorMessage);
      error.status = errorStatus;
      error.data = errorApiData;
      console.error('FeedbackApiService API Error:', error);
      throw error;
    }

    if (response.status === 204) { // No Content
      return { success: true, message: "Operation successful (No Content)", data: null };
    }

    if (contentType && contentType.includes("application/json")) {
      const responseData = await response.json();
      if (responseData && typeof responseData.success === 'boolean') {
        return responseData; 
      } else {
        console.warn("FeedbackApiService: Received JSON but not in expected {success, message, data} format. Returning raw JSON.", responseData);
        return responseData; 
      }
    } else if (response.status >= 200 && response.status < 300) {
      const textData = await response.text();
      return { success: true, message: textData || "Operation successful (non-JSON OK)", data: textData };
    } else {
      throw new Error("Received unexpected response type from server.");
    }
  }

  /**
   * Submits new feedback.
   * POST /v1.0/feedback/feedback
   * @param {Object} feedbackData - { content: string, rating: string }
   * @returns {Promise<Object>} The created feedback object from response.data.
   * @throws {Error} If the API call fails or token is missing for a protected route.
   */
  async submitFeedback(feedbackData) {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/feedback`;
    const token = this._getAuthToken();

    if (!token) {
      // This action likely requires a user to be logged in.
      console.error("FeedbackApiService: Authentication token required to submit feedback.");
      return Promise.reject(new Error("Authentication required to submit feedback."));
    }
    if (!feedbackData || typeof feedbackData.content === 'undefined' || typeof feedbackData.rating === 'undefined') {
      return Promise.reject(new Error("Content and rating are required for submitting feedback."));
    }

    const headers = {
      'Accept': '*/*', // As per API spec
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Ensure rating is a string as per API spec, even if it's numeric-like
    const payload = {
      content: String(feedbackData.content),
      rating: String(feedbackData.rating), 
    };

    console.log(`FeedbackApiService: Calling POST ${url} with payload:`, payload);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });
      const result = await this._handleApiResponse(response); // result is { success, message, data }

      if (result && result.success && result.data && typeof result.data.feedbackId !== 'undefined') {
        return result.data; // Return the created feedback object
      } else if (result && result.success === false) {
        throw new Error(result.message || "Failed to submit feedback.");
      }
      console.warn("FeedbackApiService: submitFeedback received unexpected data structure after handling.", result);
      throw new Error("Unexpected data structure from submit feedback API.");
    } catch (error) {
      console.error('Error in submitFeedback:', error);
      throw error;
    }
  }

  /**
   * Fetches all feedback entries.
   * GET /v1.0/feedback/list_feedback
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of feedback objects from response.data.
   * @throws {Error} If the API call fails or token is missing for a protected route.
   */
  async getAllFeedback() {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/list_feedback`;
    const token = this._getAuthToken();

    const headers = {
      'Accept': '*/*', // As per API spec
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // This endpoint might be for admins or might require some form of auth.
      // Your curl example doesn't show a token, but listing all feedback often is protected.
      // Adjust based on actual requirements.
      console.warn("FeedbackApiService: No auth token found for getAllFeedback. Endpoint might be protected.");
    }
    
    console.log(`FeedbackApiService: Calling GET ${url}`);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      const result = await this._handleApiResponse(response); // result is { success, message, data }
      
      if (result && result.success && Array.isArray(result.data)) {
        return result.data; // Return the array of feedback entries
      } else if (result && result.success === false) {
        throw new Error(result.message || "Failed to fetch feedback list.");
      }
      console.warn("FeedbackApiService: getAllFeedback received unexpected data structure after handling.", result);
      return []; // Fallback to empty array
    } catch (error) {
      console.error('Error in getAllFeedback:', error);
      throw error;
    }
  }

  // TODO: Add transformFeedback if needed for frontend display consistency
  // function transformFeedback(apiFeedback) {
  //   return {
  //     id: apiFeedback.feedbackId,
  //     submittedOn: new Date(apiFeedback.dateSubmitted),
  //     text: apiFeedback.content,
  //     ratingValue: apiFeedback.rating, // API shows rating as string, might need parsing if it's numeric
  //     responseText: apiFeedback.response, // Only in POST response 'data'
  //     // Add other transformations
  //   };
  // }
}

// Export a single instance of the service
const feedbackApiService = new FeedbackApiService();
export default feedbackApiService;