import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaClock, FaBoxOpen, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence for transitions

// --- Mock Item Data (Replace with API Fetch in a real app) ---
const fullItemList = [
  {
    id: 1,
    name: "Nike Air Force 1",
    price: "1441.20",
    imageURL: "https://via.placeholder.com/150/FAF0E6/333333?text=Item+1",
    value: "1441.20",
  },
  {
    id: 2,
    name: "OFF-WHITE Binder",
    price: "1324.80",
    imageURL: "https://via.placeholder.com/150/F0E68C/333333?text=Item+2",
    value: "1324.80",
  },
  {
    id: 3,
    name: "Nike Air Max 97",
    price: "1262.40",
    imageURL: "https://via.placeholder.com/150/D2B48C/333333?text=Item+3",
    value: "1262.40",
  },
  {
    id: 4,
    name: "Vintage Denim",
    price: "35.00",
    imageURL: "https://via.placeholder.com/150/FAF0E6/333333?text=Item+4",
    value: "35.00",
  },
  {
    id: 5,
    name: "Summer Dress",
    price: "20.00",
    imageURL: "https://via.placeholder.com/150/F0E68C/333333?text=Item+5",
    value: "20.00",
  },
  {
    id: 6,
    name: "Graphic Tee",
    price: "15.99",
    imageURL: "https://via.placeholder.com/150/D2B48C/333333?text=Item+6",
    value: "15.99",
  },
  // Add more items here to test pagination & scrolling
  {
    id: 7,
    name: "Slim Fit Jeans",
    price: "25.00",
    imageURL: "https://via.placeholder.com/150/FAF0E6/333333?text=Item+7",
    value: "25.00",
  },
  {
    id: 8,
    name: "Summer Scarf",
    price: "8.50",
    imageURL: "https://via.placeholder.com/150/F0E68C/333333?text=Item+8",
    value: "8.50",
  },
  {
    id: 9,
    name: "Leather Belt",
    price: "40.00",
    imageURL: "https://via.placeholder.com/150/D2B48C/333333?text=Item+9",
    value: "40.00",
  },
  {
    id: 10,
    name: "Sneaker Cleaner",
    price: "12.00",
    imageURL: "https://via.placeholder.com/150/FAF0E6/333333?text=Item+10",
    value: "12.00",
  },
  {
    id: 11,
    name: "Hoodie",
    price: "60.00",
    imageURL: "https://via.placeholder.com/150/F0E68C/333333?text=Item+11",
    value: "60.00",
  },
  {
    id: 12,
    name: "Baseball Cap",
    price: "22.00",
    imageURL: "https://via.placeholder.com/150/D2B48C/333333?text=Item+12",
    value: "22.00",
  },
  {
    id: 13,
    name: "Watch",
    price: "200.00",
    imageURL: "https://via.placeholder.com/150/FAF0E6/333333?text=Item+13",
    value: "200.00",
  },
  {
    id: 14,
    name: "Socks (3-pack)",
    price: "18.00",
    imageURL: "https://via.placeholder.com/150/F0E68C/333333?text=Item+14",
    value: "18.00",
  },
  {
    id: 15,
    name: "Backpack",
    price: "75.00",
    imageURL: "https://via.placeholder.com/150/D2B48C/333333?text=Item+15",
    value: "75.00",
  },
  {
    id: 16,
    name: "Beanie",
    price: "20.00",
    imageURL: "https://via.placeholder.com/150/FAF0E6/333333?text=Item+16",
    value: "20.00",
  },
  {
    id: 17,
    name: "Sunglasses",
    price: "50.00",
    imageURL: "https://via.placeholder.com/150/F0E68C/333333?text=Item+17",
    value: "50.00",
  },
  {
    id: 18,
    name: "Wallet",
    price: "30.00",
    imageURL: "https://via.placeholder.com/150/D2B48C/333333?text=Item+18",
    value: "30.00",
  },
];
// ---------------------------------------------

const ITEMS_PER_PAGE = 6; // Number of items to show per page in the grid

