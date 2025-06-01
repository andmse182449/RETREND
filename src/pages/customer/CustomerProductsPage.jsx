// src/pages/CustomerProductsPage.js
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"; // Link might be used for product details
import {
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaFilter,
  FaStar,
} from "react-icons/fa";

// Import API service and CartContext (if needed for addToCart or formatPrice)
import { getProductsByUsername } from "../../services/ProductService"; // Adjust path
import { useCart } from "../../context/CartContext"; // Adjust path for cart actions/formatting

export default function CustomerProductsPage() {
  const [userProducts, setUserProducts] = useState([]); // To store products fetched from API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // To store logged-in user info

  // Get formatPrice from context for consistency, or use a local one
  const {
    formatPrice: contextFormatPrice,
    addItemToCart: contextAddItemToCart,
  } = useCart();

  // Use context's formatPrice or define a local one if CartContext is not used here
  const formatPrice =
    contextFormatPrice ||
    ((price) => {
      if (price == null || isNaN(parseFloat(price))) return "0đ";
      return (
        parseFloat(price)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ"
      );
    });

  // --- Effect to get current user's username and fetch their products ---
  useEffect(() => {
    // Simulate getting logged-in user's username
    // In a real app, this would come from an auth context or a more secure source
    const storedUser = localStorage.getItem("user"); // Assuming user object is stored
    let usernameToFetch = null;
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        usernameToFetch = parsedUser.username; // Assuming 'username' field exists
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        setError("Could not identify user to fetch products.");
        setIsLoading(false);
        return;
      }
    }

    if (!usernameToFetch) {
      // setError("Not logged in or username not found. Cannot fetch your products.");
      console.warn(
        "CustomerProductsPage: Username not available to fetch products."
      );
      setIsLoading(false);
      // Optionally, redirect to login or show a message
      // navigate('/login');
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Products fetched from API will already be transformed by productService
        const productsData = await getProductsByUsername(usernameToFetch);
        setUserProducts(productsData || []);
      } catch (err) {
        console.error(
          `Failed to fetch products for user ${usernameToFetch}:`,
          err
        );
        setError(err.message || "Could not load your products.");
        setUserProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // Run once on mount to get username and initial products

  // Toggle favorite status (remains local UI state, not persisted unless you add API)
  const toggleFavorite = (productId) => {
    setUserProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, favorite: !product.favorite }
          : product
      )
    );
  };

  // --- Filter states and logic (can be enhanced later for API-based filtering) ---
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all"); // Example filter

  // Filter products based on active category (client-side for now)
  // For API-based, you'd pass filter params to getProductsByUsername
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") {
      return userProducts;
    }
    // Your API product objects might not have a 'category' or 'tags' field yet.
    // This filter will only work if transformApiProduct adds these, or if you filter on other fields.
    // For now, let's assume transformApiProduct adds a 'category' based on some logic or default.
    return userProducts.filter(
      (product) => product.category === activeCategory || !product.category
    ); // Simple category filter example
  }, [userProducts, activeCategory]);

  // Add to cart function - using context's addItemToCart
  const handleAddToCart = (product) => {
    if (contextAddItemToCart) {
      contextAddItemToCart(product);
      alert(`${product.name} đã được thêm vào giỏ hàng!`); // Or use a toast notification
    } else {
      console.warn(
        "addItemToCart from CartContext not available. Using local alert."
      );
      alert(`(Local) Added ${product.name} to cart!`);
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 min-h-[400px] flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Đang tải sản phẩm của bạn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600">Lỗi tải sản phẩm</h2>
        <p className="text-gray-700 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()} // Simple refresh to retry
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-700">
          Vui lòng đăng nhập
        </h2>
        <p className="text-gray-600 mt-2">
          Bạn cần đăng nhập để xem các sản phẩm bạn đang bán.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (userProducts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          Bạn chưa đăng bán sản phẩm nào
        </h1>
        <p className="text-gray-600 mb-4">
          Hãy bắt đầu đăng bán những món đồ bạn không còn dùng đến!
        </p>
        <Link
          to="/sell"
          className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Đăng bán ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm min-h-screen">
      {/* Top filters bar */}
      <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold text-gray-800">
            Sản phẩm của bạn đang bán
          </h1>
          <span className="text-gray-500 text-sm">
            ({filteredProducts.length} sản phẩm)
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            <FaFilter className="mr-1.5 w-4 h-4" />
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </button>

          <select className="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-blue-500 focus:border-blue-500">
            <option>Mới nhất</option>
            <option>Giá: Thấp đến Cao</option>
            <option>Giá: Cao đến Thấp</option>
            {/* Add more sort options if needed */}
          </select>
        </div>
      </div>

      {/* Filters panel - (Simplified for now, as API doesn't support complex filtering yet) */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h3 className="font-medium text-sm text-gray-600 mb-2">
              Trạng thái sản phẩm
            </h3>
            <div className="space-y-1.5">
              <button
                className={`block text-sm ${
                  activeCategory === "all"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700 hover:text-blue-500"
                }`}
                onClick={() => setActiveCategory("all")} // This category filter is client-side
              >
                Tất cả
              </button>
              <button
                className={`block text-sm ${
                  activeCategory === "Available"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700 hover:text-blue-500"
                }`}
                onClick={() => setActiveCategory("Available")}
              >
                Đang bán (Available)
              </button>
              <button
                className={`block text-sm ${
                  activeCategory === "Sold"
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700 hover:text-blue-500"
                }`}
                onClick={() => setActiveCategory("Sold")} // Example, if API can return Sold items
              >
                Đã bán (Sold)
              </button>
            </div>
          </div>
          {/* Add more filter sections (Price, etc.) if your API supports them or for client-side */}
          <div>
            <h3 className="font-medium text-sm text-gray-600 mb-2">Giá</h3>
            {/* Price filter UI - Needs logic to apply */}
            <p className="text-xs text-gray-400">
              (Lọc giá theo API sẽ được thêm sau)
            </p>
          </div>
        </div>
      )}

      {/* Products grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          // The product object here comes from `transformApiProduct` in your service
          <div
            key={product.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
          >
            <Link to={`/products/${product.id}`} className="block">
              {" "}
              {/* Link to product detail page */}
              <div className="relative aspect-[4/5] overflow-hidden group bg-gray-100">
                <img
                  src={
                    product.image ||
                    "https://via.placeholder.com/300x375?text=No+Image"
                  } // product.image from transformed data
                  alt={product.name || "Product"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Add other badges if needed, e.g., product.status */}
                {product.status && (
                  <span
                    className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full text-white ${
                      product.status === "Available"
                        ? "bg-green-500"
                        : product.status === "Sold"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {product.status}
                  </span>
                )}
              </div>
            </Link>

            <div className="p-4 flex flex-col flex-grow">
              {/* product.seller is the username of who listed it, which is the current user */}
              {/* <p className="text-gray-500 text-xs mb-1">Đăng bởi: Bạn ({product.seller})</p> */}
              <h3
                className="font-semibold text-sm text-gray-800 mb-1 truncate"
                title={product.name}
              >
                <Link
                  to={`/products/${product.id}`}
                  className="hover:text-blue-600"
                >
                  {product.name || "Sản phẩm chưa đặt tên"}
                </Link>
              </h3>
              <p className="text-blue-600 font-bold text-md mt-auto pt-1">
                {/* Use priceVND if available from transformApiProduct, otherwise format product.price */}
                {typeof product.priceVND === "number"
                  ? formatPrice(product.priceVND)
                  : formatPrice(product.price)}
              </p>

              {/* For user's own products, "Add to Cart" might not be relevant.
                  Instead, "Edit" or "View Stats" buttons might be more appropriate.
                  For now, keeping a generic structure, but you'd customize actions.
              */}
              <div className="mt-3 flex space-x-2">
                <Link
                  to={`/manage-product/${product.id}/edit`} // Example edit link
                  className="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded transition-colors"
                >
                  Chỉnh sửa
                </Link>
                <button
                  onClick={() =>
                    alert(`Xem chi tiết sản phẩm ID: ${product.id}`)
                  } // Placeholder
                  className="flex-1 text-center border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>
              {/* Favorite button might not be for user's own items unless it's a "pin" feature */}
              {/* <button onClick={() => toggleFavorite(product.id)} className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow hover:bg-gray-100">
                {product.favorite ? <FaHeart className="text-red-500 w-4 h-4" /> : <FaRegHeart className="w-4 h-4 text-gray-500" />}
              </button> */}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination (Placeholder, implement if API supports it or for client-side of large lists) */}
      <div className="px-4 py-6 border-t flex justify-center">
        <div className="flex space-x-1">
          {/* Example Pagination Buttons */}
          <button
            className="px-3 py-1 rounded border text-sm border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            disabled
          >
            Trước
          </button>
          <button className="px-3 py-1 rounded text-sm bg-blue-600 text-white hover:bg-blue-700">
            1
          </button>
          {/* <button className="px-3 py-1 rounded border text-sm border-gray-300 hover:bg-gray-100">2</button> */}
          <button
            className="px-3 py-1 rounded border text-sm border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            disabled
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
