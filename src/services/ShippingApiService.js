// src/services/ShippingApiService.js
import { API_BASE_URL } from "./config"; // Adjust path

class ShippingApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.apiVersion = "v1.0";
    this.resourcePath = "shipping_methods/shipping";
  }

  _getAuthToken() {
    return localStorage.getItem("authToken");
  }

  async _handleApiResponse(response) {
    // ... (Keep your existing _handleApiResponse function as it's quite robust)
    // For brevity, I'll assume it's the same as the one in your last ShippingApiService example
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
            errorApiData.message ||
            errorApiData.messages ||
            JSON.stringify(errorApiData).substring(0, 200);
        } catch (e) {
          console.warn(
            "ShippingApiService: Could not parse JSON error response.",
            e
          );
        }
      } else {
        try {
          const textError = await response.text();
          if (textError) errorMessage = textError.substring(0, 500);
        } catch (e) {
          /* Ignore */
        }
      }
      const error = new Error(errorMessage);
      error.status = errorStatus;
      error.data = errorApiData;
      console.error("ShippingApiService API Error:", error);
      throw error;
    }
    if (response.status === 204) {
      return {
        success: true,
        message: "Operation successful (No Content)",
        data: null,
      };
    }
    if (contentType && contentType.includes("application/json")) {
      const responseData = await response.json();
      if (responseData && typeof responseData.success === "boolean") {
        return responseData;
      } else {
        console.warn(
          "ShippingApiService: Received JSON but not in expected format. Returning raw JSON.",
          responseData
        );
        return responseData;
      }
    } else if (response.status >= 200 && response.status < 300) {
      const textData = await response.text();
      return {
        success: true,
        message: textData || "Operation successful (non-JSON OK)",
        data: textData,
      };
    } else {
      throw new Error("Received unexpected response type from server.");
    }
  }

  async getAllShippingMethods() {
    // ... (Keep existing getAllShippingMethods - it looks good)
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}`;
    const token = this._getAuthToken();
    const headers = { Accept: "*/*" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn(
        "ShippingApiService: No auth token for getAllShippingMethods."
      );
    }
    try {
      const response = await fetch(url, { method: "GET", headers: headers });
      const result = await this._handleApiResponse(response);
      if (result && result.success && Array.isArray(result.data)) {
        return result.data;
      } else if (result && result.success === false) {
        throw new Error(result.message || "Failed to fetch shipping methods.");
      }
      console.warn(
        "ShippingApiService: getAllShippingMethods received unexpected data structure.",
        result
      );
      return [];
    } catch (error) {
      console.error("Error in getAllShippingMethods:", error);
      throw error;
    }
  }

  async createShippingMethod(shippingMethodData) {
    // ... (Keep existing createShippingMethod - it looks good)
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}`;
    const token = this._getAuthToken();
    if (!token) {
      return Promise.reject(new Error("Authentication required."));
    }
    if (
      !shippingMethodData ||
      !shippingMethodData.name ||
      typeof shippingMethodData.fee === "undefined"
    ) {
      return Promise.reject(new Error("Name and fee are required."));
    }
    const headers = {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const payload = {
      ...shippingMethodData,
      fee: parseFloat(shippingMethodData.fee) || 0,
      description: shippingMethodData.description || "",
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });
      const result = await this._handleApiResponse(response);
      if (
        result &&
        result.success &&
        result.data &&
        typeof result.data.shippingMethodId !== "undefined"
      ) {
        return result.data;
      } else if (result && result.success === false) {
        throw new Error(result.message || "Failed to create method.");
      }
      throw new Error("Unexpected data from create API.");
    } catch (error) {
      console.error("Error in createShippingMethod:", error);
      throw error;
    }
  }

  // --- NEW: Update Shipping Method ---
  /**
   * Updates an existing shipping method.
   * Assumes PUT /v1.0/shipping_methods/shipping/{shippingMethodId} or similar.
   * Adjust endpoint if ID is expected in the body.
   * @param {number} shippingMethodId - The ID of the method to update.
   * @param {Object} updateData - Object containing fields to update { name, fee, description }
   * @returns {Promise<Object>} The updated shipping method object from response.data.
   */
  async updateShippingMethod(shippingMethodId, updateData) {
    if (!shippingMethodId || typeof shippingMethodId !== "number") {
      return Promise.reject(
        new Error("Valid shippingMethodId is required for update.")
      );
    }
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/${shippingMethodId}`;
    const token = this._getAuthToken();
    if (!token) {
      return Promise.reject(
        new Error("Authentication required to update shipping method.")
      );
    }
    const headers = {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const payload = {
      ...updateData,
      fee: typeof updateData.fee !== "undefined" ? parseFloat(updateData.fee) : 0,
    };
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });
      const result = await this._handleApiResponse(response);
      if (result && result.success && result.data) {
        return result.data;
      } else if (result && result.success === false) {
        throw new Error(result.message || "Failed to update shipping method.");
      }
      throw new Error("Unexpected data structure from update shipping method API.");
    } catch (error) {
      console.error(`Error updating shipping method ${shippingMethodId}:`, error);
      throw error;
    }
  }

  // --- NEW: Delete Shipping Method ---
  /**
   * Deletes a shipping method.
   * Assumes DELETE /v1.0/shipping_methods/shipping/{shippingMethodId}
   * @param {number} shippingMethodId - The ID of the method to delete.
   * @returns {Promise<Object>} The API response object (e.g., { success, message }).
   */
  async deleteShippingMethod(shippingMethodId) {
    if (!shippingMethodId || typeof shippingMethodId !== "number") {
      return Promise.reject(
        new Error("Valid shippingMethodId is required for deletion.")
      );
    }
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/${shippingMethodId}`;
    const token = this._getAuthToken();

    if (!token) {
      return Promise.reject(
        new Error("Authentication required to delete shipping method.")
      );
    }

    const headers = {
      Accept: "*/*", // API might return simple success or no content
      Authorization: `Bearer ${token}`,
    };

    console.log(`ShippingApiService: Calling DELETE ${url}`);
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: headers,
      });
      // _handleApiResponse will handle 204 No Content or JSON success messages
      return this._handleApiResponse(response);
    } catch (error) {
      console.error(
        `Error deleting shipping method ${shippingMethodId}:`,
        error
      );
      throw error;
    }
  }
}

const shippingApiService = new ShippingApiService();
export default shippingApiService;
