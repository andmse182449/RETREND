// src/services/OrderItemsApiService.js
import { API_BASE_URL } from "./config"; // Adjust path as needed

class OrderItemsApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.apiVersion = "v1.0";
    this.resourcePath = "order-items";
  }

  _getAuthToken() {
    return localStorage.getItem("authToken");
  }

  async _handleResponse(response) {
    const contentType = response.headers.get("content-type");
    let responseDataField; // To store the 'data' field specifically

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
            "OrderItemsApiService: Could not parse JSON error response",
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
      console.error("OrderItemsApiService API Error:", error);
      throw error;
    }

    if (response.status === 204) {
      return {
        success: true,
        messages: "Operation successful (No Content)",
        data: null,
      };
    }

    if (contentType && contentType.includes("application/json")) {
      const fullResponse = await response.json();
      if (fullResponse && typeof fullResponse.success === "boolean") {
        if (fullResponse.success) {
          // Return the 'data' part of the successful response
          // The GET list_by_username includes 'username' at top level,
          // but we primarily care about the 'data' array for items.
          // For create, 'data' is the created object.
          responseDataField = fullResponse.data;
          // Optionally return the full response if messages/top-level username are needed by caller
          // return fullResponse;
          return responseDataField; // Simpler for direct data usage
        } else {
          const error = new Error(
            fullResponse.messages ||
              "API indicated operation was not successful."
          );
          error.data = fullResponse;
          throw error;
        }
      } else {
        console.warn(
          "OrderItemsApiService: Received JSON but not in expected {success, data} format. Returning raw JSON.",
          fullResponse
        );
        return fullResponse;
      }
    } else if (response.status >= 200 && response.status < 300) {
      // OK but not JSON
      const textData = await response.text();
      return {
        success: true,
        messages: textData || "Operation successful (non-JSON OK)",
        data: textData,
      };
    } else {
      throw new Error("Received unexpected response type from server.");
    }
  }

  /**
   * Transforms a single order item from the API.
   * @param {Object} apiOrderItem - The order item object from the API.
   * @returns {Object} - The transformed order item object.
   */
  _transformApiOrderItem(apiOrderItem) {
    if (!apiOrderItem) return null;
    return {
      orderItemsId: apiOrderItem.orderItemsId,
      productId: apiOrderItem.productId,
      username: apiOrderItem.username, // User who owns this order item
    };
  }

  /**
   * Creates an order item.
   * POST /v1.0/order-items/create
   * Request body: { username: string, productId: number }
   * @param {string} username - The username of the user adding the item.
   * @param {number} productId - The ID of the product to add.
   * @returns {Promise<Object>} The transformed created order item object
   *                            (e.g., { orderItemsId, productId, username }).
   */
  async createOrderItem(username, productId) {
    if (!username || typeof username !== "string" || username.trim() === "") {
      return Promise.reject(new Error("Username is required."));
    }
    if (typeof productId !== "number" || productId <= 0) {
      return Promise.reject(new Error("Invalid productId provided."));
    }

    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/create`;
    const token = this._getAuthToken();

    const headers = {
      Accept: "*/*",
      "Content-Type": "application/json", // Sending a JSON body
    };

    if (!token) {
      console.warn(
        "OrderItemsApiService: No auth token found for 'createOrderItem'."
      );
      return Promise.reject(new Error("Authentication token not found."));
    }
    headers["Authorization"] = `Bearer ${token}`;

    const payload = {
      username: username,
      productId: productId,
    };

    console.log(
      `OrderItemsApiService: Calling POST ${url} with payload:`,
      payload
    );
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });
      const createdOrderItemData = await this._handleResponse(response); 
      return this._transformApiOrderItem(createdOrderItemData);
    } catch (error) {
      console.error(
        `OrderItemsApiService: createOrderItem failed for productId ${productId}, user ${username}`,
        error
      );
      throw error;
    }
  }

  /**
   * Deletes an order item.
   * DELETE /v1.0/order-items/delete/{orderItemId}
   * @param {number} orderItemId - The ID of the order item to delete.
   * @returns {Promise<Object>} The API response object (e.g., {success, messages, data: null}).
   */
  async deleteOrderItem(orderItemId) {
    // ... (Keep existing deleteOrderItem logic as it's standard for DELETE)
    if (typeof orderItemId !== "number" || orderItemId <= 0) {
      return Promise.reject(new Error("Invalid orderItemId provided."));
    }
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/delete/${orderItemId}`;
    const token = this._getAuthToken();
    const headers = { Accept: "*/*" };
    if (!token) {
      console.warn(
        "OrderItemsApiService: No auth token for 'deleteOrderItem'."
      );
      return Promise.reject(new Error("Authentication token not found."));
    } else {
      headers["Authorization"] = `Bearer ${token}`;
    }
    console.log(`OrderItemsApiService: Calling DELETE ${url}`);
    try {
      const response = await fetch(url, { method: "DELETE", headers: headers });
      return this._handleResponse(response); // Returns full {success, messages, data: null}
    } catch (error) {
      console.error(
        `OrderItemsApiService: deleteOrderItem failed for orderItemId ${orderItemId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Fetches all order items for a specific order ID.
   * GET /v1.0/order-items/order/{orderId}
   * @param {string|number} orderId - The ID of the order.
   * @returns {Promise<Array<Object>>} An array of transformed order item objects.
   */
  async getOrderItemsByOrderId(orderId) {
    // ... (Keep existing getOrderItemsByOrderId logic)
    if (
      !orderId ||
      (typeof orderId !== "number" && typeof orderId !== "string") ||
      String(orderId).trim() === ""
    ) {
      return Promise.resolve([]);
    }
    const url = `${this.baseUrl}/${this.apiVersion}/${
      this.resourcePath
    }/order/${encodeURIComponent(orderId)}`;
    const token = this._getAuthToken();
    const headers = { Accept: "*/*" };
    if (!token) {
      console.warn(
        `OrderItemsApiService: No auth token for order '${orderId}'.`
      );
      return Promise.reject(new Error("Authentication required."));
    }
    headers["Authorization"] = `Bearer ${token}`;
    console.log(`OrderItemsApiService: Calling GET ${url}`);
    try {
      const response = await fetch(url, { method: "GET", headers: headers });
      const orderItemListData = await this._handleResponse(response); // Returns 'data' part, which is an array
      if (!Array.isArray(orderItemListData)) {
        console.warn(
          `OrderItemsApiService: getOrderItemsByOrderId for order ${orderId} expected array, got:`,
          orderItemListData
        );
        return [];
      }
      return orderItemListData
        .map(this._transformApiOrderItem)
        .filter((item) => item !== null);
    } catch (error) {
      console.error(
        `OrderItemsApiService: getOrderItemsByOrderId failed for orderId ${orderId}`,
        error
      );
      throw error;
    }
  }

  // --- NEW API FUNCTION ---
  /**
   * Fetches all order items associated with a specific username.
   * GET /v1.0/order-items/get-items-by-username/{username}
   * @param {string} username - The username of the user.
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of transformed order item objects.
   * @throws {Error} If the API call fails or token is missing for a protected route.
   */
  async getOrderItemsByUsername(username) {
    // ... (implementation from previous answer, ensure it calls this._transformApiOrderItem) ...
    // and returns the array of {orderItemsId, productId, username}
    if (!username || typeof username !== "string" || username.trim() === "") {
      return Promise.resolve([]);
    }
    const url = `${this.baseUrl}/${this.apiVersion}/${
      this.resourcePath
    }/get-items-by-username/${encodeURIComponent(username)}`;
    const token = this._getAuthToken();
    const headers = { Accept: "*/*" };
    if (!token) {
      console.warn(`OrderItemsApiService: No auth token for '${username}'.`);
      return Promise.reject(new Error("Auth required."));
    }
    headers["Authorization"] = `Bearer ${token}`;
    try {
      const response = await fetch(url, { method: "GET", headers: headers });
      const orderItemListData = await this._handleResponse(response); // Returns data array
      if (!Array.isArray(orderItemListData)) {
        return [];
      }
      return orderItemListData
        .map(this._transformApiOrderItem)
        .filter((item) => item !== null);
    } catch (error) {
      console.error(
        `OrderItemsApiService: getOrderItemsByUsername failed for ${username}`,
        error
      );
      throw error;
    }
  }
}

const orderItemsApiService = new OrderItemsApiService();
export default orderItemsApiService;
