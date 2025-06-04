// src/pages/BlindboxPage.js
import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import { Link } from "react-router-dom"; // Keep if any links are needed
import { FaShoppingCart, FaClock, FaBoxOpen, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- API Service Import ---
import { getProductsByBlindboxName } from "../../services/ProductService"; // Adjust path
// --- Cart Context (Optional, if you need formatPrice or add to cart from here) ---
import { useCart } from "../../context/CartContext";

const ITEMS_PER_PAGE = 6; // Number of items to show per page in the animated grid

export default function BlindboxPage() {
  // --- State for API Data ---
  const [blindboxProducts, setBlindboxProducts] = useState([]); // Products for this blindbox
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Existing State ---
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 59,
    seconds: 59,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [slideDirection, setSlideDirection] = useState("right");

  const { formatPrice } = useCart();

  // Local formatPrice if not using context or for specific formatting here
  const formatPriceLocal = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "N/A";
    // return new Intl.NumberFormat("en-US", {
    //   style: "currency",
    //   currency: "USD",
    // }).format(numPrice);
    // Or use your VND formatter if prices are in VND
    return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  // --- Effect to Fetch Blindbox Products ---
  useEffect(() => {
    const blindboxName = "WearAgain Wonderbox"; // Or get from URL params/props

    const fetchBlindboxItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const productsData = await getProductsByBlindboxName(blindboxName);

        setBlindboxProducts(productsData || []);
      } catch (err) {
        console.error(
          `Failed to fetch products for blindbox "${blindboxName}":`,
          err
        );
        setError(err.message || `Could not load items for ${blindboxName}.`);
        setBlindboxProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlindboxItems();
  }, []); // Fetch once on mount for a fixed blindboxName

  // --- Timer Effect (Keep as is) ---
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Pagination Logic based on fetched blindboxProducts ---
  const displayedItems = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    return blindboxProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [blindboxProducts, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(blindboxProducts.length / ITEMS_PER_PAGE);
  }, [blindboxProducts]);

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  const changePage = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return; // Prevent out-of-bounds
    setSlideDirection(newPage > currentPage ? "right" : "left");
    setCurrentPage(newPage);
  };

  const pageVariants = {
    /* ... (keep as is) ... */ enter: (direction) => ({
      x: direction === "right" ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction === "right" ? -300 : 300,
      opacity: 0,
    }),
  };
  const pageTransition = { type: "tween", ease: "easeInOut", duration: 0.4 };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <p className="ml-3 text-gray-700">Loading Blindbox Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 text-center">
        <h2 className="text-2xl font-semibold text-red-600">
          Error Loading Blindbox
        </h2>
        <p className="text-gray-700 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!isLoading && blindboxProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 text-center">
        <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700">
          Blindbox Not Found or Empty
        </h2>
        <p className="text-gray-600 mt-2">
          This blindbox might not be available or contains no items.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Explore Other Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 py-10 px-4 text-slate-100 selection:bg-purple-500 selection:text-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-700/50"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 tracking-tight">
              WearAgain Wonderbox{" "}
              {/* Hardcoded name, or from API if blindbox has its own details */}
            </h1>
            <div className="text-2xl font-bold text-purple-300 mb-4">
              {formatPriceLocal(119000)}{" "}
              {/* Example Price for the box itself */}
            </div>
            <div className="flex justify-center items-center bg-slate-700/50 px-4 py-2 rounded-full text-sm text-slate-300 shadow-inner max-w-xs mx-auto">
              <FaClock className="mr-2 text-purple-400" />
              {formatTime(timeLeft.hours)}h {formatTime(timeLeft.minutes)}m{" "}
              {formatTime(timeLeft.seconds)}s left
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Column 1: Box Visual */}
            <div className="lg:col-span-1 relative group flex justify-center items-center min-h-[300px] md:min-h-0">
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-purple-500/50 p-6 rounded-xl aspect-square flex flex-col items-center justify-center text-slate-100 shadow-xl w-full max-w-xs md:max-w-sm transform group-hover:scale-105 transition-transform duration-300">
                <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded-md text-xs font-semibold shadow">
                  LIMITED
                </div>
                <FaBoxOpen className="text-6xl md:text-7xl text-purple-400 mb-4 group-hover:animate-pulse" />
                <div className="text-3xl md:text-4xl font-bold mb-1 tracking-wider">
                  WONDER
                </div>
                <div className="w-3/4 border-t-2 border-purple-400/50 my-3"></div>
                <div className="text-xl md:text-2xl font-mono opacity-80">
                  BOX-2024
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  Official Retrend Mystery Box
                </div>
              </div>
            </div>

            {/* Column 2: Item Grid & Actions */}
            <div className="lg:col-span-1 flex flex-col h-full justify-between">
              {" "}
              {/* Added h-full and justify-between */}
              <div>
                {" "}
                {/* Wrapper for content above button */}
                <div className="mb-4 bg-red-800/30 p-3 rounded-lg border border-red-700/50 text-red-200 text-sm">
                  <p className="font-semibold">Credits Required</p>
                  <p>
                    To open this box, please add {formatPriceLocal(119000)} to
                    your wallet.
                  </p>
                </div>
                <div className="relative h-[200px] sm:h-[220px] mb-4 overflow-hidden bg-slate-700/30 rounded-lg p-2 shadow-inner">
                  <AnimatePresence
                    initial={false}
                    custom={slideDirection}
                    mode="wait"
                  >
                    <motion.div
                      key={currentPage}
                      custom={slideDirection}
                      variants={pageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={pageTransition}
                      className="absolute inset-2" // Added inset-2 for padding
                    >
                      <div className="grid grid-cols-3 gap-2 h-full">
                        {displayedItems.map(
                          (
                            item // item is from transformed API data
                          ) => (
                            <div
                              key={item.id}
                              className="relative aspect-square bg-slate-600/50 rounded-md overflow-hidden group shadow-md"
                            >
                              <img
                                src={item.image} // Use product.image (main image from transform)
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[10px] p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 leading-tight">
                                <p className="font-semibold truncate">
                                  {item.name}
                                </p>
                                <p className="text-right text-purple-300 font-bold">
                                  {formatPrice(item.priceVND || item.price)}{" "}
                                  {/* Use formatted price */}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                        {/* Fill empty slots if displayedItems < ITEMS_PER_PAGE */}
                        {Array.from({
                          length: Math.max(
                            0,
                            ITEMS_PER_PAGE - displayedItems.length
                          ),
                        }).map((_, i) => (
                          <div
                            key={`empty-${i}`}
                            className="aspect-square bg-slate-700/40 rounded-md flex items-center justify-center"
                          >
                            <FaBoxOpen className="text-slate-600/50 text-2xl" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-1.5 mb-6 flex-shrink-0">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          currentPage === index
                            ? "bg-purple-400 scale-125"
                            : "bg-slate-600 hover:bg-slate-500"
                        }`}
                        onClick={() => changePage(index)}
                        aria-label={`Go to page ${index + 1}`}
                      ></button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-auto flex-shrink-0">
                <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-3.5 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-800 transition-colors flex items-center justify-center gap-2.5 shadow-lg hover:shadow-purple-500/30 text-sm">
                  <FaShoppingCart className="w-5 h-5" />
                  ADD CREDITS & OPEN
                </button>
              </div>
            </div>

            {/* Column 3: Potential Drops Table */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold mb-4 text-slate-200 text-center lg:text-left">
                Potential Drops
              </h2>
              <div className="overflow-y-auto max-h-[400px] border border-slate-700/50 rounded-lg bg-slate-800/30 shadow-inner custom-scrollbar-thin">
                <table className="w-full text-xs sm:text-sm border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-700/70 backdrop-blur-sm text-slate-300 ">
                      <th className="text-left py-2.5 px-3 font-semibold">
                        Item
                      </th>
                      <th className="text-right py-2.5 px-3 font-semibold">
                        Market Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {blindboxProducts.map(
                      (
                        item // Iterate over all fetched products for this blindbox
                      ) => (
                        <tr
                          key={`table-${item.id}`}
                          className="border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/40 transition-colors"
                        >
                          <td
                            className="py-2.5 px-3 truncate max-w-[150px] sm:max-w-xs"
                            title={item.name}
                          >
                            {item.name}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-purple-300">
                            {formatPrice(item.priceVND || item.price)}{" "}
                            {/* Use field from transformed data */}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-400">
            * Actual contents are random. Listed items indicate possible
            rewards. No returns on mystery boxes.
          </div>
        </motion.div>
      </div>
      {/* Custom scrollbar style for table */}
      <style jsx global>{`
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
