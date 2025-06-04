// src/services/productService.js
import { API_BASE_URL } from "./config"; // Adjust path if your config.js is elsewhere

// --- Helper Functions (handleProductListResponse, handleSingleProductResponse, transformApiProduct) ---
// These should remain the same as in the previous version you provided,
// as they are used by the GET endpoints. I'll include them here for completeness.

async function handleProductListResponse(response) {
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
      console.warn(
        "ProductService: Could not parse error response body for list:",
        e
      );
    }
    const error = new Error(errorMessage);
    error.status = errorStatus;
    console.error("Product Service API Error (List):", error);
    throw error;
  }
  if (response.status === 204) return [];
  const responseData = await response.json();
  if (
    responseData &&
    responseData.success === true &&
    Array.isArray(responseData.data)
  ) {
    return responseData.data;
  } else if (responseData && responseData.success === false) {
    const error = new Error(
      responseData.messages || "API indicated product fetch was not successful."
    );
    error.data = responseData;
    throw error;
  } else {
    throw new Error("Unexpected API response structure for product list.");
  }
}

async function handleSingleProductResponse(response) {
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
      console.warn(
        "ProductService: Could not parse error response body for single:",
        e
      );
    }
    const error = new Error(errorMessage);
    error.status = errorStatus;
    console.error("Product Service API Error (Single):", error);
    throw error;
  }
  if (response.status === 204) return null;
  const responseData = await response.json();
  if (responseData && responseData.success === true && responseData.data) {
    return responseData.data; // This is the single product object
  } else if (responseData && responseData.success === false) {
    const error = new Error(
      responseData.messages || "API indicated product fetch was not successful."
    );
    error.data = responseData;
    throw error;
  } else {
    // Fallback for direct object if API doesn't wrap in {success, data}
    if (responseData && typeof responseData.productId !== "undefined") {
      console.warn(
        "ProductService: Single product API returned direct object."
      );
      return responseData;
    }
    throw new Error("Unexpected API response structure for single product.");
  }
}

// Generic handler for responses that might just return true/false or simple success messages
async function handleSimpleSuccessResponse(response) {
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
      console.warn(
        "ProductService: Could not parse error response body for simple success:",
        e
      );
    }
    const error = new Error(errorMessage);
    error.status = errorStatus;
    console.error("Product Service API Error (Simple Success):", error);
    throw error;
  }
  if (response.status === 204)
    return { success: true, message: "Operation successful (No Content)" };

  // For PUT /change-status, the response is just `true` (boolean), not JSON object
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const responseData = await response.json();
    // If it returns our standard {success, messages, data}
    if (responseData && typeof responseData.success === "boolean")
      return responseData;
    // If it's just a boolean true/false as JSON
    if (typeof responseData === "boolean")
      return {
        success: responseData,
        message: responseData ? "Operation successful" : "Operation failed",
      };
    return responseData; // Or return raw if unexpected JSON
  } else {
    const textResponse = await response.text();
    if (textResponse.toLowerCase() === "true")
      return { success: true, message: "Operation successful (boolean true)" };
    if (textResponse.toLowerCase() === "false")
      return { success: false, message: "Operation failed (boolean false)" };
    return {
      success: true,
      message: textResponse || "Operation successful (non-JSON OK)",
    }; // Default to success for OK non-JSON
  }
}

function transformApiProduct(apiProduct) {
  if (!apiProduct) return null;
  let imagesArray = [];
  const placeholderImage = "https://via.placeholder.com/400x500?text=No+Image";
  if (apiProduct.imageUrl) {
    if (apiProduct.imageUrl.includes(",")) {
      imagesArray = apiProduct.imageUrl
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url);
    } else if (apiProduct.imageUrl.trim()) {
      imagesArray = [apiProduct.imageUrl.trim()];
    }
  }
  if (imagesArray.length === 0) imagesArray.push(placeholderImage);
  const price = parseFloat(apiProduct.price);
  const safePrice = !isNaN(price) ? price : 0;
  const originalPrice = parseFloat(apiProduct.originalPrice);
  const safeOriginalPrice = !isNaN(originalPrice)
    ? originalPrice
    : safePrice * 1.2;
  return {
    id: apiProduct.productId,
    name: apiProduct.productName?.trim() || "Unnamed Product",
    description: apiProduct.productDescription || "No description available.",
    price: safePrice,
    originalPrice: safeOriginalPrice,
    priceVND: safePrice,
    originalPriceVND: safeOriginalPrice,
    condition:
      apiProduct.condition ||
      (apiProduct.status === "Available" ? "Good" : apiProduct.status || "N/A"),
    image: imagesArray[0],
    images: imagesArray,
    seller: apiProduct.username || "Unknown Seller",
    createdAt: apiProduct.createdAt
      ? new Date(apiProduct.createdAt).toISOString()
      : new Date().toISOString(),
    status: apiProduct.status || "Unknown",
    location: apiProduct.location || "N/A",
    color: apiProduct.color || "N/A",
    size: apiProduct.size || "N/A",
  };
}

