import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaShare,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickViewModal({ product, onClose }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Safely access images array or fallback, ensures 'images' is always an array
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : []; // Fallback to main image or empty array

  // Animation variants - Keep fade for overlay, use a simpler tween for the modal
  const modalVariants = {
    // Adjust duration and type here for optimization/feel
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "tween", duration: 0.2, ease: "easeOut" },
    }, // Changed to tween, faster duration
    exit: {
      opacity: 0,
      y: -50,
      transition: { type: "tween", duration: 0.2, ease: "easeIn" },
    }, // Changed to tween, faster duration
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }, // Overlay fades in/out slower than modal appears
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  // Use useCallback for event handlers if performance becomes a major issue with complex renders,
  // but for simple state updates like this, it's usually not necessary and adds complexity.
  const handleImageChange = (direction) => {
    setSelectedImageIndex((prev) => {
      const totalImages = images.length;
      if (totalImages === 0) return 0; // Handle empty images case

      if (direction === "next") return (prev + 1) % totalImages;
      return (prev - 1 + totalImages) % totalImages;
    });
  };

  // Optional: Preload the *next* and *previous* main image slightly?
  // Not done here as simple src change is usually fine with browser caching,
  // and lazy loading helps with thumbnails.

  return (
    // Overlay - backdrop fades in/out
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit" // Link to the exit animations in variants
      variants={overlayVariants}
      // backdrop-blur-sm can be resource intensive, remove it if still laggy
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      {/* Modal Content - uses its own variants for spring/tween effect */}
      <motion.div
        variants={modalVariants} // Apply modal specific variants
        // Removed separate transition prop here as it's now defined in variants
        className="relative bg-white rounded-lg p-6 max-w-5xl w-full mx-4 overflow-hidden" // Ensure mx-4 for side space on large screens
        // Prevent backdrop click from closing when clicking inside modal
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10" // Increased z-index
          aria-label="Close quick view modal" // Added aria-label
        >
          <FaTimes className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[calc(95vh-3rem)] overflow-y-auto pr-2">
          {/* Image Gallery Section */}
          <div className="space-y-4 flex flex-col">
            {" "}
            {/* Added flex-col to image section */}
            {/* Main Image */}
            <div className="relative h-96 flex-shrink-0 rounded-lg overflow-hidden">
              {" "}
              {/* Added flex-shrink-0 */}
              {images.length > 0 ? ( // Only render image if images exist
                <img
                  src={images[selectedImageIndex]}
                  alt={`${product.name} - Image ${selectedImageIndex + 1}`} // More descriptive alt text
                  className="w-full h-full object-contain transition-opacity duration-300"
                  // Consider loading="eager" here if you want the main image to load ASAP
                  loading="eager" // Suggest eager load for the initially visible image
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  No Image Available
                </div>
              )}
              {/* Navigation Arrows - Only show if > 1 image */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageChange("prev")}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors z-10 shadow-md" // Added z-index, shadow
                    aria-label="Previous image"
                  >
                    <FaChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleImageChange("next")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors z-10 shadow-md" // Added z-index, shadow
                    aria-label="Next image"
                  >
                    <FaChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              {/* Optional: Current image index display */}
              {images.length > 0 && (
                <div className="absolute bottom-2 left-0 right-0 text-center text-white text-sm font-semibold z-10">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
            {/* Thumbnail Grid - Added loading="lazy" */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, index) => (
                  <button
                    key={index} // Using index is acceptable for stable arrays like this
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      // Adjusted thumbnail size, added transition
                      index === selectedImageIndex
                        ? "border-blue-600" // Use a brand color for selected
                        : "border-transparent opacity-70 hover:opacity-100" // Dim non-selected
                    }`}
                    aria-label={`Select image ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1} for ${product.name}`} // Specific alt text
                      className="w-full h-full object-cover"
                      loading="lazy" // <<-- OPTIMIZATION: Lazy load thumbnails
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section - Add some padding to match scrollbar */}
          <div className="space-y-4 pb-2">
            {" "}
            {/* Added pb-2 */}
            {/* Product Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {product.name}
              </h2>{" "}
              {/* Darker heading */}
              <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 mt-1">
                {" "}
                {/* Adjusted text color and layout for small screens */}
                <span>
                  Product ID:{" "}
                  <span className="font-semibold">{product.id}</span>
                </span>{" "}
                {/* Added span for bolding value */}
                <span className="text-green-600 sm:text-right font-semibold mt-1 sm:mt-0">
                  Condition: {product.condition}
                </span>{" "}
                {/* Darker green, added bold */}
              </div>
            </div>
            {/* Price Section */}
            <div className="flex items-baseline gap-3 border-b border-gray-200 pb-4">
              {" "}
              {/* Use items-baseline for vertical alignment, thinner border */}
              <span className="text-3xl font-bold text-red-600">
                {" "}
                {/* Larger price, darker red */}$
                {product.price?.toFixed(2) || "N/A"}{" "}
                {/* Add safe access and format */}
              </span>
              <span className="text-gray-500 line-through text-lg">
                {" "}
                {/* Slightly smaller strikethrough */}$
                {product.originalPrice?.toFixed(2) || "N/A"}{" "}
                {/* Add safe access and format */}
              </span>
            </div>
            {/* Attributes (Size & Color - simplified based on sample data) */}
            {/* NOTE: Your product data doesn't have explicit size/color details beyond the text.
                  This section is likely static placeholder based on the original data.
                  If size/color selection is needed, a more complex component is required.
                  Using placeholders based on the current mock data/structure.
             */}
            <div className="space-y-3">
              {" "}
              {/* Combined size/color section, consistent spacing */}
              {/* Simplified static Color Placeholder */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Available Color:
                </h3>
                <span className="text-gray-700">
                  {product.color || "As Shown"}
                </span>{" "}
                {/* Use product color if exists */}
              </div>
              {/* Simplified static Size Placeholder */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Available Size:
                </h3>
                <span className="text-gray-700">
                  {product.size || "One Size / As Described"}
                </span>{" "}
                {/* Use product size if exists */}
              </div>
              {/* If you need measurement details */}
              {/* <div>
                       <h3 className="font-semibold text-gray-800 mb-1">Measurements:</h3>
                        <p className="text-gray-700 text-sm">XL (Shoulder: 52cm, Chest: 120cm) - STATIC EXAMPLE</p>
                  </div> */}
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              {" "}
              {/* Flex layout for buttons, add top border/padding */}
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold text-lg shadow-md">
                {" "}
                {/* Updated Buy/Cart button color, font, size */}
                <FaShoppingCart className="w-5 h-5" />
                <span>ADD TO CART</span>{" "}
                {/* Keep label, but often "Add to Cart" */}
              </button>
              <Link
                to={`/products/${product.id}`} // Ensure this matches your route setup
                onClick={onClose} // Close modal when navigating to full details
                className="w-full border-2 border-gray-600 text-gray-800 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-semibold text-lg shadow-md" // Updated View Details button styling
              >
                <FaShare className="w-5 h-5" />{" "}
                {/* Use FaShare or FaInfoCircle/FaEye etc */}
                <span>VIEW DETAILS</span>
              </Link>
            </div>
            {/* Second Hand Notice */}
            {/* Kept styling mostly same, ensure text fits well */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800 space-y-2">
              {" "}
              {/* Added padding to yellow border color, text color, space-y */}
              <h4 className="font-semibold text-yellow-900">
                Note: Second Hand Item
              </h4>{" "}
              {/* Darker heading color */}
              <p>
                This is a pre-owned item in{" "}
                <span className="font-semibold">
                  {product.condition.toLowerCase()}
                </span>{" "}
                condition. We recommend reviewing all photos, provided
                measurements, and description carefully before purchasing.
              </p>
              {/* Example additional detail notice */}
              {product.condition !== "Like New" && ( // Maybe add more warning if condition is not 'Like New'
                <p className="italic">
                  Minor imperfections consistent with normal wear may be
                  present.
                </p>
              )}
              {/* Disclaimer about returns based on common vintage/secondhand policies */}
              <p className="font-medium">All sales are final for this item.</p>{" "}
              {/* Make it more direct */}
            </div>
            {/* Optional: Seller Info below notice */}
            <div className="pt-4 border-t border-gray-200">
              {" "}
              {/* Added border top */}
              <h4 className="font-semibold text-gray-800 mb-2">Sold By:</h4>
              <p className="text-gray-700 text-sm">
                <span className="font-medium">{product.seller || "N/A"}</span>{" "}
                from {product.location || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
