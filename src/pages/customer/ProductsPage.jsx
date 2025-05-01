// src/pages/ProductsPage.js

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaEye,
  FaInfoCircle,
  FaCheck,
  FaSearch,
} from "react-icons/fa"; // Import icons used in this file
import { FixedSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { AnimatePresence } from 'framer-motion';

// Import product data
import { featuredProducts } from "../../api/data"; // Ensure this path is correct

// Import necessary hook from CartContext
import { useCart } from "../../context/CartContext"; // Ensure this path is correct

// Import QuickViewModal component
import QuickViewModal from "../../components/QuickViewModal"; // <-- Import the external modal

// Custom hook for debounced value (keep as is)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// --- Filter Data Definitions ---
// Define price ranges based on the image (Using VND values)
const priceRanges = [
  { min: 0, max: 99999, label: "Dưới 100.000₫" },
  { min: 100000, max: 299999, label: "100.000₫ - 299.000₫" },
  { min: 300000, max: 499999, label: "300.000₫ - 499.000₫" },
  { min: 500000, max: 699999, label: "500.000₫ - 699.000₫" },
  { min: 700000, max: Infinity, label: "Trên 700.000₫" }, // Use Infinity for the upper bound
];

// Define colors and their Tailwind classes
const availableColors = [
  { name: "Nâu", value: "brown", tailwind: "bg-[#A0522D]" }, // Sienna/Brownish
  { name: "Beige", value: "beige", tailwind: "bg-[#F5F5DC]" }, // Beige
  {
    name: "Trắng",
    value: "white",
    tailwind: "bg-white border border-gray-300",
  }, // White with border
  { name: "Đen", value: "black", tailwind: "bg-black" }, // Black
  { name: "Xanh Dương Đậm", value: "navy", tailwind: "bg-blue-900" }, // Navy Blue (using 'navy' value)
  { name: "Xám", value: "gray", tailwind: "bg-gray-600" }, // Gray
  { name: "Xanh Lá Đậm", value: "darkgreen", tailwind: "bg-green-800" }, // Dark Green (using 'darkgreen' value)
  { name: "Cam", value: "orange", tailwind: "bg-orange-500" }, // Added example colors from data
  { name: "Đỏ", value: "red", tailwind: "bg-red-600" }, // Added example colors from data
];
// --- End Filter Data Definitions ---

// --- Memoized Components ---

// Memoized Image Component (keep as is)
const OptimizedImage = React.memo(({ src, alt, className }) => {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      className={className}
      effect="blur" // Or "opacity", "black-and-white"
      threshold={300} // Load when 300px away from viewport
      // Optional placeholder SVG or small base64 image
      placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23CBD5E0' d='M0 0h24v24H0z'/%3E%3C/svg%3E"
      // Add loading="lazy" attribute explicitly for modern browsers (LazyLoadImage adds it too, but good practice)
      loading="lazy"
    />
  );
});

