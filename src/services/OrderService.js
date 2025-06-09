// src/services/orderService.js
import { API_BASE_URL } from "./config";


/**
 * Handles common API response logic.
 * @param {Response} response - The fetch Response object.
 * @returns {Promise<any>} - The parsed JSON data, typically the 'data' array/object.
 * @throws {Error} - If the response is not OK or data structure is unexpected.
 */
async function handleApiResponse(response) {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${
      response.statusText || ""
    }`;
    let errorStatus = response.status;

    try {
      const errorText = await response.text();
      if (response.headers.get("content-type")?.includes("application/json")) {
        const errorData = JSON.parse(errorText);
        errorMessage =
          errorData.messages ||
          errorData.message ||
          errorText.substring(0, 200);
      } else if (errorText) {
        errorMessage = errorText.substring(0, 500);
      }
    } catch (e) {
      console.warn("OrderService: Could not parse error response body:", e);
    }

    const error = new Error(errorMessage);
    error.status = errorStatus;
    console.error("OrderService API Error:", error);
    throw error;
  }

  if (response.status === 204) {
    // No Content
    return null; // Or empty array if expecting a list
  }

  let responseData;
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    // If not JSON, return text or null
    responseData = await response.text();
    if (!responseData) return null;
    // Optionally, wrap as object
    responseData = { message: responseData };
  }

  if (responseData && typeof responseData.success === "boolean") {
    if (responseData.success) {
      return responseData.data; // Return the actual data payload
    } else {
      const error = new Error(
        responseData.messages || "API indicated operation was not successful."
      );
      error.data = responseData;
      throw error;
    }
  } else {
    // Fallback if the structure is not { success, data } but still 2xx
    console.warn(
      "OrderService: API response not in expected {success, data} format. Returning raw data.",
      responseData
    );
    return responseData;
  }
}
/**
 * Transforms a single order object from the API.
 * @param {Object} apiOrder - The order object from the API.
 * @returns {Object} - The transformed order object.
 */
function transformApiOrder(apiOrder) {
  if (!apiOrder) return null;
  return {
    id: apiOrder.orderId,
    userId: apiOrder.userId,
    shippingId: apiOrder.shippingId,
    shippingAddress: apiOrder.shippingAddress,
    methodPayment: apiOrder.methodPayment,
    voucherId: apiOrder.voucherId === 0 ? null : apiOrder.voucherId, // Treat 0 as no voucher
    subtotal: parseFloat(apiOrder.subtotal) || 0,
    totalPrice: parseFloat(apiOrder.totalPrice) || 0,
    status: apiOrder.status || "Unknown",
    createdAt: apiOrder.createdAt ? new Date(apiOrder.createdAt) : new Date(), // Ensure Date object
    // You might want to fetch order items separately or if they are nested, transform them here
    // orderItems: apiOrder.orderItems ? apiOrder.orderItems.map(transformOrderItem) : [],
  };
}

/**
 * Fetches all orders for a given userId.
 * Requires an authentication token.
 * @param {string} userId - The ID of the user whose orders to fetch.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of transformed order objects.
 */
export const getOrdersByUserId = async (userId) => {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    console.error(
      "getOrdersByUserId: userId is required and must be a non-empty string."
    );
    return Promise.resolve([]); // Or throw new Error("Invalid userId");
  }

  const url = `${API_BASE_URL}/v1.0/orders/user/${encodeURIComponent(userId)}`;
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.warn(
      "OrderService: No authToken found. Request to get orders by userId will likely fail."
    );
    // Depending on policy, you might throw an error or let the backend handle 401.
    // For now, proceed and let backend respond.
    // return Promise.reject(new Error("Authentication token not found."));
  }

  const headers = {
    Accept: "*/*", // As per your API spec
    // 'Content-Type': 'application/json', // Not needed for GET
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    console.log(
      `OrderService: Fetching orders for userId '${userId}' from URL: ${url}`
    );
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    const apiOrderList = await handleApiResponse(response); // Expects an array in responseData.data

    if (!Array.isArray(apiOrderList)) {
      console.error(
        "OrderService: Expected an array of orders from API, received:",
        apiOrderList
      );
      return []; // Return empty if the data part is not an array
    }

    return apiOrderList
      .map(transformApiOrder)
      .filter((order) => order !== null);
  } catch (error) {
    console.error(
      `Error in getOrdersByUserId for userId '${userId}':`,
      error.message,
      error.status ? `(Status: ${error.status})` : ""
    );
    return []; // Return empty array on error
  }
};

/**
 * Buys a blindbox for a user.
 * @param {Object} params - The parameters for buying a blindbox.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.blindboxName - The name of the blindbox.
 * @param {number} params.shippingId - The shipping ID.
 * @param {string} params.shippingAddress - The shipping address.
 * @param {string} params.methodPayment - The payment method.
 * @param {number} [params.voucherId] - The voucher ID (optional).
 * @param {number} params.quantity - The quantity to buy.
 * @param {number} params.subtotal - The subtotal amount.
 * @returns {Promise<Object>} The created order object.
 */

export const buyBlindbox = async ({
  userId,
  blindboxName,
  shippingId,
  shippingAddress,
  methodPayment,
  voucherId,
  quantity,
  subtotal,
}) => {
  const url = `${API_BASE_URL}/v1.0/orders/buy-blindbox`;
  const token = localStorage.getItem("authToken");

  const headers = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Remove undefined/null fields to avoid sending them to the backend
  const orderPayload = {
    userId,
    blindboxName,
    shippingId,
    shippingAddress,
    methodPayment,
    quantity,
    subtotal,
  };

  if (voucherId !== undefined && voucherId !== null && voucherId !== "") {
    orderPayload.voucherId = voucherId;
  }

  const body = JSON.stringify(orderPayload);

  try {
    console.log("Making API request to:", url);
    console.log("Request payload:", orderPayload);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    console.log("API Response status:", response.status);
    console.log("API Response headers:", response.headers);

    // The API returns { checkoutUrl, qrCode }
    return await handleApiResponse(response);
  } catch (error) {
    console.error(
      "Error in buyBlindbox:",
      error.message,
      error.status ? `(Status: ${error.status})` : ""
    );
    throw error;
  }
};
//  * Fetches all orders (admin view).
//  * GET /v1.0/orders
//  * @returns {Promise<Array<Object>>} A promise that resolves to an array of transformed order objects.
//  */
export const getAllOrders = async () => {
  const url = `${API_BASE_URL}/v1.0/orders`;
  const token = localStorage.getItem('authToken');
  const headers = {
    'Accept': '*/*',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`OrderService: Fetching all orders from URL: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    const apiOrderList = await handleApiResponse(response);

    if (!Array.isArray(apiOrderList)) {
      console.error("OrderService: Expected an array of orders from API, received:", apiOrderList);
      return [];
    }

    return apiOrderList.map(transformApiOrder).filter(order => order !== null);
  } catch (error) {
    console.error(`Error in getAllOrders:`, error.message, error.status ? `(Status: ${error.status})` : '');
    return [];
  }
};

/**
 * Fetches all orders by status (admin view).
 * GET /v1.0/orders/{status}
 * @param {string} status - The status to filter orders by.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of transformed order objects.
 */
export const getAllOrdersByStatus = async (status) => {
  if (!status || typeof status !== 'string' || status.trim() === "") {
    console.error("getAllOrdersByStatus: status is required and must be a non-empty string.");
    return Promise.resolve([]);
  }

  const url = `${API_BASE_URL}/v1.0/orders/${encodeURIComponent(status)}`;
  const token = localStorage.getItem('authToken');
  const headers = {
    'Accept': '*/*',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`OrderService: Fetching all orders by status '${status}' from URL: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    const apiOrderList = await handleApiResponse(response);

    if (!Array.isArray(apiOrderList)) {
      console.error("OrderService: Expected an array of orders from API, received:", apiOrderList);
      return [];
    }

    return apiOrderList.map(transformApiOrder).filter(order => order !== null);
  } catch (error) {
    console.error(`Error in getAllOrdersByStatus for status '${status}':`, error.message, error.status ? `(Status: ${error.status})` : '');
    return [];
  }
};
