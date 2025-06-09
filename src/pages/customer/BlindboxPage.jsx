// src/pages/BlindboxPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Link,
  useParams,
  useNavigate, // Added useParams
} from "react-router-dom";
import { API_BASE_URL } from "../../services/config";
import {
  FaShoppingCart,
  FaClock,
  FaBoxOpen,
  FaGift,
  FaInfoCircle,
  FaTag,
  FaTruck,
  FaArrowLeft,
  FaCreditCard,
  FaSpinner,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { getProductsByBlindboxName } from "../../services/ProductService"; // To show potential items
import { buyBlindbox as buyBlindboxApiCall } from "../../services/OrderService"; // API to buy the box
import { useCart } from "../../context/CartContext";
import shippingApiService from "../../services/ShippingApiService"; // To get shipping options

// Helper to get Logged In User Info (Adapt to your actual auth logic)
const getLoggedInUserInfo = () => {
  const token = localStorage.getItem("authToken");
  const userString = localStorage.getItem("user");
  if (token && userString) {
    try {
      const userData = JSON.parse(userString);
      return {
        userId: userData.userId || userData.id || null,
        username: userData.username || "",
        fullName:
          userData.fullName ||
          `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        phone: userData.phone || "",
        email: userData.email || "",
        shippingAddress: userData.shippingAddress || {
          city: userData.city || "",
          district: userData.district || "",
          ward: userData.ward || "",
          address: userData.addressGeneral || userData.address || "",
          addressDetail: userData.addressDetail || "",
        },
      };
    } catch (e) {
      return null;
    }
  }
  return null;
};

// --- BLINDBOX CONFIGURATION (Client-side for now) ---
// In a real app, fetch this from an API: /v1.0/blindbox/details/{blindboxName}
const BLINDBOX_DATA = {
  WINTER: {
    // Key by blindboxName from URL param
    displayName: "WINTER",
    price: 199000, // Price of the box itself
    description:
      "Khám phá những món đồ mùa đông ấm áp và phong cách! Mỗi hộp chứa ngẫu nhiên các sản phẩm thời trang secondhand chất lượng, hoàn hảo cho tiết trời se lạnh.",
    bannerImage:
      "https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Example image
    themeColor: "from-sky-500 to-indigo-600", // For gradient
    textColor: "text-sky-100",
  },
};
// --- END BLINDBOX CONFIGURATION ---

export default function BlindboxPurchasePage() {
  const { blindboxNameUrl } = useParams(); // Get blindboxName from URL if dynamic
  const navigate = useNavigate();
  const { formatPrice } = useCart(); // Assuming CartContext provides formatPrice

  const [blindboxDetails, setBlindboxDetails] = useState(null);
  const [potentialItems, setPotentialItems] = useState([]);
  const [isLoadingBoxData, setIsLoadingBoxData] = useState(true);
  const [error, setError] = useState(null);

  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 59,
    seconds: 59,
  }); // Example timer

  // Shipping and Payment state (similar to CheckoutPage)
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    ward: "",
    address: "",
    addressDetail: "",
  });
  const [availableShippingMethods, setAvailableShippingMethods] = useState([]);
  const [selectedShippingMethodId, setSelectedShippingMethodId] =
    useState(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(true);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // Add voucher state (was missing)
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // --- Effect to set Blindbox Details and Fetch Potential Items ---
  useEffect(() => {
    // Use blindboxNameUrl from params, or a default if not provided/static page
    const currentBlindboxName = decodeURIComponent(blindboxNameUrl || "WINTER");
    const details = BLINDBOX_DATA[currentBlindboxName];

    if (!details) {
      setError(`Blindbox "${currentBlindboxName}" không tìm thấy.`);
      setIsLoadingBoxData(false);
      setPotentialItems([]);
      return;
    }
    setBlindboxDetails(details);

    const fetchItems = async () => {
      setIsLoadingBoxData(true); // Combined loading state
      setError(null);
      try {
        const productsData = await getProductsByBlindboxName(
          currentBlindboxName
        );
        setPotentialItems(productsData || []);
      } catch (err) {
        setError(
          err.message || `Could not load items for ${currentBlindboxName}.`
        );
        setPotentialItems([]);
      } finally {
        setIsLoadingBoxData(false);
      }
    };

    fetchItems();
  }, [blindboxNameUrl]);

  // --- Effect to pre-fill shipping form for logged-in user ---
  useEffect(() => {
    const currentUser = getLoggedInUserInfo();
    if (currentUser) {
      setShippingForm({
        fullName: currentUser.fullName || "", // Assuming fullName from getLoggedInUserInfo
        phone: currentUser.phone || "",
        email: currentUser.email || "",
        city: currentUser.shippingAddress?.city || "",
        district: currentUser.shippingAddress?.district || "",
        ward: currentUser.shippingAddress?.ward || "",
        address: currentUser.shippingAddress?.address || "",
        addressDetail: currentUser.shippingAddress?.addressDetail || "",
      });
    }
  }, []); // Run once

  // --- Effect to Fetch Shipping Methods ---
  useEffect(() => {
    const fetchShipping = async () => {
      setIsLoadingShipping(true);
      try {
        const methods = await shippingApiService.getAllShippingMethods();
        setAvailableShippingMethods(methods || []);
        if (methods && methods.length > 0) {
          const defaultMethod =
            methods.find((m) => parseFloat(m.fee) === 0) || methods[0];
          if (defaultMethod)
            setSelectedShippingMethodId(
              String(defaultMethod.shippingMethodId || defaultMethod.id)
            );
        }
      } catch (err) {
        console.error("Failed to fetch shipping methods:", err);
      } finally {
        setIsLoadingShipping(false);
      }
    };
    fetchShipping();
  }, []);

  // --- Timer Effect (can be kept or removed if not relevant to this new design) ---
  useEffect(() => {
    /* ... your timer logic ... */
  }, []);

  const handleShippingInputChange = (e) =>
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });

  const currentShippingCost = useMemo(() => {
    if (!selectedShippingMethodId || availableShippingMethods.length === 0)
      return 30000; // Default
    const selectedMethod = availableShippingMethods.find(
      (m) =>
        String(m.shippingMethodId || m.id) === String(selectedShippingMethodId)
    );
    return selectedMethod ? parseFloat(selectedMethod.fee) || 0 : 30000;
  }, [selectedShippingMethodId, availableShippingMethods]);

  const finalTotal = useMemo(() => {
    if (!blindboxDetails) return 0;
    return (parseFloat(blindboxDetails.price) || 0) + currentShippingCost;
  }, [blindboxDetails, currentShippingCost]);

  // =====================================================================================
  const handlePurchaseBlindbox = async () => {
    console.log("=== Starting Purchase Process ===");

    if (!blindboxDetails) {
      console.error("blindboxDetails is missing:", blindboxDetails);
      toast.error("Thông tin blindbox không hợp lệ.");
      return;
    }

    const requiredFields = [
      "fullName",
      "phone",
      "city",
      "district",
      "ward",
      "address",
    ];
    console.log("Current shippingForm:", shippingForm);
    for (const field of requiredFields) {
      if (!shippingForm[field]?.trim()) {
        console.error(`Missing required field: ${field}`);
        toast.error(`Vui lòng điền đầy đủ thông tin giao hàng: ${field}.`);
        return;
      }
    }

    if (!selectedShippingMethodId) {
      console.error("No shipping method selected");
      toast.error("Vui lòng chọn phương thức vận chuyển.");
      return;
    }

    const currentUser = getLoggedInUserInfo();
    console.log("Current user:", currentUser);
    if (!currentUser || !currentUser.userId) {
      console.error("User not logged in or userId missing");
      toast.error("Bạn cần đăng nhập để mua hàng.");
      navigate("/login");
      return;
    }

    setIsProcessingPurchase(true);
    setError(null); // Clear previous page-level errors

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      setIsProcessingPurchase(false);
      navigate("/login");
      return;
    }

    let checkoutUrl = null; // Track checkout URL for redirect check

    try {
      const payload = {
        userId: String(currentUser.userId), // Ensure string type if API expects it
        blindboxName: blindboxDetails.displayName, // Or the internal name/ID your API expects
        shippingId: parseInt(selectedShippingMethodId, 10),
        shippingAddress:
          `${shippingForm.address}, ${shippingForm.ward}, ${shippingForm.district}, ${shippingForm.city}`.trim(),
        methodPayment: "online", // Assuming this is fixed for this flow
        voucherId: appliedVoucher ? parseInt(appliedVoucher.id, 10) : "", // Fixed: use null instead of empty string
        quantity: 1, // Blindboxes are typically quantity 1
        subtotal: parseFloat(blindboxDetails.price), // Price of the blindbox itself
        // total: finalTotal, // Backend should calculate the final total
      };

      console.log("=== API Call Details (Direct) ===");
      const url = `${API_BASE_URL}/v1.0/orders/buy-blindbox`;
      console.log("URL:", url);
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("Auth token being sent:", !!authToken);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*", // As per your previous API specs
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("=== Raw API Response Status ===");
      console.log("Status:", response.status);
      console.log("OK:", response.ok);

      // --- DIRECT RESPONSE HANDLING ---
      if (!response.ok) {
        let errorResponseMessage = `Lỗi API: ${response.status}`;
        try {
          const errorBody = await response.json(); // Try to get JSON error details
          console.error("API Error Body:", errorBody);
          errorResponseMessage =
            errorBody.message ||
            errorBody.messages ||
            errorBody.error ||
            errorResponseMessage;
        } catch (e) {
          // If error body is not JSON, try to get text
          try {
            const textError = await response.text();
            console.error("API Error Text Body:", textError);
            if (textError) errorResponseMessage = textError.substring(0, 200); // Limit length
          } catch (textE) {
            /* ignore if text body also fails */
          }
        }
        const error = new Error(errorResponseMessage);
        error.status = response.status; // Attach status to error object
        throw error;
      }

      // If response.ok is true, expect JSON { checkoutUrl, qrCode, ... }
      const responseData = await response.json();
      console.log("=== Parsed API Response Data ===");
      console.log("Response Data:", responseData);

      if (responseData && responseData.checkoutUrl) {
        checkoutUrl = responseData.checkoutUrl; // Store for redirect check
        console.log("Redirecting to PayOS checkout:", responseData.checkoutUrl);
        toast.info("Đang chuyển hướng đến cổng thanh toán PayOS...");
        // Optionally clear cart items related to this blindbox if they were "reserved"
        // For now, just redirecting.
        window.location.href = responseData.checkoutUrl;
        // setIsProcessingPurchase(false); // Page will navigate away
      } else {
        console.error(
          "Invalid API success response structure, missing checkoutUrl:",
          responseData
        );
        throw new Error(
          "Không thể tạo đơn hàng blindbox. Phản hồi API không hợp lệ hoặc thiếu URL thanh toán."
        );
      }
    } catch (err) {
      console.error("=== Purchase Process Error ===");
      console.error("Error object:", err);
      console.error("Error message:", err.message);
      console.error("Error status (if available):", err.status);
      console.error("Error data (if available from API error):", err.data); // if you attach it

      let displayErrorMessage =
        err.message || "Mua blindbox thất bại. Vui lòng thử lại.";
      if (err.status === 401) {
        displayErrorMessage =
          "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.";
        navigate("/login"); // Redirect to login for auth errors
      } else if (err.status === 400) {
        displayErrorMessage = `Dữ liệu không hợp lệ: ${err.message}`;
      } else if (err.status === 500) {
        displayErrorMessage = "Lỗi từ máy chủ. Vui lòng thử lại sau.";
      }

      toast.error(displayErrorMessage);
      setError(displayErrorMessage); // Set page-level error state
    } finally {
      // Ensure loading state is turned off if we didn't navigate away
      // Fixed: check if checkoutUrl was set instead of undefined variable
      if (!checkoutUrl) {
        setIsProcessingPurchase(false);
      }
    }
  };
  // =====================================================================================
  const formatTime = (time) => (time < 10 ? `0${time}` : time); // Keep for timer display

  // --- Render Logic ---
  if (isLoadingBoxData || (isLoadingShipping && !blindboxDetails)) {
    // Combined initial loading
    return (
      <div className="min-h-screen bg-beige py-12 px-4 flex justify-center items-center">
        <FaSpinner className="animate-spin text-4xl text-amber-700" />
      </div>
    );
  }
  if (error && !blindboxDetails) {
    // If blindbox details themselves failed to load based on name
    return (
      <div className="min-h-screen bg-beige py-12 px-4 text-center">
        <h2 className="text-2xl font-semibold text-red-700">Lỗi</h2>
        <p className="text-gray-700 mt-2">{error}</p>
        <Link
          to="/"
          className="mt-6 inline-block bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700"
        >
          Về Trang Chủ
        </Link>
      </div>
    );
  }
  if (!blindboxDetails) {
    // Should be caught by error above, but as a fallback
    return (
      <div className="min-h-screen bg-beige py-12 px-4 text-center">
        <h2 className="text-2xl font-semibold">Blindbox không tồn tại.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige py-8 px-4 text-gray-800 selection:bg-amber-500 selection:text-white">
      <div className="max-w-6xl mx-auto">
        {/* Back to All Products Link */}
        <div className="mb-6">
          <Link
            to="/products"
            className="text-sm text-amber-700 hover:text-amber-800 hover:underline flex items-center"
          >
            <FaArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại danh sách sản
            phẩm
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start">
            {/* Left Column: Blindbox Image & Info */}
            <div className="lg:col-span-2">
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg group mb-6">
                <img
                  src={
                    blindboxDetails.bannerImage ||
                    "https://via.placeholder.com/600x600?text=Blindbox"
                  }
                  alt={blindboxDetails.displayName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t ${
                    blindboxDetails.themeColor || "from-black/70"
                  } to-transparent`}
                >
                  <h1
                    className={`text-3xl font-bold ${
                      blindboxDetails.textColor || "text-white"
                    } drop-shadow-md`}
                  >
                    {blindboxDetails.displayName}
                  </h1>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Mô tả Blindbox
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {blindboxDetails.description}
                </p>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-2xl font-extrabold text-amber-700">
                    {formatPrice(blindboxDetails.price)}
                  </p>
                  {/* Timer - kept for thematic consistency if desired */}
                  <div className="mt-2 flex items-center bg-gray-100 px-3 py-1.5 rounded-full text-xs text-gray-700 max-w-fit">
                    <FaClock className="mr-1.5 text-gray-500" />
                    Thời gian còn lại: {formatTime(timeLeft.hours)}h{" "}
                    {formatTime(timeLeft.minutes)}m{" "}
                    {formatTime(timeLeft.seconds)}s
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Potential Items */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center md:text-left">
                Có thể chứa
              </h2>
              {isLoadingBoxData && potentialItems.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-4">
                  <FaSpinner className="animate-spin inline mr-2" />
                  Đang tải...
                </div>
              )}
              {!isLoadingBoxData && error && potentialItems.length === 0 && (
                <p className="text-xs text-red-500 text-center py-4">{error}</p>
              )}
              {!isLoadingBoxData && !error && potentialItems.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">
                  Không có thông tin vật phẩm.
                </p>
              )}

              <div className="space-y-2 max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar-thin bg-gray-50 p-3 rounded-lg border">
                {potentialItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-1.5 bg-white rounded shadow-sm text-xs"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                    <span
                      className="text-gray-700 truncate flex-1"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <span className="text-amber-700 font-medium whitespace-nowrap">
                      {formatPrice(item.priceVND || item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Shipping & Purchase Action */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
                  Thông tin giao hàng & Thanh toán
                </h2>

                {/* Shipping Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <label htmlFor="fullName" className="checkout-label">
                      Họ và Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      value={shippingForm.fullName}
                      onChange={handleShippingInputChange}
                      className="checkout-input-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="checkout-label">
                      Điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={shippingForm.phone}
                      onChange={handleShippingInputChange}
                      className="checkout-input-sm"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="checkout-label">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={shippingForm.address}
                      onChange={handleShippingInputChange}
                      className="checkout-input-sm"
                      placeholder="Số nhà, tên đường"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="ward" className="checkout-label">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ward"
                      id="ward"
                      value={shippingForm.ward}
                      onChange={handleShippingInputChange}
                      className="checkout-input-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="district" className="checkout-label">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      id="district"
                      value={shippingForm.district}
                      onChange={handleShippingInputChange}
                      className="checkout-input-sm"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="city" className="checkout-label">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={shippingForm.city}
                      onChange={handleShippingInputChange}
                      className="checkout-input-sm"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="addressDetail" className="checkout-label">
                      Ghi chú địa chỉ
                    </label>
                    <textarea
                      name="addressDetail"
                      id="addressDetail"
                      value={shippingForm.addressDetail}
                      onChange={handleShippingInputChange}
                      className="checkout-input-sm"
                      rows="2"
                      placeholder="VD: Tòa nhà ABC, Lầu 2, Gần chợ..."
                    ></textarea>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-1.5">
                    Phương thức vận chuyển{" "}
                    <span className="text-red-500">*</span>
                  </h4>
                  {isLoadingShipping && (
                    <div className="text-xs text-gray-400">
                      <FaSpinner className="animate-spin inline mr-1" /> Đang
                      tải...
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {availableShippingMethods.map((method) => (
                      <label
                        key={method.shippingMethodId || method.id}
                        className={`flex items-center p-2.5 border rounded-md hover:border-amber-600 cursor-pointer text-xs transition-all ${
                          String(method.shippingMethodId || method.id) ===
                          String(selectedShippingMethodId)
                            ? "bg-amber-50 border-amber-600 ring-1 ring-amber-500"
                            : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingMethodBlindbox"
                          value={String(method.shippingMethodId || method.id)}
                          checked={
                            String(method.shippingMethodId || method.id) ===
                            String(selectedShippingMethodId)
                          }
                          onChange={() =>
                            setSelectedShippingMethodId(
                              String(method.shippingMethodId || method.id)
                            )
                          }
                          className="form-radio h-3.5 w-3.5 text-amber-600 mr-2 focus:ring-amber-500"
                        />
                        <span className="flex-grow font-medium text-gray-700">
                          {method.name}
                        </span>
                        <span className="font-semibold text-gray-600">
                          {formatPrice(method.fee)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Giá hộp:</span>
                    <span className="font-medium">
                      {formatPrice(blindboxDetails.price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">
                      {isLoadingShipping
                        ? "..."
                        : formatPrice(currentShippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-amber-700 mt-2">
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePurchaseBlindbox}
                  disabled={
                    isProcessingPurchase ||
                    isLoadingShipping ||
                    !selectedShippingMethodId
                  }
                  className="w-full mt-4 bg-amber-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center text-base shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isProcessingPurchase ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaShoppingCart className="mr-2" />
                  )}
                  {isProcessingPurchase ? "ĐANG XỬ LÝ..." : "MUA HỘP NÀY"}
                </button>
                {error && (
                  <p className="text-red-500 text-xs mt-2 text-center">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <style jsx global>{`
        .checkout-input-sm {
          @apply w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500;
        }
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
