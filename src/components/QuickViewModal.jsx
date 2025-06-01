// src/components/QuickViewModal.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaShare,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaEye,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useCart } from "../context/CartContext";
import orderItemsApiService from "../services/OrderItemsApiService";
export default function QuickViewModal({ product, onClose }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  // Renamed to avoid confusion with the API call logic for adding to cart
  const {
    formatPrice: formatPriceFromContext,
    addItemToCart: syncToLocalCart,
  } = useCart();
  const [isProcessingApi, setIsProcessingApi] = useState(false);

  useEffect(() => {
    setSelectedImageIndex(0); // Reset image when product changes
  }, [product]);

  // Guard against null/invalid product early
  if (!product || typeof product.id === "undefined") {
    // It's better to not render the modal at all if product is invalid.
    // The parent component should ideally prevent opening the modal with invalid product.
    // If it does open, this will prevent further errors.
    useEffect(() => {
      if (!product) {
        // If it was opened with null product, close it.
        console.warn("QuickViewModal opened with null product, closing.");
        onClose();
      } else if (typeof product.id === "undefined") {
        console.warn(
          "QuickViewModal opened with product missing ID, closing.",
          product
        );
        onClose();
      }
    }, [product, onClose]);
    return null;
  }

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image && typeof product.image === "string" // Ensure product.image is a string
      ? [product.image]
      : ["https://via.placeholder.com/400x500?text=No+Image"];

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 20, stiffness: 200 },
    },
    exit: {
      opacity: 0,
      y: -30,
      scale: 0.95,
      transition: { type: "tween", duration: 0.2, ease: "easeIn" },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.25 } },
  };

  const handleImageChange = (direction) => {
    setSelectedImageIndex((prev) => {
      const totalImages = images.length;
      if (totalImages === 0 || totalImages === 1) return 0;
      let nextIndex;
      if (direction === "next") {
        nextIndex = (prev + 1) % totalImages;
      } else {
        nextIndex = (prev - 1 + totalImages) % totalImages;
      }
      return nextIndex;
    });
  };

  const handleApiAddToCart = async () => {
    if (!product || typeof product.id === "undefined") {
      // Redundant check, but good for safety
      toast.error("Thông tin sản phẩm không hợp lệ.");
      return;
    }

    setIsProcessingApi(true);
    try {
      // API: POST /v1.0/order-items/create?productId={productId}
      const result = await orderItemsApiService.createOrderItem(product.id);

      // Assuming result is { messages: string, success: true, data: {orderItemsId: number, productId: number} }
      if (result.success) {
        toast.success(
          result.messages ||
            `${product.name || "Sản phẩm"} đã được thêm vào giỏ hàng!`
        );

        // OPTIONAL: Sync with client-side CartContext for immediate UI update
        // This assumes your `product` prop has all necessary fields for CartContext
        const productForLocalCart = {
          id: product.id,
          name: product.name || "Sản phẩm không tên",
          price: parseFloat(product.price) || 0, // Ensure price is number
          image: product.image || images[0], // Use main image or first from array
          quantity: 1, // API call likely adds one instance
          // Include any other fields your CartContext's item structure expects
          // e.g., variant, color, size if they are part of the product object
        };
        syncToLocalCart(productForLocalCart);

        onClose(); // Close the QuickViewModal after success
      } else {
        // API call was "successful" (e.g., 200 OK) but operation failed (result.success is false)
        toast.error(
          result.messages || "Không thể thêm sản phẩm. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("QuickViewModal: Failed to add item via API:", error);
      // error.message should now contain more details if _handleResponse parsed it
      toast.error(
        `Lỗi: ${error.message || "Không thể thêm sản phẩm. Vui lòng thử lại."}`
      );
    } finally {
      setIsProcessingApi(false);
    }
  };

  return (
    <motion.div
      key="quickview-overlay"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        key="quickview-modal"
        variants={modalVariants}
        className="relative bg-white rounded-xl p-6 md:p-8 max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh]" // Adjusted max-w, added flex-col and max-h
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 z-20 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close quick view modal"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 overflow-y-auto custom-scrollbar-thin pr-1">
          {" "}
          {/* Added scrollbar for content */}
          {/* Image Gallery Section */}
          <div className="space-y-3 md:space-y-4 flex flex-col">
            <div className="relative aspect-[4/5] md:aspect-square w-full flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow">
              {images.length > 0 ? (
                <AnimatePresence initial={false} mode="wait">
                  <motion.img
                    key={selectedImageIndex} // Key change triggers animation
                    src={images[selectedImageIndex]}
                    alt={`${product.name || "Product"} - Image ${
                      selectedImageIndex + 1
                    }`}
                    className="w-full h-full object-contain"
                    loading="eager"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.5 }}
                    transition={{ duration: 0.2 }}
                  />
                </AnimatePresence>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageChange("prev")}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 p-2.5 rounded-full hover:bg-white transition-colors z-10 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Previous image"
                  >
                    {" "}
                    <FaChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />{" "}
                  </button>
                  <button
                    onClick={() => handleImageChange("next")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 p-2.5 rounded-full hover:bg-white transition-colors z-10 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Next image"
                  >
                    {" "}
                    <FaChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />{" "}
                  </button>
                </>
              )}
              {images.length > 0 && (
                <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full z-10 tabular-nums">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar-thin">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-150 focus:outline-none ${
                      index === selectedImageIndex
                        ? "border-blue-500 ring-2 ring-blue-300 ring-offset-1"
                        : "border-gray-200 hover:border-gray-400 opacity-75 hover:opacity-100"
                    }`}
                    aria-label={`Select image ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Product Details Section */}
          <div className="space-y-4 md:space-y-5 flex flex-col">
            {" "}
            {/* Added flex-col */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
                {product.name || "Product Name"}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 mt-1.5">
                <span>
                  ID:{" "}
                  <span className="font-medium text-gray-700">
                    {product.id}
                  </span>
                </span>
                {product.condition && (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium mt-1 sm:mt-0">
                    {product.condition}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-2 pb-3 border-b border-gray-200">
              <span className="text-2xl md:text-3xl font-extrabold text-red-600">
                {typeof product.price === "number"
                  ? formatPriceFromContext(product.price)
                  : "N/A"}
              </span>
              {typeof product.originalPrice === "number" &&
                product.originalPrice > (product.price || 0) && (
                  <span className="text-gray-400 line-through text-md md:text-lg">
                    {formatPriceFromContext(product.originalPrice)}
                  </span>
                )}
            </div>
            <div className="space-y-3 text-sm flex-grow">
              {" "}
              {/* Added flex-grow for description */}
              {product.color && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-0.5">Màu sắc:</h3>
                  <span className="text-gray-600">{product.color}</span>
                </div>
              )}
              {product.size && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-0.5">
                    Kích thước:
                  </h3>
                  <span className="text-gray-600">{product.size}</span>
                </div>
              )}
              {product.description && (
                <div className="mt-2">
                  <h3 className="font-medium text-gray-700 mb-1">Mô tả:</h3>
                  <p className="text-gray-600 leading-relaxed text-xs">
                    {product.description.length > 150
                      ? `${product.description.substring(0, 150)}...`
                      : product.description}
                    {product.description.length > 150 && (
                      <Link
                        to={`/products/${product.id}`}
                        onClick={onClose}
                        className="text-blue-600 hover:underline text-xs ml-1"
                      >
                        Xem thêm
                      </Link>
                    )}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-auto pt-4 border-t border-gray-200 space-y-3">
              {" "}
              {/* Buttons at the bottom */}
              <button
                onClick={handleApiAddToCart}
                disabled={isProcessingApi}
                className="w-full bg-blue-600 text-white py-3 px-5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold text-base shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessingApi ? (
                  <FaSpinner className="animate-spin w-5 h-5" />
                ) : (
                  <FaShoppingCart className="w-5 h-5" />
                )}
                <span>
                  {isProcessingApi ? "ĐANG XỬ LÝ..." : "THÊM VÀO GIỎ"}
                </span>
              </button>
              <Link
                to={`/products/${product.id}`}
                onClick={onClose}
                className="w-full border-2 border-gray-400 text-gray-700 py-2.5 px-5 rounded-lg hover:bg-gray-100 hover:border-gray-500 transition-colors flex items-center justify-center gap-2 font-semibold text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
              >
                <FaEye className="w-4 h-4" />
                <span>XEM CHI TIẾT</span>
              </Link>
            </div>
            {/* Note removed for brevity, can be added back if needed */}
            {/* Seller info can be kept if desired */}
          </div>
        </div>
      </motion.div>
      {/* CSS for custom scrollbar (optional, can be in global index.css) */}
      <style jsx global>{`
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </motion.div>
  );
}
