import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaBoxOpen,
  FaStar,
  FaTag,
  FaCamera,
  FaInfoCircle,
  FaCheck,
  FaEye,
  FaChevronRight,
  FaArrowRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import QuickViewModal from "../../components/QuickViewModal";
// Make sure the path below correctly points to your data file
import { featuredProducts } from "../../api/data";

// Define banner height for consistency
const BANNER_HEIGHT = "700px"; // You can adjust this
const AUTOROTATE_INTERVAL = 5000; // 4 seconds (Adjust if needed)

// Define the initial number of products to show and how many to load each time
const INITIAL_LOAD_COUNT = 8;
const LOAD_MORE_COUNT = 8; // Define how many products to add when "Load More" is clicked

const steps = [
  {
    title: "Snap & List",
    icon: <FaCamera className="w-8 h-8 text-blue-600" />,
    text: "Instantly upload photos & describe your item.",
    color: "blue-600",
  },
  {
    title: "Get a Smart Price",
    icon: <FaTag className="w-8 h-8 text-amber-500" />,
    text: "Our AI suggests the optimal selling price.",
    color: "amber-500",
  },
  {
    title: "Get Paid Fast",
    icon: <FaCheck className="w-8 h-8 text-green-600" />,
    text: "Secure transactions and quick payout.",
    color: "green-600",
  },
];

const stepStaggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const banners = [
  // Autumn Collection (Index 0)
  {
    id: 3,
    content: (
      <section className="relative h-full w-full bg-gray-900">
        <img
          src="https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          alt="Autumn collection preview"
        />
        <div className="container h-full mx-auto px-4 flex items-center relative z-10">
          <div className="max-w-2xl text-white space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <span className="inline-block px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                New Arrivals
              </span>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow">
                Autumn Collection '23
              </h1>
              <p className="text-xl md:text-2xl max-w-xl text-gray-200">
                Discover timeless elegance in our curated selection of premium
                vintage apparel
              </p>
              <Link
                to="/collections/autumn"
                className="inline-flex items-center bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors text-lg"
              >
                Explore Collection
                <FaChevronRight className="ml-3" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    ),
  },
  // Enhanced Sell banner (Index 1)
  {
    id: 1,
    content: (
      <section className="relative h-full w-full bg-gradient-to-tr from-amber-100 to-blue-50">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            {" "}
            {/* Increased gap */}
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative z-10 max-w-lg lg:max-w-full mx-auto lg:mx-0 text-center lg:text-left" // Centered text/max-w for mobile
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {" "}
                {/* Larger heading */}
                Sell Your <br /> Pre-Loved{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-amber-500">
                  Luxury Pieces
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-6 max-w-lg mx-auto lg:mx-0">
                {" "}
                {/* Added paragraph */}
                Give your high-quality vintage clothing a new home easily and
                profitably.
              </p>
              <Link
                to="/sell"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-amber-500 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-xl text-lg" // Larger button
              >
                <FaTag className="mr-3 text-xl" />
                Start Selling Now
              </Link>
            </motion.div>
            {/* Right: Enhanced Steps Visualization */}
            <motion.div
              className="relative z-10 w-full max-w-lg mx-auto lg:max-w-full p-6 md:p-8 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg" // Card background and border
              initial="hidden"
              animate="visible"
              variants={stepStaggerVariants}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                How It Works
              </h3>{" "}
              {/* Added a heading */}
              <div className="flex items-center justify-between flex-col md:flex-row gap-6 md:gap-8">
                {" "}
                {/* Horizontal layout for steps */}
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col items-center text-center flex-1 relative"
                    variants={stepVariants}
                  >
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br from-${step.color}-400 to-${step.color}-600 flex items-center justify-center mb-4 text-white shadow-md`}
                    >
                      {" "}
                      {/* Colorful icon background */}
                      {step.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h4>{" "}
                    {/* Larger title */}
                    <p className="text-gray-700 text-sm">{step.text}</p>{" "}
                    {/* Adjusted text size */}
                    {i < steps.length - 1 && (
                      <FaArrowRight className="absolute right-[-2rem] top-1/2 transform -translate-y-1/2 text-gray-400 hidden md:block" /> // Arrow icon as separator
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    ),
  },
  // Mystery Box Banner (Index 2)
  {
    id: 2,
    content: (
      <section className="relative h-full w-full bg-gradient-to-br from-purple-900 to-pink-800">
        <div className="container h-full mx-auto px-4 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
            <div className="relative z-10 text-white max-w-lg lg:max-w-full mx-auto lg:mx-0">
              {" "}
              {/* Added max-w & centering for mobile */}
              <div className="flex flex-wrap gap-3 mb-6 justify-center lg:justify-start">
                {" "}
                {/* Added justify-center */}
                <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20">
                  🔥 Limited Collection
                </span>
                <span className="flex items-center px-4 py-1.5 bg-amber-400/20 text-amber-200 rounded-full text-sm">
                  <FaStar className="mr-2 animate-pulse" />
                  Exclusive Launch
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center lg:text-left">
                {" "}
                {/* Centered text for mobile */}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-pink-300 drop-shadow">
                  {" "}
                  {/* Added drop-shadow */}
                  Luxury Mystery Box
                </span>
              </h2>
              <div className="space-y-4 mb-8 text-lg max-w-lg mx-auto lg:mx-0">
                {" "}
                {/* Adjusted text size and added max-w */}
                <ul className="space-y-3">
                  {" "}
                  {/* Adjusted space */}
                  {[
                    "Curated Vintage Designer Pieces",
                    "Minimum 65% Off Retail Value",
                    "Unique Fashion Finds Guaranteed",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-emerald-400 border border-white/20">
                        {" "}
                        {/* Styled icon circle */}
                        <FaCheck />
                      </div>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start justify-center lg:justify-start">
                {" "}
                {/* Centered items for mobile */}
                <Link
                  to="/blindbox"
                  className="inline-flex items-center bg-gradient-to-r from-amber-300 to-pink-400 text-purple-900 px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-xl text-lg"
                >
                  <FaShoppingCart className="mr-3 text-xl" />
                  Unlock Your Surprise Box
                </Link>
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                  {" "}
                  {/* Added border */}
                  <p className="flex items-center gap-2 text-white">
                    <FaBoxOpen className="text-amber-300" />
                    <span>Only 12 Left!</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Product Grid (Lazy loading target 2) */}
            <motion.div
              className="relative grid grid-cols-3 gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  className="aspect-square overflow-hidden rounded-xl relative group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Add semi-transparent overlay and optional icon */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent z-10" />
                  {i === 4 && ( // Example: Add mystery icon to the center one
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      {" "}
                      {/* Added pointer-events-none */}
                      {/* Increased ping size slightly */}
                      <div className="absolute animate-ping-slow bg-white/30 w-28 h-28 rounded-full" />
                      <span className="text-4xl z-10 drop-shadow-md">🎁</span>{" "}
                      {/* Adjusted icon size and shadow */}
                    </div>
                  )}
                  {/* Add loading="lazy" */}
                  <img
                    src={`https://picsum.photos/seed/${i}/600/600`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={`Fashion item ${i + 1}`}
                    loading="lazy" // Add lazy loading
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    ),
  },
];

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // State to manage the number of products currently visible
  const [visibleProductCount, setVisibleProductCount] = useState(INITIAL_LOAD_COUNT);

  // Effect for auto-rotating banners
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, AUTOROTATE_INTERVAL);

    return () => clearInterval(interval); // Cleanup interval on component unmount or dependencies change
  }, [autoRotate, banners.length]); // Add banners.length as dependency

  const handleQuickView = (product) => {
    setAutoRotate(false); // Pause auto-rotate
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const handleQuickViewClose = () => {
    setShowQuickView(false);
    setSelectedProduct(null);
    // setAutoRotate(true); // Uncomment to resume auto-rotate on modal close
  };

  const handleDotClick = (index) => {
    setAutoRotate(false); // Stop auto-rotate on manual interaction
    setActiveIndex(index);
  };

    // Handler to show the next batch of items
    const handleLoadMore = () => {
        setVisibleProductCount(prevCount =>
             // Add LOAD_MORE_COUNT, but cap at the total number of products
             Math.min(prevCount + LOAD_MORE_COUNT, featuredProducts.length)
         );
    };


  // Determine which products to currently display
  const productsToDisplay = featuredProducts.slice(0, visibleProductCount);
    // Check if there are more products than are currently displayed
  const hasMoreProducts = visibleProductCount < featuredProducts.length;


  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      {/* main doesn't need padding or max-width itself, layout is handled by its children */}
      <main className="flex-grow">
        {/* Hero Section (Carousel) */}
        {/* Use w-screen and -mx-auto here to ensure full viewport width, overriding parent padding */}
        {/* Added bg-white margin to make the background white */}
        <section
          className="relative w-screen -mx-auto overflow-hidden bg-white"
          style={{ height: BANNER_HEIGHT }}
        >
          <AnimatePresence initial={false} mode="wait">
            {banners.map(
              (banner, index) =>
                index === activeIndex && (
                  <motion.div
                    key={banner.id} // Use unique banner ID as key
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    {banner.content}
                  </motion.div>
                )
            )}
          </AnimatePresence>

          {/* Pagination Dots */}
          {/* Position relative to the w-screen section */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === activeIndex
                    ? "bg-white scale-125"
                    : "bg-gray-300 opacity-70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        {/* Added px-4 back here inside the section itself, within the w-screen -mx-auto */}
        <section className="w-screen -mx-auto bg-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Recently Listed Items
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {/* Map only over the products to display */}
              {productsToDisplay.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden relative group transition-shadow duration-300 hover:shadow-xl"
                >
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="relative aspect-square">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow">
                        {product.condition}
                      </div>
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1 text-gray-800">
                        {product.name}
                      </h3>
                      <div className="flex items-center mb-2">
                        <span className="text-gray-500 line-through text-sm mr-2">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <FaInfoCircle className="mr-2 w-3 h-3 flex-shrink-0" />
                        Sold by {product.seller} • {product.location}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleQuickView(product);
                    }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out hover:bg-white shadow-lg z-20"
                    aria-label="Quick view product"
                  >
                    <FaEye className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              ))}
            </div>

            {/* "Xem thêm sản phẩm" button */}
            {/* Only render if there are more products to show */}
            {hasMoreProducts && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  // Styling matching the image
                  className="inline-block bg-white text-[#A0522D] border-2 border-[#A0522D] px-8 py-3 rounded-lg font-bold transition-colors duration-300 hover:bg-[#A0522D] hover:text-white shadow-md"
                >
                  Xem thêm sản phẩm
                </button>
              </div>
            )}
          </div>
        </section>

        <AnimatePresence>
          {showQuickView && selectedProduct && (
            <QuickViewModal
              product={selectedProduct}
              onClose={handleQuickViewClose}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}