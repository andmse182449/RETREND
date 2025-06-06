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

import QuickViewModal from "../../components/QuickViewModal"; // Adjust path
import { getAllAvailableProducts } from "../../services/ProductService";

const BANNER_HEIGHT = "700px";
const AUTOROTATE_INTERVAL = 5000;

const customImages = [
  "https://res.cloudinary.com/dcwyv9jsj/image/upload/v1748939819/images_1_njxwuz.jpg",
  "https://res.cloudinary.com/dcwyv9jsj/image/upload/v1748939818/used-imported-second-hand-baseball-varsity-jacket_eu0okm.jpg",
  "https://res.cloudinary.com/dcwyv9jsj/image/upload/v1748939817/used-imported-second-hand-baseball-varsity-jacket-500x500_kzdlyq.webp",
  "https://res.cloudinary.com/dcwyv9jsj/image/upload/v1748939808/8_723238913bea4fc4b75a72dccc08061b_master_hhnrvi.webp",
  "https://res.cloudinary.com/dcwyv9jsj/image/upload/v1748939931/images_2_slyxjw.jpg",
  "https://res.cloudinary.com/dcwyv9jsj/image/upload/v1748939743/images_coqvb5.jpg",
  "https://res.cloudinary.com/dcwyv9jsj/image/upload/v1748939919/mens-jacket-columbia-thrifted-red-amerikanika-thrift.com-1_k6txi9.webp",
  "https://res.cloudinary.com/dcwyv9jsj/image/upload/v1748936954/img-4397-1_wk18dd.webp",
  "https://res.cloudinary.com/dcwyv9jsj/image/upload/v1748939939/images_3_lhndw3.jpg",
];

