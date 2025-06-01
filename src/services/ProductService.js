// src/services/productService.js
import { API_BASE_URL } from './config'; // Adjust path if your config.js is elsewhere

/**
 * Handles common API response logic for lists of products.
 * @param {Response} response - The fetch Response object.
 * @returns {Promise<Array<Object>>} - The 'data' array from the API response.
 * @throws {Error} If the response is not OK or data structure is unexpected.
 */
async function handleProductListResponse(response) {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText || ''}`;
    let errorStatus = response.status;
    try {
      const errorText = await response.text();
      if (response.headers.get("content-type")?.includes("application/json")) {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.messages || errorData.message || errorText.substring(0,200);
      } else if (errorText) {
        errorMessage = errorText.substring(0, 500);
      }
    } catch (e) { console.warn("Could not parse error response body:", e); }
    const error = new Error(errorMessage);
    error.status = errorStatus;
    console.error('Product Service API Error (List):', error);
    throw error;
  }
  if (response.status === 204) return [];
  const responseData = await response.json();
  if (responseData && responseData.success === true && Array.isArray(responseData.data)) {
    return responseData.data;
  } else if (responseData && responseData.success === false) {
    const error = new Error(responseData.messages || 'API indicated product fetch was not successful.');
    error.data = responseData; // Attach full response data
    throw error;
  } else {
    throw new Error('Unexpected API response structure for product list.');
  }
}

/**
 * Handles API response for a single product.
 * @param {Response} response - The fetch Response object.
 * @returns {Promise<Object|null>} - The single product object from 'data' or null.
 * @throws {Error} If the response is not OK or data structure is unexpected.
 */
async function handleSingleProductResponse(response) {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText || ''}`;
    try {
      const errorText = await response.text();
      if (response.headers.get("content-type")?.includes("application/json")) {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.messages || errorData.message || errorText.substring(0,200);
      } else if (errorText) {
        errorMessage = errorText.substring(0, 500);
      }
    } catch (e) { console.warn("Could not parse error response body:", e); }
    const error = new Error(errorMessage);
    error.status = response.status;
    console.error('Product Service API Error (Single):', error);
    throw error;
  }
  if (response.status === 204) return null;
  const responseData = await response.json();
  if (responseData && responseData.success === true && responseData.data) {
    return responseData.data;
  } else if (responseData && responseData.success === false) {
    const error = new Error(responseData.messages || 'API indicated product fetch was not successful.');
    error.data = responseData;
    throw error;
  } else {
    if (responseData && typeof responseData.productId !== 'undefined') return responseData;
    throw new Error('Unexpected API response structure for single product.');
  }
}


/**
 * Transforms a single product object from the API into a frontend-friendly format.
 * @param {Object} apiProduct - The product object from the API.
 * @returns {Object} - The transformed product object.
 */
function transformApiProduct(apiProduct) {
  if (!apiProduct) return null; // Handle null input gracefully

  let imagesArray = [];
  const placeholderImage = "https://via.placeholder.com/400x500?text=No+Image";

  if (apiProduct.imageUrl) {
    if (apiProduct.imageUrl.includes(',')) {
      imagesArray = apiProduct.imageUrl.split(',').map(url => url.trim()).filter(url => url);
    } else if (apiProduct.imageUrl.trim()) {
      imagesArray = [apiProduct.imageUrl.trim()];
    }
  }
  if (imagesArray.length === 0) {
    imagesArray.push(placeholderImage);
  }

  const price = parseFloat(apiProduct.price);
  const safePrice = !isNaN(price) ? price : 0;

  const originalPrice = parseFloat(apiProduct.originalPrice); // Check if API provides this
  const safeOriginalPrice = !isNaN(originalPrice) ? originalPrice : safePrice * 1.2; // Fallback

  return {
    id: apiProduct.productId,
    name: apiProduct.productName?.trim() || 'Unnamed Product',
    description: apiProduct.productDescription || 'No description available.',
    price: safePrice,
    originalPrice: safeOriginalPrice, // Use this for USD if needed, or remove
    priceVND: safePrice, // Assuming API price is VND
    originalPriceVND: safeOriginalPrice, // Assuming originalPrice logic is also for VND
    condition: apiProduct.condition || (apiProduct.status === "Available" ? "Good" : apiProduct.status || "N/A"),
    image: imagesArray[0],
    images: imagesArray,
    seller: apiProduct.username || 'Unknown Seller', // API provides username, which is the seller here
    createdAt: apiProduct.createdAt ? new Date(apiProduct.createdAt).toISOString() : new Date().toISOString(),
    status: apiProduct.status || 'Unknown',
    location: apiProduct.location || "N/A", // Add if your API can provide it
    color: apiProduct.color || "N/A",     // Add if your API can provide it
    size: apiProduct.size || "N/A",       // Add if your API can provide it
  };
}

