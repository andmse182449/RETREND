// src/services/orderService.js
import { API_BASE_URL } from './config'; // Adjust path to your config file

/**
 * Handles common API response logic.
 * @param {Response} response - The fetch Response object.
 * @returns {Promise<any>} - The parsed JSON data, typically the 'data' array/object.
 * @throws {Error} - If the response is not OK or data structure is unexpected.
 */
async function handleApiResponse(response) {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText || ''}`;
    let errorStatus = response.status;
    try {
      const errorText = await response.text();
      if (response.headers.get("content-type")?.includes("application/json")) {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.messages || errorData.message || errorText.substring(0, 200);
      } else if (errorText) {
        errorMessage = errorText.substring(0, 500);
      }
    } catch (e) {
      console.warn("OrderService: Could not parse error response body:", e);
    }
    const error = new Error(errorMessage);
    error.status = errorStatus;
    console.error('OrderService API Error:', error);
    throw error;
  }

  if (response.status === 204) { // No Content
    return null; // Or empty array if expecting a list
  }

  const responseData = await response.json();

  if (responseData && typeof responseData.success === 'boolean') {
    if (responseData.success) {
      return responseData.data; // Return the actual data payload
    } else {
      const error = new Error(responseData.messages || 'API indicated operation was not successful.');
      error.data = responseData;
      throw error;
    }
  } else {
    // Fallback if the structure is not { success, data } but still 2xx
    // This might happen if some endpoints return data directly.
    console.warn("OrderService: API response not in expected {success, data} format. Returning raw data.", responseData);
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
  if (!userId || typeof userId !== 'string' || userId.trim() === "") {
    console.error("getOrdersByUserId: userId is required and must be a non-empty string.");
    return Promise.resolve([]); // Or throw new Error("Invalid userId");
  }

  const url = `${API_BASE_URL}/v1.0/orders/user/${encodeURIComponent(userId)}`;
  const token = localStorage.getItem('authToken');

  if (!token) {
    console.warn("OrderService: No authToken found. Request to get orders by userId will likely fail.");
    // Depending on policy, you might throw an error or let the backend handle 401.
    // For now, proceed and let backend respond.
    // return Promise.reject(new Error("Authentication token not found."));
  }

  const headers = {
    'Accept': '*/*', // As per your API spec
    // 'Content-Type': 'application/json', // Not needed for GET
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`OrderService: Fetching orders for userId '${userId}' from URL: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    const apiOrderList = await handleApiResponse(response); // Expects an array in responseData.data

    if (!Array.isArray(apiOrderList)) {
        console.error("OrderService: Expected an array of orders from API, received:", apiOrderList);
        return []; // Return empty if the data part is not an array
    }
    
    return apiOrderList.map(transformApiOrder).filter(order => order !== null);
  } catch (error) {
    console.error(`Error in getOrdersByUserId for userId '${userId}':`, error.message, error.status ? `(Status: ${error.status})` : '');
    return []; // Return empty array on error
  }
};