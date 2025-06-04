// src/services/VoucherApiService.js
import { API_BASE_URL } from "./config"; // Adjust path as needed

class VoucherApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.apiVersion = "v1.0";
  }

  _getAuthToken() {
    return localStorage.getItem("authToken");
  }

  /**
   * Handles API responses, checks for errors, and parses JSON.
   * Can handle responses where 'data' is an array or an object.
   * @param {Response} response - The fetch Response object.
   * @returns {Promise<any>} - The 'data' payload from the API response or the full response if not standard.
   * @throws {Error} - If the response is not OK or data structure is unexpected.
   */
  async _handleResponse(response) {
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${
        response.statusText || ""
      }`;
      let errorStatus = response.status;
      let errorApiData = null;

      if (contentType && contentType.includes("application/json")) {
        try {
          errorApiData = await response.json();
          errorMessage =
            errorApiData.messages ||
            errorApiData.message ||
            JSON.stringify(errorApiData).substring(0, 200);
        } catch (e) {
          console.warn(
            "VoucherApiService: Could not parse JSON error response",
            e
          );
        }
      } else {
        try {
          const textError = await response.text();
          if (textError) errorMessage = textError.substring(0, 500);
        } catch (e) {
          /* Ignore if text body cannot be read */
        }
      }
      const error = new Error(errorMessage);
      error.status = errorStatus;
      error.data = errorApiData;
      console.error("VoucherApiService API Error:", error);
      throw error;
    }

    if (response.status === 204) {
      // No Content
      return {
        success: true,
        messages: "Operation successful (No Content)",
        data: null,
      };
    }

    // If we expect content (e.g., 200 OK with a body)
    if (contentType && contentType.includes("application/json")) {
      const responseData = await response.json();
      if (responseData && typeof responseData.success === "boolean") {
        if (responseData.success) {
          // Returns the 'data' field which could be an array (for lists) or an object (for single entities)
          return responseData; // Keep returning the full { messages, success, data } structure
          // The caller can then access responseData.data
        } else {
          const error = new Error(
            responseData.messages ||
              "API indicated operation was not successful."
          );
          error.data = responseData;
          throw error;
        }
      } else {
        // If it's JSON but not the expected {success, data} wrapper, but still 2xx
        console.warn(
          "VoucherApiService: Received JSON but not in expected {success, data} format. Returning raw JSON.",
          responseData
        );
        return responseData;
      }
    } else if (response.status >= 200 && response.status < 300) {
      // For 2xx responses that are not JSON (e.g., plain text success message)
      const textData = await response.text();
      return {
        success: true,
        messages: textData || "Operation successful (non-JSON OK)",
        data: textData,
      };
    } else {
      // Should have been caught by !response.ok, but as a fallback
      throw new Error("Received unexpected response type from server.");
    }
  }

  /**
   * Fetches all available vouchers.
   * GET /v1.0/voucher/available
   * @returns {Promise<Array<Object>>} Array of voucher objects from response.data.
   */
  async getAvailableVouchers() {
    const url = `${this.baseUrl}/${this.apiVersion}/voucher/available`;
    const token = this._getAuthToken();

    if (!token) {
      console.warn(
        "VoucherApiService: No auth token found for getAvailableVouchers."
      );
      return Promise.resolve({
        messages: "Auth token missing",
        success: false,
        data: [],
      }); // Or throw error
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await this._handleResponse(response);
      return Array.isArray(result.data) ? result.data : []; // Ensure data is an array
    } catch (error) {
      console.error("Error in getAvailableVouchers:", error);
      throw error;
    }
  }

  /**
   * Fetches all vouchers.
   * GET /v1.0/voucher/all
   * @returns {Promise<Array<Object>>} Array of voucher objects from response.data.
   */
  async getAllVouchers() {
    const url = `${this.baseUrl}/${this.apiVersion}/voucher/all`;
    const token = this._getAuthToken();

    if (!token) {
      console.warn(
        "VoucherApiService: No auth token found for getAvailableVouchers."
      );
      return Promise.resolve({
        messages: "Auth token missing",
        success: false,
        data: [],
      }); // Or throw error
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await this._handleResponse(response);
      return Array.isArray(result.data) ? result.data : []; // Ensure data is an array
    } catch (error) {
      console.error("Error in getAvailableVouchers:", error);
      throw error;
    }
  }

  // =========== NEW API FUNCTIONS START HERE ===========

  /**
   * Creates a new voucher.
   * POST /v1.0/voucher/create
   * @param {Object} voucherData - { code, discountAmount, minOrderAmount, expiryDate }
   * @returns {Promise<Object>} The created voucher object from response.data.
   */
  async createVoucher(voucherData) {
    const url = `${this.baseUrl}/${this.apiVersion}/voucher/create`;
    const token = this._getAuthToken();

    if (!token) {
      return Promise.reject(
        new Error("Authentication required to create voucher.")
      );
    }
    if (
      !voucherData ||
      !voucherData.code ||
      typeof voucherData.discountAmount === "undefined"
    ) {
      return Promise.reject(
        new Error(
          "Code and discountAmount are required for creating a voucher."
        )
      );
    }

    const headers = {
      Accept: "*/*", // As per API spec
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Ensure numeric fields are numbers
    const payload = {
      ...voucherData,
      discountAmount: parseFloat(voucherData.discountAmount) || 0,
      minOrderAmount: parseFloat(voucherData.minOrderAmount) || 0,
      // expiryDate should be ISO string e.g., "2025-06-03T08:55:57.139Z"
    };

    try {
      console.log("VoucherApiService: Creating voucher with payload:", payload);
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });
      const result = await this._handleResponse(response);
      return result.data; // Assuming data field contains the created voucher object
    } catch (error) {
      console.error("Error in createVoucher:", error);
      throw error;
    }
  }

  /**
   * Updates an existing voucher.
   * PUT /v1.0/voucher/update
   * @param {Object} voucherUpdateData - { voucherId, discountAmount, minOrderAmount, expiryDate, status }
   * @returns {Promise<Object>} The updated voucher object from response.data.
   */
  async updateVoucher(voucherUpdateData) {
    const url = `${this.baseUrl}/${this.apiVersion}/voucher/update`;
    const token = this._getAuthToken();

    if (!token) {
      return Promise.reject(
        new Error("Authentication required to update voucher.")
      );
    }
    if (
      !voucherUpdateData ||
      typeof voucherUpdateData.voucherId === "undefined"
    ) {
      return Promise.reject(
        new Error("voucherId is required for updating a voucher.")
      );
    }

    const headers = {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Ensure numeric fields are numbers
    const payload = { ...voucherUpdateData };
    if (typeof payload.discountAmount !== "undefined")
      payload.discountAmount = parseFloat(payload.discountAmount) || 0;
    if (typeof payload.minOrderAmount !== "undefined")
      payload.minOrderAmount = parseFloat(payload.minOrderAmount) || 0;

    try {
      console.log("VoucherApiService: Updating voucher with payload:", payload);
      const response = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(payload),
      });
      const result = await this._handleResponse(response);
      return result.data; // Assuming data field contains the updated voucher object
    } catch (error) {
      console.error("Error in updateVoucher:", error);
      throw error;
    }
  }

  /**
   * Changes the status of a voucher.
   * PUT /v1.0/voucher/change-status?voucherId={voucherId}&status={status}
   * @param {number} voucherId
   * @param {string} status
   * @returns {Promise<Object>} The voucher object with updated status from response.data.
   */
  async changeVoucherStatus(voucherId, status) {
    if (
      typeof voucherId !== "number" ||
      voucherId <= 0 ||
      !status ||
      typeof status !== "string"
    ) {
      return Promise.reject(
        new Error("Valid voucherId and status are required.")
      );
    }
    const url = `${this.baseUrl}/${
      this.apiVersion
    }/voucher/change-status?voucherId=${voucherId}&status=${encodeURIComponent(
      status
    )}`;
    const token = this._getAuthToken();

    if (!token) {
      return Promise.reject(
        new Error("Authentication required to change voucher status.")
      );
    }

    const headers = {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
      // No Content-Type needed for PUT with query params and no body
    };

    try {
      console.log(
        `VoucherApiService: Changing status for voucher ${voucherId} to ${status}`
      );
      const response = await fetch(url, {
        method: "PUT",
        headers: headers,
        // No body for this PUT request
      });
      const result = await this._handleResponse(response);
      return result.data; // Assuming data field contains the updated voucher object
    } catch (error) {
      console.error("Error in changeVoucherStatus:", error);
      throw error;
    }
  }
  // =========== NEW API FUNCTIONS END HERE ===========
}

const voucherApiService = new VoucherApiService();
export default voucherApiService;