/**
 * Fetches all available products from the API.
 * (Assumes this endpoint might require authentication based on previous patterns)
 * @returns {Promise<Array<Object>>}
 */
export const getAllAvailableProducts = async () => {
  const url = `${API_BASE_URL}/v1.0/product/get-all-available-products`;
  const token = localStorage.getItem('authToken');
  const headers = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn("getAllAvailableProducts: No authToken. Request might fail if endpoint is protected.");
  }

  try {
    const response = await fetch(url, { method: 'GET', headers: headers });
    const apiProductList = await handleProductListResponse(response);
    return apiProductList.map(transformApiProduct).filter(p => p !== null); // Filter out nulls from bad transformations
  } catch (error) {
    console.error('Error in getAllAvailableProducts:', error.message);
    return [];
  }
};

/**
 * Fetches a single product by its ID.
 * @param {string|number} productId
 * @returns {Promise<Object|null>}
 */
export const getProductById = async (productId) => {
  if (!productId) return null;
  const url = `${API_BASE_URL}/v1.0/product/get/${productId}`; // Adjust if endpoint is different
  const token = localStorage.getItem('authToken');
  const headers = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { method: 'GET', headers: headers });
    const apiProduct = await handleSingleProductResponse(response);
    return transformApiProduct(apiProduct);
  } catch (error) {
    console.error(`Error fetching product ID ${productId}:`, error.message);
    return null;
  }
};

/**
 * Fetches all products listed by a specific username.
 * Requires an authentication token if the endpoint is protected.
 * @param {string} username - The username of the seller.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of transformed product objects.
 */
export const getProductsByUsername = async (username) => {
  if (!username || typeof username !== 'string' || username.trim() === "") {
    console.error("getProductsByUsername: Username is required and must be a non-empty string.");
    return Promise.resolve([]); // Return empty array for invalid input
  }

  const url = `${API_BASE_URL}/v1.0/product/get-all-products-by-username/${encodeURIComponent(username)}`;
  const token = localStorage.getItem('authToken'); // Retrieve token

  const headers = {
    'Accept': '*/*', // As per your API spec for this endpoint
  };

  // This endpoint likely requires authentication to view another user's products
  // or even one's own products if they aren't all public.
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn(`productService: No authToken found. Request to get products for username '${username}' might fail if protected.`);
    // Depending on your app's logic, you might want to throw an error or return [] immediately
    // return Promise.reject(new Error("Authentication required to fetch user products."));
  }

  try {
    console.log(`productService: Fetching products for username '${username}' with URL: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    // Use the same handleProductListResponse as it expects the same {success, data: []} structure
    const apiProductList = await handleProductListResponse(response); 
    
    return apiProductList.map(transformApiProduct).filter(p => p !== null); // Transform and filter out any nulls

  } catch (error) {
    // Error is already logged by handleProductListResponse if it's an API error
    // This catch handles network errors or errors from JSON parsing in handleProductListResponse.
    console.error(`Error in getProductsByUsername for '${username}':`, error.message, error.status ? `(Status: ${error.status})` : '');
    return []; // Return empty array to prevent breaking UI
  }
};


// getFeaturedProducts can remain the same
export const getFeaturedProducts = async (count = 4) => {
  try {
    const allProducts = await getAllAvailableProducts(); // Assumes featured are from all
    return allProducts.slice(0, count);
  } catch (error) {
    return [];
  }
};