// --- Existing GET Endpoints ---
export const getAllAvailableProducts = async () => {
  /* ... as before ... */
  const url = `${API_BASE_URL}/v1.0/product/get-all-available-products`;
  const token = localStorage.getItem("authToken");
  const headers = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  else console.warn("getAllAvailableProducts: No authToken.");
  try {
    const response = await fetch(url, { method: "GET", headers: headers });
    const apiProductList = await handleProductListResponse(response);
    return apiProductList.map(transformApiProduct).filter((p) => p !== null);
  } catch (error) {
    console.error("Error in getAllAvailableProducts:", error.message);
    return [];
  }
};
export const getProductById = async (productId) => {
  /* ... as before ... */
  if (!productId) return null;
  const url = `${API_BASE_URL}/v1.0/product/get/${productId}`;
  const token = localStorage.getItem("authToken");
  const headers = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const response = await fetch(url, { method: "GET", headers: headers });
    const apiProduct = await handleSingleProductResponse(response);
    return transformApiProduct(apiProduct);
  } catch (error) {
    console.error(`Error fetching product ID ${productId}:`, error.message);
    return null;
  }
};
export const getProductsByUsername = async (username) => {
  /* ... as before ... */
  if (!username || typeof username !== "string" || username.trim() === "")
    return Promise.resolve([]);
  const url = `${API_BASE_URL}/v1.0/product/get-all-products-by-username/${encodeURIComponent(
    username
  )}`;
  const token = localStorage.getItem("authToken");
  const headers = { Accept: "*/*" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  else
    console.warn(`getProductsByUsername: No authToken for user '${username}'.`);
  try {
    const response = await fetch(url, { method: "GET", headers: headers });
    const apiProductList = await handleProductListResponse(response);
    return apiProductList.map(transformApiProduct).filter((p) => p !== null);
  } catch (error) {
    console.error(
      `Error in getProductsByUsername for '${username}':`,
      error.message
    );
    return [];
  }
};
export const getFeaturedProducts = async (count = 4) => {
  /* ... as before ... */
  try {
    const allProducts = await getAllAvailableProducts();
    return allProducts.slice(0, count);
  } catch (error) {
    return [];
  }
};

// --- NEW ADMIN AND BLINDBOX APIs ---

/**
 * (ADMIN) Creates a new product.
 * POST /v1.0/product/admin/create
 * @param {Object} productData - Object containing { username, name, description, price, imageUrl }
 * @returns {Promise<Object>} The created and transformed product data.
 */
export const adminCreateProduct = async (productData) => {
  const url = `${API_BASE_URL}/v1.0/product/admin/create`;
  const token = localStorage.getItem("authToken");

  if (!token)
    return Promise.reject(
      new Error("Admin action: Authentication token required.")
    );
  if (!productData || !productData.name || !productData.username) {
    return Promise.reject(
      new Error("Admin Create Product: Username and Product Name are required.")
    );
  }

  const headers = {
    Accept: "*/*",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    console.log(
      "productService: Admin creating product with data:",
      productData
    );
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(productData),
    });
    // Expects { messages, success, data: productObject }
    const createdProductData = await handleSingleProductResponse(response); // Re-use if response structure is {success, data: product}
    return transformApiProduct(createdProductData); // Transform it
  } catch (error) {
    console.error("Error in adminCreateProduct:", error.message);
    throw error;
  }
};

