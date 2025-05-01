import React, { useState, useEffect } from "react"; // Import useEffect
import { useNavigate, Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaTimes,
  FaClipboard, // Icons for modals if used internally (not explicitly needed in this Checkout)
  FaChevronDown, // Maybe used in selects? (using native arrow)
  FaMapMarkerAlt, // For address icons
  FaPhone,
  FaEnvelope,
  FaUser,
  FaMinus,
  FaPlus 
} from "react-icons/fa";
import { AnimatePresence } from 'framer-motion';

// Import the useCart hook from your context
import { useCart } from "../../context/CartContext"; // Adjust path as necessary

// We will create simple mock modals here
import PaymentMethodModal from "../../components/PaymentMethodModal"; // Adjust path
import VoucherModal from "../../components/VoucherModal"; // Adjust path - assumes you have this working from previous steps

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  // Consume cart context to get cart data and price formatting
  const { cartItems, subtotal, formatPrice, updateQuantity, removeItem } =
    useCart(); // RemoveItem needed if we keep delete button in summary

  // --- State for Shipping/Contact Information Form ---
  const [shippingForm, setShippingForm] = useState({
    firstName: "", // Duona
    lastName: "", // An
    phone: "", // Phone
    email: "", // Email
    city: "", // Tỉnh/Thành phố (using a string for simplicity vs. select)
    district: "", // Quận/huyện
    ward: "", // Phường/xã
    address: "", // Tòa nhà, số nhà, tên đường (building, house number, street name)
    addressDetail: "", // Chi tiết địa chỉ (ghi chú địa điểm...) (Detailed address note)
  });

  // --- State for other sections ---
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState("standard"); // 'standard', 'express', etc.
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // State for payment modal
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod"); // 'cod', 'vnpay', etc.
  const [voucherCode, setVoucherCode] = useState(""); // State for voucher input
  const [appliedDiscount, setAppliedDiscount] = useState(0); // State for discount amount (simulated)
  // Assume 'Xem tất cả' button uses the VoucherModal you built, triggered externally
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const openVoucherModal = () => {
    // <-- This is where the function is defined
    // setIsCartOpen(false); // Removed line from earlier
    setIsVoucherModalOpen(true); // Set the state to true
    console.log("Opening voucher modal. Cart should remain open.");
  };
  const closeVoucherModal = () => setIsVoucherModalOpen(false);
  // Placeholder Voucher Data (should ideally come from Context or API if used elsewhere)
  // Keeping a small mock list for the "Áp dụng" button check
  const availableVouchers = [
    { code: "TEST100K", discount: 100000, minOrder: 500000, type: "fixed" },
    {
      code: "SHIPFREE",
      discount: "free_shipping",
      minOrder: 0,
      type: "shipping",
    },
    { code: "PERCENT10", discount: 0.1, minOrder: 1000000, type: "percentage" }, // Example percentage
  ];

  // --- Derived Calculations ---
  const shippingCost =
    selectedShippingMethod === "standard"
      ? 0
      : selectedShippingMethod === "express"
      ? 30000
      : 0; // Example flat rate for standard
  const totalBeforeDiscount = subtotal + shippingCost; // Subtotal + Shipping
  const totalAfterDiscount = totalBeforeDiscount - appliedDiscount; // Total after applying discount
  const estimatedPoints = Math.floor(totalAfterDiscount / 10000); // Simple point calculation (e.g., 1 point per 10,000 VND)

  // Formats a price in VND (can use formatPrice from context directly now)
  const formatVND = formatPrice;

  // --- Effects ---
  useEffect(() => {
    // In a real app, if the user is logged in, pre-populate shipping form from user profile data
    // Example: Fetch user profile data here and setForm(user.shippingAddress)
    console.log("CheckoutPage mounted. Pre-populating form/methods (mock).");
    // Set default values if not already set (useful if form pre-populates from API/Profile)
    setShippingForm((prev) => ({
      firstName: prev.firstName || "",
      lastName: prev.lastName || "",
      phone: prev.phone || "",
      email: prev.email || "",
      city: prev.city || "",
      district: prev.district || "",
      ward: prev.ward || "",
      address: prev.address || "",
      addressDetail: prev.addressDetail || "",
    }));

    // Set default method if not already set
    setSelectedShippingMethod((prev) => prev || "standard");
    setSelectedPaymentMethod((prev) => prev || "cod");

    // Check if cart is empty and redirect
    if (!cartItems || cartItems.length === 0) {
      console.log("Cart is empty. Redirecting to cart page.");
      navigate("/cart"); // Redirect if cart is empty
    }
  }, [cartItems, navigate]); // Rerun effect if cart or navigate changes

  // --- Handlers ---
  const handleShippingInputChange = (e) => {
    const { name, value } = e.target;
    // Implement validation logic here as needed (e.g., check required fields, phone format)
    setShippingForm({ ...shippingForm, [name]: value });
  };

  // Placeholder: Open Payment Method Selection Modal
  const openPaymentModal = () => {
    setIsPaymentModalOpen(true);
    console.log("Opening payment method modal (mock).");
  };
  // Placeholder: Handle Payment Method Selected (Called from modal)
  const handlePaymentMethodSelected = (method) => {
    setSelectedPaymentMethod(method); // Update state
    setIsPaymentModalOpen(false); // Close modal
    console.log("Payment method selected:", method);
    // Implement any necessary UI updates or API calls based on selection
  };
  // Placeholder: Close Payment Method Modal
  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    console.log("Closing payment method modal.");
  };

  // Placeholder: Apply Voucher Code Logic
  const handleApplyVoucher = () => {
    if (!voucherCode) {
      console.log("No voucher code entered.");
      setAppliedDiscount(discountAmount); // Reset discount if code is empty
      setError("Please enter a voucher code."); // Show feedback
      return;
    }

    const codeToApply = voucherCode.toUpperCase().trim(); // Case-insensitive and trim
    const voucher = availableVouchers.find((v) => v.code === codeToApply);

    if (!voucher) {
      console.log(`Voucher code "${codeToApply}" not found.`);
      setAppliedDiscount(0);
      setError(`Mã "${codeToApply}" không hợp lệ.`); // "Code not valid"
      return;
    }

    // --- Check Voucher Conditions ---
    // Check minimum order value
    if (totalBeforeDiscount < voucher.minOrder) {
      console.log(
        `Voucher code "${codeToApply}" requires min order of ${voucher.minOrder}. Current total: ${totalBeforeDiscount}`
      );
      setAppliedDiscount(0);
      setError(
        `Mã "${codeToApply}" cần đơn hàng tối thiểu ${formatVND(
          voucher.minOrder
        )}.`
      ); // "Code requires min order..."
      return;
    }

    // Check type of discount and calculate
    let discountAmount = 0;
    if (voucher.type === "fixed") {
      discountAmount = voucher.discount;
      console.log(`Applied fixed discount: ${discountAmount}`);
    } else if (voucher.type === "percentage") {
      discountAmount = totalBeforeDiscount * voucher.discount; // Calculate percentage
      // Optional: Cap percentage discount at a max value if needed
      console.log(`Applied percentage discount: ${discountAmount}`);
    } else if (voucher.type === "shipping") {
      discountAmount = shippingCost; // Discount equals the current shipping cost
      console.log(`Applied free shipping discount: ${discountAmount}`);
    }
    // Ensure discount amount doesn't exceed the total before discount
    discountAmount = Math.min(discountAmount, totalBeforeDiscount);

    // --- Apply Discount ---
    setAppliedDiscount(discountAmount); // Update discount state
    setError(null); // Clear errors on success
    // Optional: Show success message to user
    console.log(
      `Voucher code "${codeToApply}" applied. Discount: ${discountAmount}`
    );

    // Note: In a real app, applying a voucher usually requires sending
    // the code to the backend to validate eligibility and return the
    // final price breakdown from the server.
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    // Basic validation example
    if (
      !shippingForm.firstName ||
      !shippingForm.lastName ||
      !shippingForm.phone ||
      !shippingForm.email ||
      !shippingForm.city ||
      !shippingForm.district ||
      !shippingForm.ward ||
      !shippingForm.address ||
      setError(null)
    ) {
      setError("Please fill in all required shipping information."); // Display error
      console.warn(
        "Form validation failed. Please fill in all required fields."
      );
      return; // Stop submission
    }
    if (!selectedShippingMethod) {
      setError("Please select a shipping method.");
      return;
    }
    if (!selectedPaymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    setError(null); // Clear previous errors on submit attempt
    setIsLoading(true); // Show loading indicator during submission (if applicable)

    // --- Simulate Order Submission ---
    console.log("Submitting Order (Mock)...");
    console.log("Shipping Info:", shippingForm);
    console.log("Shipping Method:", selectedShippingMethod);
    console.log("Payment Method:", selectedPaymentMethod);
    console.log(
      "Applied Voucher Code:",
      voucherCode,
      "Discount:",
      appliedDiscount
    );
    console.log("Cart Items:", cartItems);
    console.log("Final Total:", totalAfterDiscount);

    // In a real app: Send data to backend API via fetch or axios POST request
    /*
     fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            shippingInfo: shippingForm,
            shippingMethod: selectedShippingMethod,
            paymentMethod: selectedPaymentMethod,
            voucherCode: voucherCode, // Or applied voucher ID
            cartItems: cartItems.map(item => ({ productId: item.id, quantity: item.quantity })), // Simplified cart items
            totalAmount: totalAfterDiscount // Total to be confirmed by server
            // Include other details like userId if applicable
        })
     })
     .then(response => {
        if (!response.ok) throw new Error('Order placement failed');
        return response.json(); // Assuming backend returns order confirmation
     })
     .then(orderConfirmation => {
         console.log("Order placed successfully (mock):", orderConfirmation);
         // Clear the cart upon successful order
         // setCartItems([]); // Call setCartItems from useCart hook (need access)
         localStorage.removeItem('cartItems'); // Clear mock storage

         // Redirect to order confirmation page
         navigate('/order-confirmation/' + orderConfirmation.orderId); // Assuming ID is returned
     })
     .catch(err => {
         console.error("Order submission error:", err);
         setError(`Order placement failed: ${err.message || 'Unknown error'}`); // Display error to user
         setIsLoading(false); // Stop loading
     });
     */

    // --- Mock Success Simulation (Replace with real fetch logic above) ---
    // For mock success, just log and clear cart, then redirect
    setTimeout(() => {
      console.log("Mock order submission success.");
      // We need access to setCartItems from CartContext here
      // For this mock, we can directly manipulate localStorage or need Context access
      // If using CartContext properly wrapped higher up, you'd useContext().setCartItems([]);
      // For now, simulate clearing mock localStorage used by CartContext
      localStorage.removeItem("cartItems"); // Clear mock storage
      // A simple way to signal the cart context could be a special function or refreshing logic

      // Redirect to a success page or home
      navigate("/"); // Redirect to home or a success page

      // Show thank you message briefly if needed (handle on landing page or in a state here before redirect)
      // Example: setSubmitted(true); setTimeout(() => navigate('/'), 3000); // As in old code
    }, 1500); // Simulate delay
  };

  // Render placeholder when cart is empty (as handled by useEffect)
  if (!cartItems || cartItems.length === 0) {
    // The useEffect already redirects to /cart, so this component shouldn't render unless the redirect hasn't happened yet
    // If it *does* render briefly before redirect, maybe show a minimal message
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        Redirecting to Cart...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {" "}
      {/* Main centered container */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Thanh toán {/* "Checkout" */}
      </h1>
      {/* Optional: Progress indicator if multi-step */}
      {/* Main Checkout Grid: Shipping (col 1), Payment/Voucher (col 2), Order Summary (col 3) */}
      {/* Use grid-cols-1 on small, 3 equal columns on medium+ */}
      {/* Image structure looks roughly 1/3, 1/3, 1/3 */}
      <form onSubmit={handleSubmitOrder} noValidate>
        {" "}
        {/* Use form for proper semantic structure and submission */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* --- Column 1: Shipping Information (Thông tin giao hàng) --- */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              {" "}
              {/* Container block */}
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Thông tin giao hàng
              </h3>{" "}
              {/* Heading */}
              {/* First/Last Name Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="shippingFirstName"
                    className="block text-sm font-medium text-gray-700 mb-1 required-label"
                  >
                    Tên {/* "First Name" */}
                  </label>
                  <input
                    id="shippingFirstName"
                    name="firstName"
                    type="text"
                    value={shippingForm.firstName}
                    onChange={handleShippingInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-blue-500 required-input"
                    required
                    placeholder="Duoha" // Placeholder from image
                  />
                </div>
                {/* Last Name */}
                <div>
                  <label
                    htmlFor="shippingLastName"
                    className="block text-sm font-medium text-gray-700 mb-1 required-label"
                  >
                    Họ {/* "Last Name" */}
                  </label>
                  <input
                    id="shippingLastName"
                    name="lastName"
                    type="text"
                    value={shippingForm.lastName}
                    onChange={handleShippingInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-blue-500 required-input"
                    required
                    placeholder="An" // Placeholder from image
                  />
                </div>
              </div>
              {/* Phone Input */}
              <div className="mt-4">
                <label
                  htmlFor="shippingPhone"
                  className="block text-sm font-medium text-gray-700 mb-1 required-label"
                >
                  Số điện thoại {/* "Phone Number" */}
                </label>
                {/* Assuming international format hint or pattern needed */}
                <input
                  id="shippingPhone"
                  name="phone"
                  type="tel"
                  value={shippingForm.phone}
                  onChange={handleShippingInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-blue-500 required-input"
                  required
                  placeholder="+ 84961792119" // Placeholder from image
                />
              </div>
              {/* Email Input */}
              <div className="mt-4">
                <label
                  htmlFor="shippingEmail"
                  className="block text-sm font-medium text-gray-700 mb-1 required-label"
                >
                  Địa chỉ Email {/* "Email Address" */}
                </label>
                <input
                  id="shippingEmail"
                  name="email"
                  type="email"
                  value={shippingForm.email}
                  onChange={handleShippingInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-blue-500 required-input"
                  required
                  placeholder="ansiucapcute@gmail.com" // Placeholder from image
                />
              </div>
              {/* Location Fields (City, District, Ward) - Using simple text inputs/selects for structure */}
              {/* Province/City */}
              <div className="mt-4">
                {/* Add red border/text styling if field is empty/invalid on blur/submit */}
                <label
                  htmlFor="shippingCity"
                  className="block text-sm font-medium text-gray-700 mb-1 required-label"
                >
                  Tỉnh/Thành phố {/* "Province/City" */}
                </label>
                {/* Could be a select input for actual implementation */}
                <input
                  id="shippingCity"
                  name="city"
                  type="text"
                  value={shippingForm.city}
                  onChange={handleShippingInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-blue-500 required-input"
                  required
                  placeholder="Chọn Tỉnh/Thành phố" // Placeholder from image (or select prompt)
                />
                {/* Example Red Required Text (visible on submit if empty) */}
                {/* {formErrors.city && <p className="text-red-500 text-xs mt-1">Tỉnh/Thành phố là bắt buộc</p>} */}
              </div>
              {/* District */}
              <div className="mt-4">
                <label
                  htmlFor="shippingDistrict"
                  className="block text-sm font-medium text-gray-700 mb-1 required-label"
                >
                  Quận/Huyện {/* "District" */}
                </label>
                {/* Could be a select input */}
                <input
                  id="shippingDistrict"
                  name="district"
                  type="text"
                  value={shippingForm.district}
                  onChange={handleShippingInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-blue-500 required-input"
                  required
                  placeholder="Chọn Quận/Huyện" // Placeholder
                />
                {/* {formErrors.district && <p className="text-red-500 text-xs mt-1">Quận/Huyện là bắt buộc</p>} */}
              </div>
              {/* Ward */}
              <div className="mt-4">
                <label
                  htmlFor="shippingWard"
                  className="block text-sm font-medium text-gray-700 mb-1 required-label"
                >
                  Phường/Xã {/* "Ward" */}
                </label>
                {/* Could be a select input */}
                <input
                  id="shippingWard"
                  name="ward"
                  type="text"
                  value={shippingForm.ward}
                  onChange={handleShippingInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-blue-500 required-input"
                  required
                  placeholder="Chọn Phường/Xã" // Placeholder
                />
                {/* {formErrors.ward && <p className="text-red-500 text-xs mt-1">Phường/Xã là bắt buộc</p>} */}
              </div>
              {/* Street/Building/House Number */}
              <div className="mt-4">
                <label
                  htmlFor="shippingAddress"
                  className="block text-sm font-medium text-gray-700 mb-1 required-label"
                >
                  Tòa nhà, số nhà, tên đường{" "}
                  {/* "Building, house number, street name" */}
                </label>
                <input
                  id="shippingAddress"
                  name="address"
                  type="text"
                  value={shippingForm.address}
                  onChange={handleShippingInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-blue-500 required-input"
                  required
                  placeholder="Tòa nhà, số nhà, tên đường" // Placeholder from image
                />
                {/* {formErrors.address && <p className="text-red-500 text-xs mt-1">Tòa nhà, số nhà, tên đường là bắt buộc</p>} */}
              </div>
              {/* Detailed Address / Note */}
              <div className="mt-4">
                <label
                  htmlFor="shippingAddressDetail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Chi tiết địa chỉ (Vd: Địa chỉ gần đó,...)
                  {/* "Detailed address note" */}
                </label>
                <textarea
                  id="shippingAddressDetail"
                  name="addressDetail"
                  value={shippingForm.addressDetail}
                  onChange={handleShippingInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-blue-500"
                  rows="2"
                  placeholder="Chi tiết địa chỉ (Vd: Địa chỉ gần đó,...)" // Placeholder from image
                />
              </div>
            </div>
          </div>

          {/* --- Column 2: Shipping Method, Payment, Voucher (Mua online, Phương thức thanh toán, Voucher và Coupon) --- */}
          <div className="md:col-span-1 space-y-4">
            {/* Shipping Method Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              {" "}
              {/* Container block */}
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Mua online {/* "Online Purchase" */}
              </h3>{" "}
              {/* Heading */}
              {/* Shipping Option */}
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="radio"
                  name="shippingMethod"
                  value="standard"
                  checked={selectedShippingMethod === "standard"}
                  onChange={() => setSelectedShippingMethod("standard")}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">
                  Giao hàng tiêu chuẩn (3 - 6 ngày) (Giao giờ hành chính)
                </span>{" "}
                {/* Text from image */}
              </label>
              {/* Add other shipping options if needed */}
            </div>
            {/* Payment Method Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              {" "}
              {/* Container block */}
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Phương thức thanh toán {/* "Payment Method" */}
              </h3>{" "}
              {/* Heading */}
              {/* Display selected method and Change button */}
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  {selectedPaymentMethod === "cod" &&
                    "Trả tiền mặt khi nhận hàng (COD)"}
                  {selectedPaymentMethod === "vnpay" && "Thanh toán VNPAY"}{" "}
                  {/* Example VNPAY */}
                  {/* Add other payment method display */}
                  {!selectedPaymentMethod && "Chọn phương thức"}{" "}
                  {/* Fallback if none selected */}
                </span>
                <button
                  type="button" // Important: prevent form submission
                  onClick={openPaymentModal}
                  className="text-blue-600 hover:underline font-semibold text-sm" // Style as link
                >
                  Thay đổi {/* "Change" */}
                </button>
              </div>
            </div>
            {/* Voucher and Coupon Section */}
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
              {" "}
              {/* Container block, added space */}
              <div className="flex justify-between items-center">
                {" "}
                {/* Flex for heading and link */}
                <h3 className="text-xl font-semibold text-gray-800">
                  Voucher và Coupon
                </h3>{" "}
                {/* Heading */}
                {/* Link to view all vouchers - Triggers VoucherModal */}
                {/* Assuming this is a link/button that triggers the modal provided before */}
                {/* Pass vouchers data and trigger function here if needed */}
                <button
                  type="button"
                  onClick={openVoucherModal}
                  className="text-gray-600 hover:underline font-semibold text-sm"
                >
                  Xem tất cả {/* "View all" */}
                </button>
              </div>
              {/* Voucher Input and Apply Button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá (nếu có)" // Placeholder from image
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className={`flex-grow border rounded px-3 py-2 text-sm focus:outline-none ${
                    error && error.includes("Mã")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`} // Red border on voucher error
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm"
                >
                  Áp dụng {/* "Apply" */}
                </button>
              </div>
              {/* Display applied discount code/message/amount (Optional feedback) */}
              {appliedDiscount > 0 && error === null && (
                <p className="text-green-600 text-sm mt-1">
                  Giảm giá đã áp dụng: {formatVND(appliedDiscount)}
                </p>
              )}
              {error &&
                error.includes("Mã") && ( // Only show voucher-specific error here
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                )}
            </div>{" "}
            {/* End Voucher Section */}
            {/* Hidden sections */}
            {/* Bạn có phiếu mua hàng? (Removed) */}
            {/* Yêu cầu thêm (Removed) */}
            {/* Yêu cầu xuất hoá đơn (Removed) */}
          </div>

          {/* --- Column 3: Order Summary (Đơn hàng) --- */}
          {/* Make this column sticky or use a flex layout if needed */}
          <div className="md:col-span-1 space-y-4">
            {" "}
            {/* Container column */}
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4 sticky top-24">
              {" "}
              {/* Sticky top for summary */}
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Đơn hàng {/* "Order" */}
              </h3>{" "}
              {/* Heading */}
              {/* List Cart Items in Summary */}
              {cartItems && cartItems.length > 0 ? (
                <div className="space-y-4 border-b border-gray-200 pb-4">
                  {cartItems.map((item) => (
                    // Single Item Row in Summary
                    <div key={item.id} className="flex gap-4 items-start">
                      {" "}
                      {/* Use gap and align items start */}
                      {/* Item Image (Smaller) */}
                      <img
                        src={item.image} // Use main image URL
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0" // Smaller size
                      />
                      {/* Item Details and Quantity */}
                      <div className="flex-grow text-sm">
                        {" "}
                        {/* Use text-sm */}
                        <h4 className="font-semibold text-gray-800">
                          {item.name}
                        </h4>{" "}
                        {/* Darker, semibold */}
                        {/* Assuming additional info like product code and size/color shown here */}
                        <p className="text-gray-600 text-xs">10F24P...</p>{" "}
                        {/* Placeholder code from image */}
                        <p className="text-gray-600 text-xs">
                          {item.size || "N/A"}, {item.color || "N/A"}
                        </p>{" "}
                        {/* Size/Color example */}
                        {/* Simple Quantity Display or Input if needed */}
                        {/* If editing quantity in summary needed, use FaMinus/FaPlus */}
                        <div className="flex items-center mt-2">
                          {/* Example Quantity Control */}
                          {/* Assuming you might still need +/- on summary, adapted from cart panel */}
                          {/* Remove completely if summary is read-only for quantity */}
                          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-1 py-0.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                              disabled={item.quantity === 1} // Keep quantity 1 rule
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              {" "}
                              <FaMinus size={10} />{" "}
                            </button>
                            <span className="px-1 text-xs font-semibold text-gray-800 border-l border-r border-gray-300 min-w-[20px] text-center">
                              {item.quantity}
                            </span>{" "}
                            {/* Quantity display */}
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-1 py-0.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                              disabled={true} // Disable increment
                              aria-label={`Increase quantity of ${item.name} (disabled)`}
                            >
                              {" "}
                              <FaPlus size={10} />{" "}
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Item Line Total Price */}
                      <div className="font-bold text-gray-800 flex-shrink-0 text-sm text-right">
                        {" "}
                        {/* Text-right aligns price */}
                        {/* Calculate and display total price for THIS item line (price * quantity) */}
                        {formatVND((item.price || 0) * (item.quantity || 0))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Message if cart is empty (should be caught by useEffect redirect, but defensive)
                <p className="text-gray-500 text-center italic pb-4 border-b border-gray-200">
                  Giỏ hàng trống
                </p>
              )}{" "}
              {/* End cart items check */}
              {/* Price Breakdown Summary */}
              <div className="space-y-2 text-gray-800 text-sm">
                {" "}
                {/* Added spacing and text size */}
                <div className="flex justify-between">
                  <span>Tổng giá trị đơn hàng</span> {/* "Subtotal" */}
                  <span>{formatVND(subtotal)}</span>{" "}
                  {/* Use subtotal from context */}
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span> {/* "Shipping Cost" */}
                  <span className="font-medium">
                    {formatVND(shippingCost)}
                  </span>{" "}
                  {/* Use calculated shipping cost */}
                </div>
                <div className="flex justify-between font-semibold">
                  {" "}
                  {/* Make discount line bold */}
                  <span className="text-red-600">Giảm giá</span>{" "}
                  {/* "Discount" in red */}
                  <span>-{formatVND(appliedDiscount)}</span>{" "}
                  {/* Display calculated discount, maybe red color */}
                </div>
                {/* Hidden lines */}
                {/* ROUTINE Reward (Removed) */}
                {/* Số điểm tích luỹ dự kiến (Removed) */}
              </div>
              {/* Final Total (Thành tiền) */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-gray-900 font-bold">
                {" "}
                {/* Border top, bold */}
                <span className="text-lg">Thành tiền</span>{" "}
                {/* "Total Amount" */}
                <span className="text-xl">
                  {formatVND(totalAfterDiscount)}
                </span>{" "}
                {/* Display calculated total */}
              </div>
              {/* Order Button */}
              <button
                type="submit" // Submit the main form
                className="w-full bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors mt-4 text-lg" // Styled button, added top margin
              >
                Đặt hàng {/* "Place Order" */}
              </button>
              {/* Terms and Conditions */}
              <div className="mt-4 text-center text-xs text-gray-600">
                Khi tiếp tục, bạn đồng ý với các{" "}
                <Link
                  to="/terms"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Điều khoản & Điều kiện
                </Link>{" "}
                và{" "}
                <Link
                  to="/policy"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Chính sách của chúng tôi
                </Link>
                . {/* Placeholder links */}
              </div>
              {/* --- End Order Summary Section --- */}
              {/* Global Error Display (e.g., for submission failure or validation summary) */}
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  {/* Check if error includes "Mã" to maybe handle that separately near voucher field */}
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
            </div>{" "}
            {/* End Sticky Container */}
          </div>
        </div>{" "}
        {/* End main grid */}
      </form>{" "}
      {/* End form */}
      {/* --- Modals (Rendered outside the main grid) --- */}
      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)} // Simple close handler
        onMethodSelected={handlePaymentMethodSelected} // Handler when a method is chosen
        currentMethod={selectedPaymentMethod} // Pass current method to modal
      />
      <AnimatePresence>
        {/* Render VoucherModal only when isVoucherModalOpen state is true */}
        {isVoucherModalOpen && (
          <VoucherModal
            isOpen={isVoucherModalOpen} // Controls the modal's visibility
            onClose={closeVoucherModal} // Handler to close the modal (e.g., from the modal's close button or backdrop click)
            vouchers={voucherCode} // Pass the available vouchers data to the modal
          />
        )}
      </AnimatePresence>
    </div> // End main page container
  );
}
