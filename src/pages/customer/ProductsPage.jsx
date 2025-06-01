// src/pages/ProductsPage.js
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaEye,
  FaInfoCircle,
  FaCheck,
  FaSearch,
  FaBoxOpen,
} from "react-icons/fa";
import { FixedSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css"; // Ensure this CSS is imported
import { AnimatePresence, motion } from "framer-motion";

// Adjust path to where getAllAvailableProducts is exported
import { getAllAvailableProducts } from "../../services/ProductService"; // OR "../../services/ProductService"
import { useCart } from "../../context/CartContext"; // Adjust path
import QuickViewModal from "../../components/QuickViewModal"; // Adjust path

// --- Custom hook for debounced value ---
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
const priceRanges = [
  { min: 0, max: 99999, label: "Dưới 100.000₫" },
  { min: 100000, max: 299999, label: "100.000₫ - 299.000₫" },
  { min: 300000, max: 499999, label: "300.000₫ - 499.000₫" },
  { min: 500000, max: 699999, label: "500.000₫ - 699.000₫" },
  { min: 700000, max: Infinity, label: "Trên 700.000₫" },
];
const availableColors = [
  { name: "Nâu", value: "brown", tailwind: "bg-[#A0522D]" },
  { name: "Beige", value: "beige", tailwind: "bg-[#F5F5DC]" },
  {
    name: "Trắng",
    value: "white",
    tailwind: "bg-white border border-gray-300",
  },
  { name: "Đen", value: "black", tailwind: "bg-black" },
  { name: "Xanh Dương Đậm", value: "navy", tailwind: "bg-blue-900" },
  { name: "Xám", value: "gray", tailwind: "bg-gray-600" },
  { name: "Xanh Lá Đậm", value: "darkgreen", tailwind: "bg-green-800" },
  { name: "Cam", value: "orange", tailwind: "bg-orange-500" },
  { name: "Đỏ", value: "red", tailwind: "bg-red-600" },
];

// --- Memoized Image Component ---
const OptimizedImage = React.memo(({ src, alt, className }) => (
  <LazyLoadImage
    src={src}
    alt={alt || "Product image"}
    className={className}
    effect="blur"
    threshold={300}
    placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23E2E8F0' d='M0 0h24v24H0z'/%3E%3C/svg%3E" // Lighter placeholder
    loading="lazy"
  />
));

// --- Memoized FilterSidebar Component ---
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
    const areFiltersActive =
      selectedPriceRanges.length > 0 ||
      selectedColors.length > 0 ||
      isOnSaleFilter;
    return (
      <div className="md:col-span-1 lg:col-span-1 bg-white p-6 rounded-xl shadow-lg space-y-6 h-fit sticky top-24 md:top-[calc(4rem+2rem)]">
        {" "}
        {/* Adjusted sticky top */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-3">
          Bộ lọc sản phẩm
        </h2>
        {/* Price Filter */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Giá</h3>
          <div className="space-y-2">
            {priceRanges.map((range, index) => (
              <label
                key={index}
                className="flex items-center text-gray-700 text-sm cursor-pointer hover:text-blue-600 transition-colors group"
              >
                <input
                  type="checkbox"
                  value={range.label}
                  checked={selectedPriceRanges.some(
                    (r) => r.label === range.label
                  )}
                  onChange={() => onPriceRangeChange(range)}
                  className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
                />
                <span className="ml-2 group-hover:font-medium">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </div>
        {/* Color Filter */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Màu sắc</h3>
          <div className="flex flex-wrap gap-2.5">
            {" "}
            {/* Adjusted gap */}
            {availableColors.map((color, index) => {
              const isSelected = selectedColors.includes(color.value);
              return (
                <button
                  key={index}
                  onClick={() => onColorChange(color.value)}
                  className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    color.tailwind
                  } ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-300 ring-offset-1"
                      : "border-gray-200 hover:border-gray-400"
                  } transition-all duration-150 focus:outline-none`}
                  aria-label={`Filter by color: ${color.name}`}
                >
                  {isSelected && color.value !== "white" && (
                    <FaCheck className="text-white" size={12} />
                  )}
                  {isSelected && color.value === "white" && (
                    <FaCheck className="text-gray-700" size={12} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* On Sale Filter */}
        <div className="pb-2">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Khuyến mãi</h3>
          <label className="flex items-center text-gray-700 text-sm cursor-pointer hover:text-blue-600 transition-colors group">
            <input
              type="checkbox"
              checked={isOnSaleFilter}
              onChange={onSaleChange}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
            />
            <span className="ml-2 group-hover:font-medium">Đang giảm giá</span>
          </label>
        </div>
        {areFiltersActive && (
          <div className="border-t border-gray-200 pt-6 text-center">
            <button
              onClick={onClearFilters}
              className="text-sm text-red-600 hover:text-red-700 hover:underline font-semibold transition-colors"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>
    );
  }
);

// --- Memoized ProductItem Component ---
const ProductItem = React.memo(
  ({ product, addItemToCart, formatPrice, handleQuickView }) => {
    if (!product || typeof product.id === "undefined") {
      // Added check for product.id
      console.warn("ProductItem received invalid product data:", product);
      return null;
    }

    const isOnSale =
      typeof product.originalPriceVND === "number" &&
      typeof product.priceVND === "number" &&
      product.priceVND < product.originalPriceVND;

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden relative group transition-all duration-300 hover:shadow-2xl flex flex-col h-full m-1 md:m-2">
        {" "}
        {/* Added small margin */}
        <Link
          to={`/products/${product.id}`}
          className="block group/card flex flex-col h-full"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
            {" "}
            {/* Added bg for loading */}
            <OptimizedImage
              src={
                product.image ||
                "https://via.placeholder.com/400x500?text=No+Image"
              }
              alt={product.name || "Product"}
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover/card:scale-105"
            />
            {product.condition && (
              <div className="absolute top-2.5 left-2.5 bg-amber-400 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow">
                {product.condition}
              </div>
            )}
            {isOnSale && (
              <div className="absolute top-2.5 right-2.5 bg-red-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow animate-pulse">
                SALE
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="p-3 md:p-4 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-1 truncate group-hover/card:text-blue-600 transition-colors">
                {product.name || "Product Name Unavailable"}
              </h3>
              <p className="text-xs text-gray-500 mb-2 truncate">
                Sold by {product.seller || "Retrend"}
              </p>
            </div>
            <div className="flex items-baseline justify-start gap-2 mt-auto">
              <span
                className={`text-md md:text-lg font-bold ${
                  isOnSale ? "text-red-600" : "text-blue-600"
                }`}
              >
                {typeof product.price === "number"
                  ? product.price + "₫"
                  : "N/A"}
              </span>
              {isOnSale && typeof product.originalPrice === "number" && (
                <span className="text-gray-400 line-through text-xs md:text-sm">
                  {product.originalPrice  + "₫"}
                </span>
              )}
            </div>
          </div>
        </Link>
        <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 flex justify-around gap-2 z-10 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItemToCart(product);
            }}
            className="flex-1 bg-gray-800 text-white py-2 rounded-md text-xs font-semibold hover:bg-gray-700 transition flex items-center justify-center gap-1.5 shadow-sm"
            aria-label={`Add ${product.name || "product"} to cart`}
          >
            <FaShoppingCart className="w-3.5 h-3.5" /> Thêm
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuickView(product);
            }}
            className="flex-1 border border-gray-400 text-gray-700 py-2 rounded-md text-xs font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-1.5 shadow-sm"
            aria-label={`Quick view ${product.name || "product"}`}
          >
            <FaEye className="w-3.5 h-3.5" /> Xem Nhanh
          </button>
        </div>
      </div>
    );
  }
);

// --- Memoized ProductGrid Component ---
const ProductGrid = React.memo(({ products, handleQuickView }) => {
  const { addItemToCart, formatPrice } = useCart();

  const getColumnCount = useCallback((width) => {
    if (width < 640) return 2; // sm: 2 columns for better mobile view
    if (width < 768) return 2; // md: 2 columns
    if (width < 1024) return 3; // lg: 3 columns
    return 4; // xl and up: 4 columns
  }, []);

  // Estimate row height. CRITICAL for virtualization. Inspect a rendered ProductItem with margins.
  const ITEM_HEIGHT_ESTIMATE = 480; // Adjust this after inspecting a card's actual height + m-2 (e.g., 450 for card + 16 for margin)

  if (products.length === 0) {
    return null; // ProductPage will show the "No products found" message
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <AutoSizer>
        {({ height, width }) => {
          if (width === 0 || height === 0) return null; // Don't render if dimensions are 0

          const columnCount = getColumnCount(width);
          const columnWidth = width / columnCount;
          const rowCount = Math.ceil(products.length / columnCount);

          const renderCell = ({ columnIndex, rowIndex, style }) => {
            const index = rowIndex * columnCount + columnIndex;
            if (index >= products.length) return null;
            const product = products[index];
            if (!product) return null; // Defensive check

            return (
              <div style={style}>
                <ProductItem
                  product={product}
                  addItemToCart={addItemToCart}
                  formatPrice={formatPrice}
                  handleQuickView={handleQuickView}
                />
              </div>
            );
          };

          return (
            <FixedSizeGrid
              className="product-grid-scrollbar" // For custom scrollbar styling
              columnCount={columnCount}
              columnWidth={columnWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={ITEM_HEIGHT_ESTIMATE}
              width={width}
              itemKey={({ rowIndex, columnIndex, data }) => {
                // Custom itemKey for stability
                const index = rowIndex * columnCount + columnIndex;
                return data[index]
                  ? data[index].id
                  : `empty-${rowIndex}-${columnIndex}`;
              }}
              itemData={products} // Pass products as itemData for itemKey access
            >
              {renderCell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
});

// --- Main ProductsPage Component ---
export default function ProductsPage() {
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [isOnSaleFilter, setIsOnSaleFilter] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addItemToCart, formatPrice } = useCart();
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  useEffect(() => {
    const loadAllProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const productsData = await getAllAvailableProducts();
        console.log(
          "ProductsPage: Fetched products from API:",
          JSON.stringify(productsData, null, 2)
        );
        setAllProducts(productsData || []);
      } catch (err) {
        console.error("ProductsPage: Failed to load products", err);
        setError(err.message || "Could not load products. Please try again.");
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllProducts();
  }, []);

  const handlePriceRangeChange = useCallback((range) => {
    setSelectedPriceRanges((prev) =>
      prev.some((r) => r.label === range.label)
        ? prev.filter((r) => r.label !== range.label)
        : [...prev, range]
    );
  }, []);
  const handleColorChange = useCallback((colorValue) => {
    setSelectedColors((prev) =>
      prev.includes(colorValue)
        ? prev.filter((color) => color !== colorValue)
        : [...prev, colorValue]
    );
  }, []);
  const handleSaleChange = useCallback((e) => {
    setIsOnSaleFilter(e.target.checked);
  }, []);
  const handleClearFilters = useCallback(() => {
    setSelectedPriceRanges([]);
    setSelectedColors([]);
    setIsOnSaleFilter(false);
    setSearchInput("");
  }, []);
  const handleSearchChange = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);
  const handleQuickView = useCallback((product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  }, []);
  const handleQuickViewClose = useCallback(() => {
    setShowQuickView(false);
    setSelectedProduct(null);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (!Array.isArray(result)) {
      // Guard against allProducts not being an array
      console.warn(
        "ProductsPage: allProducts is not an array during filtering.",
        result
      );
      return [];
    }

    if (debouncedSearchTerm) {
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(lowerSearchTerm) ||
          product.condition?.toLowerCase().includes(lowerSearchTerm) ||
          product.seller?.toLowerCase().includes(lowerSearchTerm) ||
          product.location?.toLowerCase().includes(lowerSearchTerm)
      );
    }
    // In the filteredProducts useMemo, change:
    if (selectedPriceRanges.length > 0) {
      result = result.filter((product) => {
        const price = product.price; // Changed from priceVND
        if (typeof price !== "number") return false;
        return selectedPriceRanges.some(
          (range) => price >= range.min && price <= range.max
        );
      });
    }
    if (selectedColors.length > 0) {
      const colorSet = new Set(selectedColors.map((c) => c.toLowerCase()));
      result = result.filter(
        (product) =>
          product.color &&
          typeof product.color === "string" &&
          colorSet.has(product.color.toLowerCase())
      );
    }
    if (isOnSaleFilter) {
      result = result.filter(
        (product) =>
          typeof product.originalPriceVND === "number" &&
          typeof product.priceVND === "number" &&
          product.priceVND < product.originalPriceVND
      );
    }
    // console.log("ProductsPage: Filtered products:", JSON.stringify(result, null, 2));
    return result;
  }, [
    allProducts,
    debouncedSearchTerm,
    selectedPriceRanges,
    selectedColors,
    isOnSaleFilter,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Tất cả sản phẩm
        </h1>
        <div className="relative w-full md:w-auto md:min-w-[300px]">
          <FaSearch
            size={16}
            className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          />{" "}
          {/* Adjusted icon size */}
          <input
            type="text"
            placeholder="Tìm sản phẩm, thương hiệu,..." // More specific placeholder
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
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

        <div className="md:col-span-3 lg:col-span-4">
          {isLoading && (
            <div className="flex justify-center items-center h-[calc(100vh-300px)]">
              {" "}
              {/* Centered loading */}
              <p className="text-gray-600 text-lg">Đang tải sản phẩm...</p>
              {/* You can add a spinner icon here */}
            </div>
          )}
          {!isLoading && error && (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-300px)] text-center">
              <p className="text-red-600 text-lg mb-2">Lỗi tải sản phẩm!</p>
              <p className="text-gray-700 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Thử lại
              </button>
            </div>
          )}
          {!isLoading && !error && filteredProducts.length === 0 && (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-300px)] text-center">
              <FaBoxOpen className="text-6xl text-gray-300 mb-4" />{" "}
              {/* Example Icon */}
              <p className="text-gray-600 text-lg">
                Không tìm thấy sản phẩm nào.
              </p>
              <p className="text-gray-500 text-sm">
                Vui lòng thử điều chỉnh bộ lọc hoặc tìm kiếm khác.
              </p>
            </div>
          )}
          {!isLoading && !error && filteredProducts.length > 0 && (
            // Ensure this container has a defined height for AutoSizer
            // Adjust height based on your layout (e.g., 100vh - header - footer - padding - searchbar - title)
            // The 250px is a rough estimate, fine-tune it.
            <div
              style={{ height: "calc(100vh - 250px)", width: "100%" }}
              className="min-h-[400px]"
            >
              {" "}
              {/* Added min-height */}
              <ProductGrid
                products={filteredProducts}
                handleQuickView={handleQuickView}
              />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedProduct && showQuickView && (
          <QuickViewModal
            product={selectedProduct}
            onClose={handleQuickViewClose}
          />
        )}
      </AnimatePresence>
      {/* Helper CSS for custom scrollbar (optional, can be in global index.css) */}
      <style jsx global>{`
        .product-grid-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .product-grid-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .product-grid-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1; /* Softer scrollbar color */
          border-radius: 10px;
        }
        .product-grid-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
}