/**
 * (ADMIN) Updates an existing product.
 * PUT /v1.0/product/admin/update
 * @param {Object} productUpdateData - Object containing { productId, name, description, price, imageUrl }
 * @returns {Promise<Object>} The updated and transformed product data.
 */
export const adminUpdateProduct = async (productUpdateData) => {
  const url = `${API_BASE_URL}/v1.0/product/admin/update`;
  const token = localStorage.getItem("authToken");

  if (!token)
    return Promise.reject(
      new Error("Admin action: Authentication token required.")
    );
  if (
    !productUpdateData ||
    typeof productUpdateData.productId === "undefined"
  ) {
    return Promise.reject(
      new Error("Admin Update Product: productId is required.")
    );
  }

  const headers = {
    Accept: "*/*",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    console.log(
      "productService: Admin updating product with data:",
      productUpdateData
    );
    const response = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(productUpdateData),
    });
    // Expects { messages, success, data: productObject }
    const updatedProductData = await handleSingleProductResponse(response);
    return transformApiProduct(updatedProductData);
  } catch (error) {
    console.error("Error in adminUpdateProduct:", error.message);
    throw error;
  }
};

/**
 * (ADMIN) Changes the status of a product.
 * PUT /v1.0/product/admin/change-status?productId={productId}&status={status}
 * @param {number} productId
 * @param {string} status
 * @returns {Promise<Object>} A simple success object e.g. { success: true, message: "..." }
 */
export const adminChangeProductStatus = async (productId, status) => {
  const url = `${API_BASE_URL}/v1.0/product/admin/change-status?productId=${productId}&status=${encodeURIComponent(
    status
  )}`;
  const token = localStorage.getItem("authToken");

  if (!token)
    return Promise.reject(
      new Error("Admin action: Authentication token required.")
    );
  if (typeof productId === "undefined" || !status) {
    return Promise.reject(
      new Error("Admin Change Status: productId and status are required.")
    );
  }

  const headers = {
    Accept: "*/*", // API spec says response is `true` (boolean), not necessarily JSON object
    Authorization: `Bearer ${token}`,
  };

  try {
    console.log(
      `productService: Admin changing status for product ${productId} to ${status}`
    );
    const response = await fetch(url, {
      method: "PUT",
      headers: headers,
      // No body for this PUT request as params are in query string
    });
    return handleSimpleSuccessResponse(response); // Use a handler for boolean/simple text responses
  } catch (error) {
    console.error("Error in adminChangeProductStatus:", error.message);
    throw error;
  }
};

/**
 * Assigns products to a blindbox.
 * POST /v1.0/product/assign-blindbox
 * @param {number} blindboxId - The ID of the blindbox.
 * @param {Array<number>} productIds - An array of product IDs to assign.
 * @returns {Promise<Object>} The API response (structure not fully specified in your example, assuming similar success/data pattern).
 */
export const assignProductsToBlindbox = async (blindboxId, productIds) => {
  const url = `${API_BASE_URL}/v1.0/product/assign-blindbox`;
  const token = localStorage.getItem("authToken"); // Assuming this requires auth

  if (!token)
    return Promise.reject(new Error("Action requires authentication."));
  if (
    typeof blindboxId === "undefined" ||
    !Array.isArray(productIds) ||
    productIds.length === 0
  ) {
    return Promise.reject(
      new Error("Blindbox ID and at least one Product ID are required.")
    );
  }

  const headers = {
    Accept: "*/*",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const body = JSON.stringify({
    blindboxId: blindboxId,
    productIds: productIds,
  });

  try {
    console.log("productService: Assigning products to blindbox:", body);
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });
    // The API spec for this one is incomplete in your example for response body.
    // Assuming it might follow the {success, messages, data} pattern or just be a success/error.
    // Let's use handleSingleProductResponse if it returns a data object, or handleSimpleSuccessResponse if it's simpler.
    // For now, assuming it might return something like the create/update product.
    // If it's just a success message, handleSimpleSuccessResponse would be better.
    return handleSingleProductResponse(response); // Adjust if response is simpler
  } catch (error) {
    console.error("Error in assignProductsToBlindbox:", error.message);
    throw error;
  }
};