// Memoized FilterSidebar Component (keep as is)
const FilterSidebar = React.memo(
  ({
    priceRanges,
    availableColors,
    selectedPriceRanges,
    selectedColors,
    isOnSaleFilter,
    onPriceRangeChange,
    onColorChange,
    onSaleChange,
    onClearFilters,
  }) => {
    // Check if any filters are active
    const areFiltersActive =
      selectedPriceRanges.length > 0 ||
      selectedColors.length > 0 ||
      isOnSaleFilter;

    return (
      // Added h-fit to make the sidebar only as tall as its content
      // Added sticky top position to keep it visible while scrolling
      // Adjusted top value based on header/search bar height
      <div className="md:col-span-1 lg:col-span-1 bg-white p-6 rounded-lg shadow-md space-y-6 h-fit sticky top-[8rem]">
        {" "}
        {/* Adjusted sticky top */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Bộ lọc sản phẩm
        </h2>{" "}
        {/* Updated heading */}
        {/* Price Filter Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Giá/ Price
          </h3>
          <div className="space-y-2">
            {priceRanges.map((range, index) => (
              <label
                key={index}
                className="flex items-center text-gray-700 text-sm cursor-pointer hover:text-gray-900 transition-colors"
              >
                {" "}
                {/* Added transition */}
                <input
                  type="checkbox"
                  value={range.label}
                  checked={selectedPriceRanges.some(
                    (r) => r.label === range.label
                  )}
                  onChange={() => onPriceRangeChange(range)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition-colors"
                />
                <span className="ml-2">{range.label}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Color Filter Section - Improved UI */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Màu sắc/ Color
          </h3>
          <div className="flex flex-wrap gap-3">
            {" "}
            {/* Increased gap */}
            {availableColors.map((color, index) => {
              const isSelected = selectedColors.includes(color.value);
              return (
                <button
                  key={index}
                  onClick={() => onColorChange(color.value)}
                  className={`w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    color.tailwind
                  } ${
                    isSelected
                      ? "border-blue-600 shadow-md"
                      : "border-transparent hover:border-gray-400"
                  } transition-all duration-200`}
                  aria-label={`Filter by color: ${color.name}`}
                >
                  {/* Add checkmark icon if selected (visible on dark colors) */}
                  {isSelected && color.value !== "white" && (
                    <FaCheck className="text-white" size={16} /> // White check for dark colors
                  )}
                  {/* For white color specifically, show a dark checkmark */}
                  {isSelected && color.value === "white" && (
                    <FaCheck className="text-gray-800" size={16} /> // Dark check for white
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* On Sale Filter Section */}
        <div className="pb-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Sản phẩm đang sale
          </h3>
          <label className="flex items-center text-gray-700 text-sm cursor-pointer hover:text-gray-900 transition-colors">
            {" "}
            {/* Added transition */}
            <input
              type="checkbox"
              checked={isOnSaleFilter}
              onChange={onSaleChange}
              className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition-colors"
            />
            <span className="ml-2">Sale</span>
          </label>
        </div>
        {/* Clear Filters Button - Only show if any filter is active */}
        {areFiltersActive && (
          <div className="border-t border-gray-200 pt-6 text-center">
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-600 hover:underline font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    );
  }
);

// Memoized ProductItem Component - Used by ProductGrid
const ProductItem = React.memo(
  ({ product, addItemToCart, formatPrice, handleQuickView }) => {
    // Ensure product data exists and is valid before rendering
    if (!product) return null;

    // Determine if the item is on sale based on VND prices
    const isOnSale =
      typeof product.originalPriceVND === "number" &&
      typeof product.priceVND === "number" &&
      product.priceVND < product.originalPriceVND;

    return (
      // Added margin around each item to create space within the virtualized grid cell
      // Using flex flex-col to manage vertical space inside the card
      <div className="bg-white rounded-xl shadow-md overflow-hidden relative group transition-shadow duration-300 hover:shadow-xl h-full m-2 flex flex-col">
        {/* Link wraps the visual and info parts */}
        {/* block and flex-grow ensures the link takes up the space and flexes */}
        <Link to={`/products/${product.id}`} className="block flex-grow">
          {/* Image Container */}
          <div className="relative aspect-square w-full overflow-hidden">
            {" "}
            {/* Added w-full */}
            {/* Product Image - Using Memoized LazyLoadImage */}
            <OptimizedImage
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Condition Badge */}
            <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              {" "}
              {/* Adjusted size/shadow */}
              {product.condition}
            </div>
            {/* Sale Badge */}
            {isOnSale && (
              <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {" "}
                {/* Adjusted size/shadow */}
                SALE!
              </div>
            )}
            {/* Overlay for hover effect (pointer-events-none ensures clicks go through to the Link) */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>

          {/* Product Info */}
          {/* Added flex-grow to push the seller info down if needed */}
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              {" "}
              {/* Container for name and price */}
              {/* Truncate name if it's too long */}
              <h3 className="text-base font-semibold text-gray-800 mb-1 truncate">
                {product.name}
              </h3>{" "}
              {/* Adjusted size, added truncate */}
              <div className="flex items-baseline gap-2 mb-2">
                {" "}
                {/* Adjusted gap, mb */}
                {/* Original Price (Strikethrough) - Only show if on sale */}
                {isOnSale && (
                  <span className="text-gray-500 line-through text-sm">
                    {formatPrice(product.originalPriceVND)}
                  </span>
                )}
                {/* Current Price */}
                <span
                  className={`text-lg font-bold ${
                    isOnSale ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {" "}
                  {/* Adjusted size, color based on sale */}
                  {formatPrice(product.priceVND)}
                </span>
              </div>
            </div>
            {/* Seller Info (Optional) - Push to bottom with mt-auto */}
            <div className="flex items-center text-xs text-gray-500 mt-auto">
              <FaInfoCircle className="mr-1 w-3 h-3 flex-shrink-0" />{" "}
              {/* Adjusted margin */}
              <span className="truncate">
                {product.seller || "N/A"} • {product.location || "N/A"}
              </span>{" "}
              {/* Added truncate */}
            </div>
          </div>
        </Link>

        {/* --- Action Buttons on Hover --- */}
        {/* Position absolute at the bottom, hidden by default, shown on group hover */}
        {/* Added backdrop-blur for a frosted effect */}
        <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 flex justify-center gap-2 z-10">
          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              addItemToCart(product);
            }} // Prevent parent Link click, call context function
            className="flex-1 bg-gray-900 text-white py-2 rounded-md text-xs font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-1 shadow-sm" // Adjusted size, padding, font, shadow
            aria-label={`Add ${product.name} to cart`}
          >
            <FaShoppingCart className="w-3 h-3" /> Add
          </button>
          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleQuickView(product);
            }} // Prevent parent Link click, call QuickView handler
            className="flex-1 border border-gray-600 text-gray-800 py-2 rounded-md text-xs font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-1 shadow-sm" // Adjusted size, padding, font, shadow
            aria-label={`Quick view ${product.name}`}
          >
            <FaEye className="w-3 h-3" /> View
          </button>
        </div>
        {/* --- End Action Buttons --- */}
      </div>
    );
  }
);

// Memoized ProductGrid Component with Virtualization
const ProductGrid = React.memo(({ products, handleQuickView }) => {
  // Get cart context functions needed by the cell renderer
  const { addItemToCart, formatPrice } = useCart();

  // Determine number of columns based on viewport width
  // This logic defines the responsiveness for the grid layout
  const getColumnCount = useCallback((width) => {
    if (width < 640) return 1; // sm: ~<640px -> 1 column
    if (width < 768) return 2; // md: 640px - ~768px -> 2 columns
    if (width < 1024) return 3; // lg: 768px - ~1024px -> 3 columns
    if (width < 1280) return 4; // xl: 1024px - ~1280px -> 4 columns (Desired size)
    return 4; // 2xl: >= 1280px -> Keep 4 columns
  }, []); // No dependencies - this function is pure based on width

  // Estimate row height. This is CRITICAL for virtualization performance.
  // Measure the height of one rendered ProductItem card including its top/bottom margin (m-2).
  const ITEM_HEIGHT_ESTIMATE = 450; // You might need to fine-tune this value by inspecting a rendered card's height + margin

  // --- AutoSizer and FixedSizeGrid Rendering ---
  // The container for AutoSizer NEEDS a defined height (and width if not 100%)
  // Use a fixed height, percentage height, or flexbox to give it dimensions.
  // Example: Use calc(100vh - height of stuff above grid)
  return (
    // Check if product list is not empty before rendering AutoSizer/Grid
    // Render null or a placeholder if the list is empty (handled in parent)
    products.length > 0 ? (
      <div style={{ height: "100%", width: "100%" }}>
        {" "}
        {/* Use 100% height/width to fill parent div */}
        <AutoSizer>
          {({ height, width }) => {
            // Calculate column count and width based on the *actual* size AutoSizer provides
            const columnCount = getColumnCount(width);
            const columnWidth = width / columnCount;
            // Calculate total rows needed based on filtered products and column count
            const rowCount = Math.ceil(products.length / columnCount);

            // Define the Cell renderer function *here* inside AutoSizer render prop
            // It has access to `width`, `height`, `columnCount`, `columnWidth`, `products`, `addItemToCart`, `formatPrice`, `handleQuickView` via closure/props
            const renderCell = ({ columnIndex, rowIndex, style }) => {
              // Calculate the index of the product this cell should display
              const index = rowIndex * columnCount + columnIndex;

              // If index is out of bounds for the products array, return null
              if (index >= products.length) {
                return null;
              }

              // Get the product data for this cell
              const product = products[index];

              // Apply the style object provided by react-window to the outer element
              // This is essential for positioning and sizing the virtualized cells
              return (
                <div style={style}>
                  {/* Render the memoized ProductItem component */}
                  <ProductItem
                    product={product}
                    addItemToCart={addItemToCart} // Pass from context
                    formatPrice={formatPrice} // Pass from context
                    handleQuickView={handleQuickView} // Pass from ProductsPage state
                  />
                </div>
              );
            };

            // Return the FixedSizeGrid
            {
              /* Added key to FixedSizeGrid so it re-renders when columnCount changes */
            }
            return (
              <FixedSizeGrid
                columnCount={columnCount}
                columnWidth={columnWidth}
                height={height} // Use height provided by AutoSizer
                rowCount={rowCount}
                rowHeight={ITEM_HEIGHT_ESTIMATE} // Use estimated row height
                width={width} // Use width provided by AutoSizer
                children={renderCell} // Pass the renderCell function here
                key={columnCount} // Key changes when the column layout changes
              />
            );
          }}
        </AutoSizer>
      </div>
    ) : // Return null when the products list is empty, the parent ProductsPage
    // will render the "No products found" message.
    null
  );
});

// --- Main ProductsPage Component ---
export default function ProductsPage() {
  // State management for filters
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [isOnSaleFilter, setIsOnSaleFilter] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // State management for Quick View Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  // Get cart context functions - addItemToCart and formatPrice are needed here
  // to be passed to the QuickViewModal handler, or directly used in QuickViewModal
  const { addItemToCart, formatPrice } = useCart();

  // Debounce search input for performance
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // --- Filter Handler Functions ---
  // Use useCallback to prevent unnecessary re-creation
  const handlePriceRangeChange = useCallback((range) => {
    setSelectedPriceRanges((prev) => {
      const isSelected = prev.some((r) => r.label === range.label);
      return isSelected
        ? prev.filter((r) => r.label !== range.label) // Remove if already selected
        : [...prev, range]; // Add if not selected
    });
  }, []); // No dependencies - these state updates are stable

  const handleColorChange = useCallback((colorValue) => {
    setSelectedColors((prev) => {
      const isSelected = prev.includes(colorValue);
      return isSelected
        ? prev.filter((color) => color !== colorValue) // Remove if already selected
        : [...prev, colorValue]; // Add if not selected
    });
  }, []); // No dependencies - these state updates are stable

  const handleSaleChange = useCallback((e) => {
    setIsOnSaleFilter(e.target.checked);
  }, []); // No dependencies - this state update is stable

  const handleClearFilters = useCallback(() => {
    setSelectedPriceRanges([]);
    setSelectedColors([]);
    setIsOnSaleFilter(false);
    setSearchInput(""); // Also clear search input on clear filters
  }, []); // No dependencies - this handler is stable

  const handleSearchChange = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []); // No dependencies - this state update is stable
  // --- End Filter Handler Functions ---

  // --- Quick View Modal Handlers ---
  // Use useCallback to prevent unnecessary re-creation
  const handleQuickView = useCallback((product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  }, []); // No dependencies - these state updates are stable

  const handleQuickViewClose = useCallback(() => {
    setShowQuickView(false);
    setSelectedProduct(null);
  }, []); // No dependencies - these state updates are stable
  // --- End Quick View Modal Handlers ---

  // --- Optimized Filtering Logic ---
  // Use useMemo to memoize the filtered products list
  const filteredProducts = useMemo(() => {
    // Start with the full imported product data
    let result = featuredProducts;

    // Apply Search Term filter first (often narrows results significantly)
    if (debouncedSearchTerm) {
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
      result = result.filter((product) => {
        // Use optional chaining (?.) for safety if properties might be missing
        // Check name, condition, seller, location
        // Check if property exists and is a string before calling toLowerCase()
        return (
          (typeof product.name === "string" &&
            product.name.toLowerCase().includes(lowerSearchTerm)) ||
          (typeof product.condition === "string" &&
            product.condition.toLowerCase().includes(lowerSearchTerm)) ||
          (typeof product.seller === "string" &&
            product.seller.toLowerCase().includes(lowerSearchTerm)) ||
          (typeof product.location === "string" &&
            product.location.toLowerCase().includes(lowerSearchTerm))
        );
      });
    }

    // Apply Price Range filter
    if (selectedPriceRanges.length > 0) {
      result = result.filter((product) => {
        // Ensure priceVND exists and is a number for comparison
        const price = product.priceVND;
        if (typeof price !== "number") return false; // Filter out items without valid VND price

        // Check if the product price falls into ANY of the selected ranges
        // Use Array.some for better short-circuit evaluation
        return selectedPriceRanges.some(
          (range) => price >= range.min && price <= range.max
        );
      });
    }

    // Apply Color filter
    if (selectedColors.length > 0) {
      // Use a Set for faster lookups if selectedColors list is long
      const colorSet = new Set(selectedColors);
      result = result.filter(
        (product) =>
          // Check if product.color exists and is a string and is in the selected colors set (case-insensitive check)
          typeof product.color === "string" &&
          colorSet.has(product.color.toLowerCase())
      );
    }

    // Apply On Sale filter
    if (isOnSaleFilter) {
      result = result.filter(
        (product) =>
          // Check if both original and current VND prices exist and are numbers and current is less than original
          typeof product.originalPriceVND === "number" &&
          typeof product.priceVND === "number" &&
          product.priceVND < product.originalPriceVND
      );
    }

    return result; // Return the final filtered list
  }, [
    featuredProducts,
    debouncedSearchTerm,
    selectedPriceRanges,
    selectedColors,
    isOnSaleFilter,
  ]); // Dependencies: Re-run filter when these states change

  return (
    // Main container with centered max-w-7xl and padding
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header with Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tất cả sản phẩm</h1>

        {/* Search input */}
        <div className="relative w-full md:w-64 mt-4 md:mt-0">
          {" "}
          {/* Responsive width */}
          <FaSearch
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />{" "}
          {/* Search icon inside input */}
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..." // Updated placeholder
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Content Layout Grid: Sidebar on left, Product Grid on right */}
      {/* md:grid-cols-4 means 1 col for sidebar + 3 for grid (1+3=4) */}
      {/* lg:grid-cols-5 means 1 col for sidebar + 4 for grid (1+4=5) - This gives 4 products per row on lg+ */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {/* Sidebar Column */}
        <FilterSidebar
          priceRanges={priceRanges}
          availableColors={availableColors}
          selectedPriceRanges={selectedPriceRanges}
          selectedColors={selectedColors}
          isOnSaleFilter={isOnSaleFilter}
          onPriceRangeChange={handlePriceRangeChange}
          onColorChange={handleColorChange}
          onSaleChange={handleSaleChange}
          onClearFilters={handleClearFilters}
        />

        {/* Product Grid Column */}
        {/* md:col-span-3 means takes 3 columns out of 4 on md */}
        {/* lg:col-span-4 means takes 4 columns out of 5 on lg */}
        <div className="md:col-span-3 lg:col-span-4">
          {/* Conditional message if no products found after filtering */}
          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
            </p>
          ) : (
            <div style={{ height: "calc(100vh - 220px)", width: "100%" }}>
              {" "}
              {/* Adjusted height calculation slightly */}
              <ProductGrid
                products={filteredProducts} // Pass the filtered list
                handleQuickView={handleQuickView} // Pass Quick View handler down
              />
            </div>
          )}
        </div>
      </div>

      {/* QuickView Modal (Rendered outside the main layout grid) */}
      {/* AnimatePresence for smooth mount/unmount animation */}
      <AnimatePresence>
        {selectedProduct && showQuickView && (
          /* Render QuickViewModal, passing the selected product and close handler */
          /* QuickViewModal now uses useCart hook internally */
          <QuickViewModal
            product={selectedProduct}
            onClose={handleQuickViewClose}
            // No need to pass addItemToCart or formatPrice as props if modal uses useCart
          />
        )}
      </AnimatePresence>
    </div>
  );
}