const INITIAL_RECENTLY_LISTED_LOAD_COUNT = 8;
const LOAD_MORE_RECENTLY_LISTED_COUNT = 8;
const FEATURED_ITEMS_COUNT = 4;

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
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const banners = [
  {
    id: 3,
    content: (
      <section className="relative h-full w-full bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
        <img
          src="https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          alt="Autumn collection preview"
        />
        <div className="container h-full mx-auto px-4 flex items-center relative z-20">
          <div className="max-w-2xl text-white space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className="inline-block px-5 py-2 bg-white/30 backdrop-blur-md rounded-full text-sm font-medium">
                New Arrivals
              </span>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg font-['Inter']">
                Autumn Collection '25
              </h1>
              <p className="text-xl md:text-2xl max-w-xl text-gray-100 font-['Roboto']">
                Discover timeless elegance in our curated selection of premium
                vintage apparel
              </p>
<Link
                to="/products"
                className="inline-flex items-center bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors text-lg"
              >
                Explore Collection <FaChevronRight className="ml-3" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    ),
  },
  {
    id: 1,
    content: (
      <section className="relative h-full w-full bg-gradient-to-tr from-amber-100 to-blue-50">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative z-10 max-w-lg lg:max-w-full mx-auto lg:mx-0 text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight font-['Inter']">
                Sell Your <br /> Pre-Loved{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-amber-500">
                  Luxury Pieces
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-6 max-w-lg mx-auto lg:mx-0 font-['Roboto']">
                Give your high-quality vintage clothing a new home easily and
                profitably.
              </p>
              <Link
                to="/sell"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-amber-500 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform duration-300 shadow-lg text-lg"
              >
                <FaTag className="mr-3 text-xl" />
                Start Selling Now
              </Link>
            </motion.div>
            <motion.div
              className="relative z-10 w-full max-w-lg mx-auto lg:max-w-full p-6 md:p-8 bg-white/50 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl"
              initial="hidden"
              animate="visible"
              variants={stepStaggerVariants}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center font-['Inter']">
                How It Works
              </h3>
              <div className="flex items-center justify-between flex-col md:flex-row gap-6 md:gap-8">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col items-center text-center flex-1 relative"
                    variants={stepVariants}
                  >
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br from-${step.color}-400 to-${step.color}-600 flex items-center justify-center mb-4 text-white shadow-md`}
                    >
                      {step.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 font-['Inter']">
                      {step.title}
                    </h4>
                    <p className="text-gray-700 text-sm font-['Roboto']">
                      {step.text}
                    </p>
                    {i < steps.length - 1 && (
                      <FaArrowRight className="absolute right-[-2rem] top-1/2 transform -translate-y-1/2 text-gray-400 hidden md:block" />
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
  {
    id: 2,
    content: (
      <section className="relative h-full w-full bg-gradient-to-br from-purple-900 to-pink-800">
        <div className="container h-full mx-auto px-4 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
            <div className="relative z-10 text-white max-w-lg lg:max-w-full mx-auto lg:mx-0">
              <div className="flex flex-wrap gap-3 mb-6 justify-center lg:justify-start">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/30">
                  🔥 Limited Collection
                </span>
                <span className="flex items-center px-4 py-1.5 bg-amber-400/30 text-amber-200 rounded-full text-sm font-medium">
                  <FaStar className="mr-2 animate-pulse" />
                  Exclusive Launch
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center lg:text-left font-['Inter']">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-pink-300 drop-shadow">
                  Luxury Mystery Box
                </span>
              </h2>
              <div className="space-y-4 mb-8 text-lg max-w-lg mx-auto lg:mx-0 font-['Roboto']">
                <ul className="space-y-3">
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
                      <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-emerald-400 border border-white/30">
                        <FaCheck />
                      </div>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start justify-center lg:justify-start">
                <Link
                  to="/blindbox"
                  className="inline-flex items-center bg-gradient-to-r from-amber-300 to-pink-400 text-purple-900 px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform duration-300 shadow-lg text-lg"
                >
                  <FaShoppingCart className="mr-3 text-xl" />
                  Unlock Your Surprise Box
                </Link>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md border border-white/30">
                  <p className="flex items-center gap-2 text-white">
                    <FaBoxOpen className="text-amber-300" />
                    <span>Only 12 Left!</span>
                  </p>
                </div>
              </div>
            </div>
            <motion.div
              className="relative grid grid-cols-3 gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                  key={`mystery-img-${i}`}
                  className="aspect-square overflow-hidden rounded-xl relative group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent z-10" />
                  {i === 4 && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      <div className="absolute animate-ping-slow bg-white/30 w-20 h-20 md:w-28 md:h-28 rounded-full" />
                      <span className="text-3xl md:text-4xl z-10 drop-shadow-md">
                        🎁
                      </span>
                    </div>
                  )}
                  <img
                    src={customImages[i % customImages.length]}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={`Mystery item preview ${i + 1}`}
                    loading="lazy"
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
  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);
  const [visibleRecentlyListedCount, setVisibleRecentlyListedCount] = useState(
    INITIAL_RECENTLY_LISTED_LOAD_COUNT
  );

  useEffect(() => {
    if (!autoRotate) return;
    const intervalId = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, AUTOROTATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [autoRotate]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingProducts(true);
      setProductError(null);
      try {
        const productsData = await getAllAvailableProducts();
        const safeProductsData = productsData || [];
        setAllProducts(safeProductsData);
        setFeaturedProducts(safeProductsData.slice(0, FEATURED_ITEMS_COUNT));
      } catch (err) {
        console.error("HomePage: Error during loadInitialData", err);
        setProductError(
          err.message || "Could not load products. Please try again."
        );
        setAllProducts([]);
        setFeaturedProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadInitialData();
  }, []);

  const handleQuickView = (product) => {
    setAutoRotate(false);
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const handleQuickViewClose = () => {
    setShowQuickView(false);
    setSelectedProduct(null);
  };

  const handleDotClick = (index) => {
    setAutoRotate(false);
    setActiveIndex(index);
  };

  const handleLoadMoreRecentlyListed = () => {
    setVisibleRecentlyListedCount((prevCount) =>
      Math.min(prevCount + LOAD_MORE_RECENTLY_LISTED_COUNT, allProducts.length)
    );
  };

  const recentlyListedToDisplay = allProducts.slice(
    0,
    visibleRecentlyListedCount
  );
  const hasMoreRecentlyListed = visibleRecentlyListedCount < allProducts.length;

  const renderProductCard = (product) => (
    <motion.div
      key={product.id}
      className="bg-white rounded-xl shadow-lg overflow-hidden relative group transition-all duration-300 hover:shadow-xl flex flex-col"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link
        to={`/products/${product.id}`}
        className="block group/card flex flex-col h-full"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={
              product.image ||
              "https://via.placeholder.com/400x500?text=No+Image"
            }
            alt={product.name || "Product Image"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            loading="lazy"
          />
          {product.condition && (
            <div className="absolute top-3 left-3 bg-amber-400 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-md">
              {product.condition}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-md font-semibold mb-1 text-gray-800 leading-tight truncate group-hover/card:text-blue-600 transition-colors font-['Inter']">
              {product.name || "Product Name Unavailable"}
            </h3>
            <p className="text-xs text-gray-500 mb-2 font-['Roboto']">
              Sold by {product.seller || "Retrend"}
            </p>
          </div>
          <div className="flex items-baseline justify-start gap-2 mt-auto">
            <span className="text-lg font-bold text-blue-600 font-['Inter']">
              {typeof product.priceVND === "number"
                ? new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.priceVND)
                : "N/A"}
            </span>
            {typeof product.originalPriceVND === "number" &&
              product.originalPriceVND > (product.priceVND || 0) && (
                <span className="text-gray-400 line-through text-sm font-['Roboto']">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.originalPriceVND)}
                </span>
              )}
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleQuickView(product);
        }}
        className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100 shadow-xl border border-gray-200 z-10"
        aria-label={`Quick view ${product.name || "product"}`}
      >
        <FaEye className="w-5 h-5 text-gray-700" />
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col font-['Roboto']">
      <main className="flex-grow">
        <section
          className="relative w-screen -mx-auto overflow-hidden bg-white"
          style={{ height: BANNER_HEIGHT }}
        >
          <AnimatePresence initial={false} mode="wait">
            {banners.map(
              (banner, index) =>
                index === activeIndex && (
                  <motion.div
                    key={banner.id}
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

        <section className="w-full bg-white py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900 tracking-tight font-['Inter']">
              Recently Listed Items
            </h2>
            {isLoadingProducts && (
              <p className="text-center text-gray-500 py-10 font-['Roboto']">
                Loading products...
              </p>
            )}
            {productError && !isLoadingProducts && (
              <p className="text-center text-red-600 py-10 font-['Roboto']">
                Error loading products: {productError}
              </p>
            )}
            {!isLoadingProducts &&
              !productError &&
              allProducts.length === 0 && (
                <p className="text-center text-gray-500 py-10 font-['Roboto']">
                  No products found at the moment. Check back soon!
                </p>
              )}
            {!isLoadingProducts &&
              !productError &&
              recentlyListedToDisplay.length === 0 &&
              allProducts.length > 0 && (
                <p className="text-center text-gray-500 py-10 font-['Roboto']">
                  All products currently displayed.
                </p>
              )}

            {!isLoadingProducts &&
              !productError &&
              recentlyListedToDisplay.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {recentlyListedToDisplay.map(renderProductCard)}
                </div>
              )}

            {hasMoreRecentlyListed && !isLoadingProducts && !productError && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMoreRecentlyListed}
                  className="inline-block bg-gradient-to-r from-blue-600 to-amber-500 text-white px-8 py-3 rounded-lg font-bold transition-transform duration-300 hover:scale-105 shadow-md font-['Inter']"
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
HomePage.displayName = "HomePage";