// --- NEW SELLER PRODUCT CREATION API ---
/**
 * (SELLER) Creates a new product.
 * POST /v1.0/product/seller/create
 * @param {Object} productDetails - Object containing { username, name, description, price, imageUrl }
 * @returns {Promise<Object>} The created and transformed product data.
 * @throws {Error} If API call fails or token is missing.
 */
export const sellerCreateProduct = async (productDetails) => {
  const url = `${API_BASE_URL}/v1.0/product/seller/create`;
  const token = localStorage.getItem("authToken"); // Seller actions usually require authentication

  if (!token) {
    console.error("sellerCreateProduct: Authentication token required.");
    return Promise.reject(new Error("Authentication required to create a product."));
  }

  // Validate required fields in productDetails
  if (!productDetails || !productDetails.username || !productDetails.name || 
      typeof productDetails.price === 'undefined' || !productDetails.imageUrl) {
    console.error("sellerCreateProduct: Missing required product details.", productDetails);
    return Promise.reject(new Error("Username, name, price, and imageUrl are required to create a product."));
  }

  const headers = {
    'Accept': '*/*', // As per API spec example
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Ensure price is a number
  const payload = {
    ...productDetails,
    price: parseFloat(productDetails.price) || 0,
  };

  try {
    console.log("productService: Seller creating product with payload:", payload);
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload), // Send the structured payload
    });

    // The response for this API is { messages, success, data: productObject }
    // So, handleSingleProductResponse is appropriate here.
    const createdProductData = await handleSingleProductResponse(response);
    
    return transformApiProduct(createdProductData); // Transform the returned product data
  } catch (error) {
    // Error is already logged by handleSingleProductResponse if it's an API error
    // This catch handles network errors or errors from JSON parsing in the handler.
    console.error("Error in sellerCreateProduct:", error.message, error.status ? `(Status: ${error.status})` : '');
    throw error; // Re-throw for the calling component to handle
  }
};

/**
 * Fetches all products associated with a specific blindbox name.
 * Requires an authentication token if the endpoint is protected.
 * @param {string} blindboxName - The name of the blindbox.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of transformed product objects.
 */
export const getProductsByBlindboxName = async (blindboxName) => {
  if (!blindboxName || typeof blindboxName !== 'string' || blindboxName.trim() === "") {
    console.error("getProductsByBlindboxName: blindboxName is required and must be a non-empty string.");
    // Return Promise.resolve([]) or throw error based on how you want to handle invalid input
    return Promise.resolve([]); 
  }

  // The blindboxName in the URL needs to be URI encoded to handle spaces and special characters.
  const encodedBlindboxName = encodeURIComponent(blindboxName);
  const url = `${API_BASE_URL}/v1.0/product/get-products-by-blindbox-name/${encodedBlindboxName}`;
  
  const token = localStorage.getItem('authToken'); // Retrieve token, as shown in your curl

  const headers = {
    'Accept': '*/*', // As per your API spec
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // If this endpoint strictly requires a token, you might want to throw an error here.
    // Your curl example includes a token, so it's likely protected.
    console.warn(`productService: No authToken found. Request to get products for blindbox '${blindboxName}' might fail.`);
    // return Promise.reject(new Error("Authentication required to fetch products by blindbox name.")); // Option
  }

  try {
    console.log(`productService: Fetching products for blindbox '${blindboxName}' with URL: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    // This endpoint returns a list of products wrapped in { messages, success, data: [...] }
    // so handleProductListResponse is appropriate.
    const apiProductList = await handleProductListResponse(response); 
    
    if (!Array.isArray(apiProductList)) {
        console.error(`productService: Expected an array of products for blindbox '${blindboxName}', received:`, apiProductList);
        return []; // Return empty if the data part is not an array
    }
    
    return apiProductList.map(transformApiProduct).filter(p => p !== null); // Transform each product and filter out nulls

  } catch (error) {
    // Error is already logged by handleProductListResponse if it's an API error from response.ok check.
    // This catch primarily handles network errors or unexpected errors from handleProductListResponse itself.
    console.error(`Error in getProductsByBlindboxName for '${blindboxName}':`, error.message, error.status ? `(Status: ${error.status})` : '');
    return []; // Return empty array to allow UI to handle gracefully
  }
};
