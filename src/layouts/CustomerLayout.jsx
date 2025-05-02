// src/layouts/CustomerLayout.js
import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaTimes,
  FaClipboard, // FaClipboard needed here as it's used directly in the cart UI for the modal trigger button (copy icon)
  FaTrash,
  FaPlus,
  FaMinus,
  FaSearch,
  FaUser,
  FaTag,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaChevronDown,
  FaShoppingCart as FaShoppingCartIcon, // Alias for use in headings/icons
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

// Import the Voucher Modal component - make sure the path is correct
import VoucherModal from "../components/VoucherModal";

// Import the useCart hook from your context file
import { useCart } from '../context/CartContext'; // Adjust the path relative to this file

export default function CustomerLayout() {
  // Consume the cart context instead of managing state locally
  const {
      cartItems,
      totalItemsCount, // Get derived count from context
      subtotal,
      formatPrice, // Get formatPrice from context
      updateQuantity, // Get updateQuantity from context
      removeItem,     // Get removeItem from context
      // We don't need addItemToCart here, as it's called from other pages/components
  } = useCart(); // <-- Use the custom hook here!


  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to get current location

  // State for the Voucher Modal visibility (remains local to Layout)
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setIsSearchOpen(false);
    }
  };
  // Effect to close all modals/overlays when the route changes (navigation)
  useEffect(() => {
    setIsCartOpen(false); // Close cart panel
    setIsSearchOpen(false); // Close search dropdown
    setIsVoucherModalOpen(false); // Close voucher modal
    // Add state updates for any other modals/popups that should close on navigation
  }, [location]); // Dependency array: re-run effect when the URL changes


  // --- Header/UI Handlers ---
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen); // Toggle search dropdown
  const openCart = () => setIsCartOpen(true); // Open cart panel
  const closeCart = () => setIsCartOpen(false); // Close cart panel

   // Handler to open Voucher Modal - DOES NOT CLOSE CART
   const openVoucherModal = () => {
       // setIsCartOpen(false); // <--- REMOVED: Do not close cart
       setIsVoucherModalOpen(true); // Open the voucher modal
       console.log("Opening voucher modal. Cart should remain open.");
   };
   const closeVoucherModal = () => setIsVoucherModalOpen(false); // Close voucher modal
   // --- End Header/UI Handlers ---


    // Vouchers data (remains local or could come from a different context if needed)
   const vouchers = [
     { title: "Miễn phí vận chuyển", condition: "Đơn hàng từ 0₫", code: "APRILFREESHIP", expiry: "13/04/2025" },
     { title: "Giảm 50k", condition: "Đơn hàng từ 899.000₫", code: "APRIL50K", expiry: "13/04/2025" },
     { title: "Giảm 10% Toàn Đơn", condition: "Áp dụng mọi đơn hàng", code: "TRENDY10", expiry: "31/12/2025" },
     { title: "Giảm 100k", condition: "Đơn hàng từ 1.500.000₫", code: "SAVE100", expiry: "30/06/2025" },
     { title: "Miễn phí ship + Giảm 20k", condition: "Đơn hàng bất kỳ", code: "COMBO20", expiry: "15/05/2025" },
     { title: "Voucher độc quyền App", condition: "Khi đặt hàng qua App", code: "APPONLY", expiry: "Vô thời hạn" },
     { title: "Giảm 75k", condition: "Đơn hàng từ 1.200.000₫", code: "GET75", expiry: "31/07/2025" },
   ];


  return (
    // Outer container wrapping the entire layout
    <div className="w-full min-h-screen flex flex-col bg-gray-50 text-gray-800">

      {/* --- Header Section --- */}
      {/* Header - remains consistent */}
      <header className="bg-white shadow-sm relative z-40 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-4xl font-['Georgia', serif] font-bold lowercase text-gray-800 tracking-tighter"> retrend. </Link>
          {/* Optional: Main Text Navigation (hidden on smaller screens) */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-800">
            <Link to="/" className="hover:text-gray-600"> TRANG CHỦ </Link>
            <Link to="/products" className="hover:text-gray-600"> TẤT CẢ SẢN PHẨM </Link>
            <div className="relative group"> <button className="hover:text-gray-600 flex items-center"> GỢI Ý PHỐ ĐÔNG 2025 </button> </div>
            <Link to="#" className="hover:text-gray-600"> ƯU ĐÃI KHỦNG </Link>
            {/* Policy Dropdown Trigger */}
            <div className="relative group">
              <button className="flex items-center text-sm font-medium text-gray-800 hover:text-gray-600 cursor-pointer">
                CHÍNH SÁCH MUA HÀNG <FaChevronDown className="ml-1 w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
              </button>
              {/* Policy Dropdown Content */}
              <div className="absolute hidden group-hover:block bg-white shadow-lg rounded py-2 w-52 z-20 top-full border border-gray-200">
                <Link to="/returns" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"> Chính sách đổi / trả </Link>
                <Link to="/shipping" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"> Chính sách vận chuyển </Link>
                <Link to="/contact" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"> Liên hệ </Link>
              </div>
            </div>
              <Link to="#" className="hover:text-gray-600">TIN TỨC</Link>
          </nav>
          {/* Icon-only Navigation / Actions - Aligned right */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button onClick={toggleSearch} className="text-gray-800 hover:text-gray-600 w-6 h-6 flex items-center justify-center" aria-label={isSearchOpen ? "Close search" : "Open search"}> <FaSearch size={20} /> </button>
            {/* User/Profile Icon */}
            <Link to="/profile" className="text-gray-800 hover:text-gray-600 w-6 h-6 flex items-center justify-center" aria-label="User Profile"> <FaUser size={20} /> </Link>
            {/* Cart Icon */}
            {/* Use totalItemsCount for the badge */}
            <button onClick={openCart} className="flex items-center justify-center text-gray-800 hover:text-gray-600 relative w-6 h-6" aria-label={`Shopping cart with ${totalItemsCount} unique items`}> {/* Use totalItemsCount */}
               <FaShoppingCart size={20} />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none">
                  {/* Display totalItemsCount for the badge */}
                  {totalItemsCount > 9 ? "9+" : totalItemsCount}
                </span>
              )} </button>
          </div>
        </div>
        {/* Search Dropdown Area (Animated) */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}
              className="w-full bg-gray-100 border-b border-gray-300 shadow-md absolute top-full left-0 z-30">
              <form onSubmit={handleSearchSubmit} className="max-w-7xl mx-auto px-4 py-4">
                <label htmlFor="site-search" className="block text-gray-700 text-lg font-semibold mb-3 text-center"> TÌM KIẾM </label>
                <div className="relative">
                  <input id="site-search" type="text" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent pr-12 text-lg" autoFocus />
                  <button type="submit" className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-gray-600 hover:text-amber-500" aria-label="Perform search">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div> </form>
            </motion.div>
          )} </AnimatePresence>
      </header>

      {/* --- Cart Overlay & Sliding Panel --- */}
      {/* This AnimatePresence handles the fading backdrop */}
      <AnimatePresence>
        {/* Render Backdrop only when cart is open */}
        {/* Backdrop z-40 is below the cart panel (z-50) and modal (z-60/z-[9999]) */}
        {isCartOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50" onClick={closeCart} aria-hidden="true" />
        )}
      </AnimatePresence>

       {/* This AnimatePresence handles the sliding cart panel */}
      <AnimatePresence>
         {/* Render Cart Panel only when isCartOpen is true */}
         {isCartOpen && (
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: "easeOut" }}
                 className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl z-50 flex flex-col overflow-hidden" > {/* z-50 for the cart panel itself */}
               <div className="h-full flex flex-col">
                 {/* Header */}
                 <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10"> {/* z-index for sticky header */}
                   <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"> <FaShoppingCartIcon size={20} /> Your Cart ({totalItemsCount}) {/* Use totalItemsCount */}</h2>
                   <button onClick={closeCart} className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors" aria-label="Close cart"> <FaTimes size={20} /> </button>
                 </div>

                 {/* Content Area - Item list and Vouchers (Scrollable Section) */}
                 {/* Added no-scrollbar class - needs corresponding CSS */}
                 <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 no-scrollbar">
                   {cartItems.length === 0 ? (
                     <p className="text-gray-500 text-center py-10">Your cart is empty</p>
                   ) : ( <>
                       {/* Fragment if you have siblings inside the scrollable area (Vouchers section header) */}
                       {/* Cart Items List */}
                         <div className="space-y-4"> {/* Consistent space between items */}
                           {cartItems.map((item) => (
                             <div key={item.id} className="flex border-b border-gray-200 pb-4 last:border-b-0 last:pb-0" >
                               {/* Item Image */}
                               <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                 <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                               </div>

                               {/* Item Details and Quantity Control (Simplified for Secondhand) */}
                               <div className="ml-4 flex-grow flex flex-col justify-between">
                                 <div> <h4 className="font-semibold text-gray-800 text-base mb-1">{item.name}</h4> </div> {/* Item Name */}
                                  {/* Price & (Implicit) Quantity 1 */}
                                  <div className="flex items-center justify-between mt-2"> {/* Adjusted margin */}
                                     {/* Display Price */}
                                     <div className="text-amber-600 font-bold text-lg flex-shrink-0"> {formatPrice(item.price)} </div>

                                     {/* Quantity Display (Always 1) and Remove Button */}
                                      {/* Combine the 'Quantity' and Remove Action area */}
                                     {/* Removed the +/- buttons completely */}
                                     <div className="flex items-center space-x-3 flex-shrink-0 text-sm text-gray-800"> {/* Adjusted spacing, added base styles */}
                                         {/* Remove Button (Trash Icon) */}
                                        <button onClick={() => removeItem(item.id)}
                                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-50/20" 
                                             aria-label={`Remove ${item.name} from cart`} > <FaTrash size={16} /> </button>
                                     </div>
                                  </div>
                               </div>
                            </div> ))}
                           </div> {/* End Cart Items List */}

                           {/* "MÃ ƯU ĐÃI DÀNH CHO BẠN" Header and Modal Trigger (Inside Scrollable Area) */}
                           {/* Only show this section header if there are vouchers available */}
                           {vouchers.length > 0 && (
                              <div className="pt-4 border-t border-gray-200 text-center">
                                   <h3 className="font-semibold text-gray-800 mb-4">MÃ ƯU ĐÃI DÀNH CHO BẠN</h3>
                                   {/* This button opens the voucher modal */}
                                   <button onClick={openVoucherModal} className="text-blue-600 hover:underline font-semibold text-sm" aria-label="View all available vouchers"> Xem tất cả mã ưu đãi ({vouchers.length}) </button>
                              </div> )}
                       </> )} {/* End Cart Items Check */}
                  </div> {/* End scrollable content area */}

                  {/* Footer - Subtotal, Checkout, and additional links (Sticky Section) */}
                  {/* No voucher list/copy here */}
                 <div className="p-6 border-t border-gray-300 bg-white sticky bottom-0 z-10"> {/* z-index for sticky footer */}
                    {/* Subtotal Display */}
                    <div className="flex justify-between items-center mb-6">
                       <div className="font-semibold text-xl text-gray-800">Subtotal</div>
                       <div className="font-bold text-2xl text-green-600">{formatPrice(subtotal)}</div> {/* Format subtotal */}
                    </div>

                   {/* Checkout Button (Link) */}
                   {/* Only show Checkout link if cart has items */}
                   {cartItems.length > 0 && (
                       <Link to="/checkout" onClick={closeCart} className="w-full py-3 rounded transition-colors text-lg font-semibold text-center inline-block bg-black text-white hover:bg-gray-800 shadow-lg" aria-label="Proceed to checkout" > Proceed to Checkout </Link>
                    )}

                   {/* --- Link Below Checkout --- */}
                   {/* Only show this single link to full cart page if cart is NOT empty */}
                   {cartItems.length > 0 && (
                         <div className="flex justify-center items-center mt-4 text-sm font-semibold"> {/* Centered using justify-center */}
                             {/* Link to dedicated Cart Page */}
                             <Link to="/cart" onClick={closeCart} className="text-blue-600 hover:underline" aria-label="View full shopping cart page"> Xem giỏ hàng </Link>
                              {/* REMOVED the second Voucher button here as requested */}
                         </div>
                    )}
                 </div> {/* End Cart Footer */}
               </div> {/* End flex-col inside cart panel */}
            </motion.div> 
        )}
      </AnimatePresence>

      {/* --- Render the Voucher Modal --- */}
      {/* This AnimatePresence ensures the modal transitions nicely when isOpen changes */}
      {/* VoucherModal is rendered outside the cart panel */}
      <AnimatePresence>
          {isVoucherModalOpen && (
               <VoucherModal
                  isOpen={isVoucherModalOpen} // Pass state
                  onClose={closeVoucherModal} // Pass close handler
                  vouchers={vouchers} // Pass voucher data
                  // The VoucherModal component manages its own pagination state internally
               />
            )}
       </AnimatePresence>
       {/* --- End Render Voucher Modal --- */}


      {/* Main Content Area - Dynamic padding based on search state */}
       {/* Adjust top padding based on whether the search dropdown is open. Account for Header height (h-16 = 4rem) + Search height (approx 4rem including padding/borders) = 8rem = pt-32. */}
       {/* Adjusted to pt-[8rem] which is effectively pt-32 using arbitrary value syntax */}
       {/* You might fine-tune this value `[8rem]` based on exact header+search bar height */}
      <main className={`flex-grow ${isSearchOpen ? 'pt-[8rem]' : 'pt-0'}`}>
         {/*
           The Outlet's content needs its own internal max-width, mx-auto, px-4
           if it shouldn't stretch full width (like the Featured Products section in HomePage).
           The Carousel in HomePage is handled using w-screen -mx-auto there.
         */}
        <Outlet /> {/* This is where your other page components like HomePage render */}
      </main>

      {/* Footer - Keep as is */}
       <footer className="bg-white pt-12 pb-6 shadow-md border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="md:col-span-1">
                <h3 className="text-xl font-bold mb-4 text-gray-800">VỀ RETREND.</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-6"> Retrend ra đời đầu năm 2025 với sứ mệnh đưa thời trang bền vững đến gần hơn với mọi người. Khởi đầu là một trang chia sẻ câu chuyện cuộc sống giản dị, chúng mình đã mở rộng thành nền tảng mua bán quần áo second-hand chất lượng cao. Retrend không chỉ là nơi mua sắm — đó còn là cộng đồng những người yêu phong cách tối giản, sáng tạo và trách nhiệm với môi trường. </p>
                <div className="text-sm text-gray-700 space-y-3">
                    <p className="flex items-start"> <FaMapMarkerAlt className="mr-2 mt-1 text-gray-600 flex-shrink-0"/> <span>FPT University, Quận 9, Thành phố Hồ Chí Minh</span> </p>
                    <p className="flex items-center"> <FaPhone className="mr-2 text-gray-600 flex-shrink-0"/> 0342.1900.17 </p>
                    <p className="flex items-center"> <FaEnvelope className="mr-2 text-gray-600 flex-shrink-0"/> retrend@gmail.com </p>
                </div> </div>
             <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div> <h3 className="text-xl font-bold mb-4 text-gray-800"> CHÍNH SÁCH MUA HÀNG. </h3> <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                      <li><Link to="/returns" className="hover:underline"> Chính sách đổi / trả </Link></li>
                      <li><Link to="/shipping" className="hover:underline"> Chính sách vận chuyển </Link></li>
                      <li><Link to="/contact" className="hover:underline"> Liên hệ </Link></li>
                       <li><Link to="#" className="hover:underline"> Hướng dẫn bảo quản / sử dụng </Link></li>
                       <li><Link to="#" className="hover:underline"> Danh sách cửa hàng </Link></li>
                   </ul> </div>
                <div> <h3 className="text-xl font-bold mb-4 text-gray-800"> Phương thức vận chuyển </h3> <p className="text-sm text-gray-700 space-y-2"> <span>Giao hàng tiêu chuẩn (2-5 ngày)</span> <span>Giao hàng hỏa tốc (Nội thành)</span> </p> </div>
             </div> </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-600"> Copyright © 2025 THE RETREND. </div>
      </footer> </div>
  );
}