const BlindboxPage = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 59,
    seconds: 59,
  });

  const [currentPage, setCurrentPage] = useState(0); // State for pagination
  const [slideDirection, setSlideDirection] = useState("right"); // For animation direction

  // --- Timer Effect ---
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        // Optional: Clear interval when timer reaches zero
        // if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 1) clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer); // Cleanup timer on unmount
  }, []);

  // Calculate items to display on the current page
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedItems = fullItemList.slice(startIndex, endIndex);

  // Calculate total pages for pagination dots
  const totalPages = Math.ceil(fullItemList.length / ITEMS_PER_PAGE);

  // --- Timer Display Formatting ---
  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  // Handle page change with direction awareness for animations
  const changePage = (newPage) => {
    // Determine the slide direction based on page change
    setSlideDirection(newPage > currentPage ? "right" : "left");
    setCurrentPage(newPage);
  };

  // Animation variants for page transitions
  const pageVariants = {
    enter: (direction) => ({
      x: direction === "right" ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction === "right" ? -300 : 300,
      opacity: 0,
    }),
  };

  // Animation transition settings
  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.4,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 text-text-DEFAULT">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-beige-light rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-text-dark">
              Off-White Lucky
            </h1>
            <div className="text-2xl font-bold text-accent-brown mb-4">
              $4.99
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center bg-beige-medium px-3 py-1 rounded-full text-text-dark">
                <FaClock className="mr-2 text-gray-700" />
                {formatTime(timeLeft.hours)}h {formatTime(timeLeft.minutes)}m{" "}
                {formatTime(timeLeft.seconds)}s left
              </div>
            </div>
          </div>
          
          {/* Main Content Grid (3 columns on large screens) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Column 1: Box Visual */}
            <div className="lg:col-span-1 relative group">
              <div className="bg-white border-2 border-gray-900 p-6 rounded-lg aspect-square flex flex-col items-center justify-center text-text-dark">
                <div className="absolute top-2 left-2 bg-red-600 text-beige-light px-2 py-1 rounded text-xs font-semibold">
                  SECOND HAND
                </div>
                <div className="text-4xl font-bold mb-2">LUCKY</div>
                <div className="w-full border-t-2 border-gray-900 my-4"></div>
                <div className="text-2xl font-mono">BOX-0231</div>
                <div className="mt-4 text-lg">An official box by Leofie</div>
              </div>
            </div>
            
            {/* Column 2: Details (Item Grid, Pagination, Button) */}
            <div className="md:col-span-2 lg:col-span-1 flex flex-col">
              {/* Insufficient Credits Notice */}
              <div className="mb-6 bg-red-100 p-4 rounded-xl border border-red-300 text-red-800">
                <div className="text-red-700 font-semibold mb-2">
                  Insufficient credits
                </div>
                <p className="text-sm text-red-600">
                  To open this box, please add $4.99 to your account's wallet
                </p>
              </div>
              
              {/* Item Grid with Animation */}
              <div className="relative h-[200px] mb-4 overflow-hidden">
                <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                  <motion.div
                    key={currentPage}
                    custom={slideDirection}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={pageTransition}
                    className="absolute inset-0"
                  >
                    <div className="grid grid-cols-3 gap-3 h-full">
                      {displayedItems.map((item) => (
                        <div
                          key={item.id}
                          className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                        >
                          {/* Item Image */}
                          <img
                            src={item.imageURL}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Name and Price Overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-70 text-beige-light text-xs p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="font-semibold truncate">{item.name}</p>
                            <p className="text-right text-yellow-300 font-bold">
                              ${parseFloat(item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Pagination Dots with Active Animations */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mb-6 flex-shrink-0">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentPage === index
                          ? "bg-gray-800 scale-125"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      onClick={() => changePage(index)}
                      aria-label={`Go to page ${index + 1}`}
                    ></button>
                  ))}
                </div>
              )}
              
              {/* Add Credits Button */}
              <div className="mt-auto flex-shrink-0">
                <button className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-3">
                  <FaShoppingCart className="text-xl" />
                  ADD CREDITS
                </button>
              </div>
            </div>
            
            {/* Column 3: Potential Drops Table */}
            <div className="md:col-span-2 lg:col-span-1">
              <h2 className="text-xl font-bold mb-4 text-text-dark text-center lg:text-left">
                Potential Drops
              </h2>
              <div className="overflow-y-auto max-h-[400px] border border-gray-300 rounded-lg bg-white shadow-inner relative">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-beige-medium text-text-dark sticky top-0 z-20 shadow-sm">
                      <th className="text-left py-3 px-4 border-b border-gray-300 min-w-[150px] backdrop-blur-sm bg-opacity-90">Item</th>
                      <th className="text-right py-3 px-4 border-b border-gray-300 min-w-[100px] backdrop-blur-sm bg-opacity-90">Market Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullItemList.map((item) => (
                      <tr
                        key={`table-${item.id}`}
                        className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          ${parseFloat(item.value).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Footer Note */}
          <div className="mt-8 text-center text-xs text-gray-500">
            * Actual contents may vary. No returns on mystery boxes.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlindboxPage;