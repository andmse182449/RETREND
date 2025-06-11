// src/pages/BlindboxPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
  FaStar,
  FaHeart,
  FaShare,
  FaEye,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaMagic,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { getProductsByBlindboxName } from "../../services/ProductService";
import { buyBlindbox as buyBlindboxApiCall } from "../../services/OrderService";
import { useCart } from "../../context/CartContext";
import shippingApiService from "../../services/ShippingApiService";

// Helper to get Logged In User Info
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

// BLINDBOX CONFIGURATION
const BLINDBOX_DATA = {
  WINTER: {
    displayName: "WINTER",
    price: 199000,
    originalPrice: 299000,
    description:
      "Khám phá những món đồ mùa đông ấm áp và phong cách! Mỗi hộp chứa ngẫu nhiên các sản phẩm thời trang secondhand chất lượng cao, hoàn hảo cho tiết trời se lạnh.",
    features: [
      "3-5 sản phẩm chất lượng cao",
      "Giá trị thực tế 400-600k",
      "Phong cách mùa đông trendy",
      "Hàng secondhand được tuyển chọn kỹ",
    ],
    bannerImage:
      "https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    themeColor: "from-blue-600 via-purple-600 to-indigo-700",
    textColor: "text-white",
    stats: {
      sold: 127,
      rating: 4.8,
      reviews: 89,
    },
  },
};

export default function BlindboxPurchasePage() {
  const { blindboxNameUrl } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCart();

  const [blindboxDetails, setBlindboxDetails] = useState(null);
  const [potentialItems, setPotentialItems] = useState([]);
  const [isLoadingBoxData, setIsLoadingBoxData] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 59,
    seconds: 59,
  });

  // Shipping and Payment state
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
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Effect to set Blindbox Details and Fetch Potential Items
  useEffect(() => {
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
      setIsLoadingBoxData(true);
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

  // Effect to pre-fill shipping form for logged-in user
  useEffect(() => {
    const currentUser = getLoggedInUserInfo();
    if (currentUser) {
      setShippingForm({
        fullName: currentUser.fullName || "",
        phone: currentUser.phone || "",
        email: currentUser.email || "",
        city: currentUser.shippingAddress?.city || "",
        district: currentUser.shippingAddress?.district || "",
        ward: currentUser.shippingAddress?.ward || "",
        address: currentUser.shippingAddress?.address || "",
        addressDetail: currentUser.shippingAddress?.addressDetail || "",
      });
    }
  }, []);

  // Effect to Fetch Shipping Methods
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

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleShippingInputChange = (e) =>
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });

  const currentShippingCost = useMemo(() => {
    if (!selectedShippingMethodId || availableShippingMethods.length === 0)
      return 30000;
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
    setError(null);

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      setIsProcessingPurchase(false);
      navigate("/login");
      return;
    }

    let checkoutUrl = null;

    try {
      const payload = {
        userId: String(currentUser.userId),
        blindboxName: blindboxDetails.displayName,
        shippingId: parseInt(selectedShippingMethodId, 10),
        shippingAddress:
          `${shippingForm.address}, ${shippingForm.ward}, ${shippingForm.district}, ${shippingForm.city}`.trim(),
        methodPayment: "online",
        voucherId: appliedVoucher ? parseInt(appliedVoucher.id, 10) : "",
        quantity: 1,
        subtotal: parseFloat(blindboxDetails.price),
      };

      console.log("=== API Call Details (Direct) ===");
      const url = `${API_BASE_URL}/v1.0/orders/buy-blindbox`;
      console.log("URL:", url);
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("Auth token being sent:", !!authToken);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("=== Raw API Response Status ===");
      console.log("Status:", response.status);
      console.log("OK:", response.ok);

      if (!response.ok) {
        let errorResponseMessage = `Lỗi API: ${response.status}`;
        try {
          const errorBody = await response.json();
          console.error("API Error Body:", errorBody);
          errorResponseMessage =
            errorBody.message ||
            errorBody.messages ||
            errorBody.error ||
            errorResponseMessage;
        } catch (e) {
          try {
            const textError = await response.text();
            console.error("API Error Text Body:", textError);
            if (textError) errorResponseMessage = textError.substring(0, 200);
          } catch (textE) {
            /* ignore if text body also fails */
          }
        }
        const error = new Error(errorResponseMessage);
        error.status = response.status;
        throw error;
      }

      const responseData = await response.json();
      console.log("=== Parsed API Response Data ===");
      console.log("Response Data:", responseData);

      if (responseData && responseData.checkoutUrl) {
        checkoutUrl = responseData.checkoutUrl;
        console.log("Redirecting to PayOS checkout:", responseData.checkoutUrl);
        toast.info("Đang chuyển hướng đến cổng thanh toán PayOS...");
        window.location.href = responseData.checkoutUrl;
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
      console.error("Error data (if available from API error):", err.data);

      let displayErrorMessage =
        err.message || "Mua blindbox thất bại. Vui lòng thử lại.";
      if (err.status === 401) {
        displayErrorMessage =
          "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.";
        navigate("/login");
      } else if (err.status === 400) {
        displayErrorMessage = `Dữ liệu không hợp lệ: ${err.message}`;
      } else if (err.status === 500) {
        displayErrorMessage = "Lỗi từ máy chủ. Vui lòng thử lại sau.";
      }

      toast.error(displayErrorMessage);
      setError(displayErrorMessage);
    } finally {
      if (!checkoutUrl) {
        setIsProcessingPurchase(false);
      }
    }
  };

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  const displayedItems = showAllItems
    ? potentialItems
    : potentialItems.slice(0, 6);

  // Loading state
  if (isLoadingBoxData || (isLoadingShipping && !blindboxDetails)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <FaBoxOpen className="text-6xl text-purple-600 mb-4 mx-auto animate-bounce" />
            <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin text-2xl text-white" />
          </div>
          <p className="text-lg text-gray-600">
            Đang tải thông tin hộp bí ẩn...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error && !blindboxDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-12 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <FaBoxOpen className="text-6xl text-red-400 mb-6 mx-auto" />
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            Oops! Có lỗi xảy ra
          </h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Về Trang Chủ
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!blindboxDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Blindbox không tồn tại.
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4 text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/products"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Quay lại danh sách sản phẩm</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Product Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* Hero Image Section */}
              <div className="relative">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={blindboxDetails.bannerImage}
                    alt={blindboxDetails.displayName}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${blindboxDetails.themeColor} opacity-70`}
                  ></div>
                </div>

                {/* Overlay Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-8">
                  {/* Top Actions */}
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsLiked(!isLiked)}
                        className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
                          isLiked
                            ? "bg-red-500 text-white"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        <FaHeart className="text-lg" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
                      >
                        <FaShare className="text-lg" />
                      </motion.button>
                    </div>

                    {/* Limited Time Badge */}
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                    >
                      🔥 GIỚI HẠN THỜI GIAN
                    </motion.div>
                  </div>

                  {/* Bottom Content */}
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
                      {blindboxDetails.displayName}
                    </h1>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-white/90 mb-4">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span className="font-semibold">
                          {blindboxDetails.stats?.rating || 4.8}
                        </span>
                        <span className="text-sm ml-1">
                          ({blindboxDetails.stats?.reviews || 89} đánh giá)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaBoxOpen className="mr-1" />
                        <span className="font-semibold">
                          {blindboxDetails.stats?.sold || 127}
                        </span>
                        <span className="text-sm ml-1">đã bán</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-black text-white">
                        {formatPrice(blindboxDetails.price)}
                      </span>
                      {blindboxDetails.originalPrice && (
                        <span className="text-lg text-white/70 line-through">
                          {formatPrice(blindboxDetails.originalPrice)}
                        </span>
                      )}
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -33%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8">
                {/* Timer */}
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-6 rounded-2xl mb-8 text-center"
                >
                  <div className="flex items-center justify-center mb-2">
                    <FaClock className="mr-2 text-lg" />
                    <span className="font-semibold">Ưu đãi kết thúc sau:</span>
                  </div>
                  <div className="flex justify-center space-x-4 text-2xl font-bold">
                    <div className="bg-white/20 rounded-lg px-3 py-2">
                      {formatTime(timeLeft.hours)}
                      <div className="text-xs opacity-75">Giờ</div>
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-2">
                      {formatTime(timeLeft.minutes)}
                      <div className="text-xs opacity-75">Phút</div>
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-2">
                      {formatTime(timeLeft.seconds)}
                      <div className="text-xs opacity-75">Giây</div>
                    </div>
                  </div>
                </motion.div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <FaInfoCircle className="mr-3 text-purple-600" />
                    Mô tả sản phẩm
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {blindboxDetails.description}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FaShieldAlt className="mr-3 text-green-600" />
                    Điểm nổi bật
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {blindboxDetails.features?.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center bg-green-50 p-3 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Potential Items */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FaMagic className="mr-3 text-purple-600" />
                    Có thể nhận được
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({potentialItems.length} sản phẩm)
                    </span>
                  </h3>

                  {isLoadingBoxData && potentialItems.length === 0 && (
                    <div className="text-center py-8">
                      <FaSpinner className="animate-spin text-3xl text-purple-600 mb-4 mx-auto" />
                      <p className="text-gray-600">Đang tải sản phẩm...</p>
                    </div>
                  )}

                  {!isLoadingBoxData &&
                    error &&
                    potentialItems.length === 0 && (
                      <div className="text-center py-8 bg-red-50 rounded-lg">
                        <p className="text-red-600">{error}</p>
                      </div>
                    )}

                  {!isLoadingBoxData &&
                    !error &&
                    potentialItems.length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <FaBoxOpen className="text-4xl text-gray-400 mb-4 mx-auto" />
                        <p className="text-gray-600">
                          Chưa có thông tin sản phẩm
                        </p>
                      </div>
                    )}

                  {potentialItems.length > 0 && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <AnimatePresence>
                          {displayedItems.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                            >
                              <div className="aspect-square overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <div className="p-3">
                                <h4
                                  className="font-medium text-gray-900 truncate mb-1"
                                  title={item.name}
                                >
                                  {item.name}
                                </h4>
                                <p className="text-purple-600 font-bold">
                                  {formatPrice(item.priceVND || item.price)}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {potentialItems.length > 6 && (
                        <div className="text-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAllItems(!showAllItems)}
                            className="bg-purple-100 text-purple-700 px-6 py-3 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                          >
                            {showAllItems ? (
                              <>
                                Ẩn bớt <FaEye className="ml-2 inline" />
                              </>
                            ) : (
                              <>
                                Xem tất cả ({potentialItems.length - 6} sản phẩm
                                khác) <FaEye className="ml-2 inline" />
                              </>
                            )}
                          </motion.button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Purchase & Shipping Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8 flex flex-col justify-between"
          >
            {/* Purchase Summary */}
            <div>
              <h2 className="text-2xl font-bold text-purple-700 mb-6 flex items-center">
                <FaShoppingCart className="mr-3" />
                Đặt mua Blindbox
              </h2>

              {/* Shipping Form */}
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isProcessingPurchase) handlePurchaseBlindbox();
                }}
              >
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      <FaUser className="inline mr-2 text-purple-500" />
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingForm.fullName}
                      onChange={handleShippingInputChange}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      <FaPhone className="inline mr-2 text-purple-500" />
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingForm.phone}
                      onChange={handleShippingInputChange}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      <FaMapMarkerAlt className="inline mr-2 text-purple-500" />
                      Địa chỉ giao hàng
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingForm.address}
                      onChange={handleShippingInputChange}
                      className="w-full border rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Số nhà, tên đường..."
                      required
                    />
                    <input
                      type="text"
                      name="addressDetail"
                      value={shippingForm.addressDetail}
                      onChange={handleShippingInputChange}
                      className="w-full border rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Chi tiết khác (nếu có)"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        name="ward"
                        value={shippingForm.ward}
                        onChange={handleShippingInputChange}
                        className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Phường/Xã"
                        required
                      />
                      <input
                        type="text"
                        name="district"
                        value={shippingForm.district}
                        onChange={handleShippingInputChange}
                        className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Quận/Huyện"
                        required
                      />
                      <input
                        type="text"
                        name="city"
                        value={shippingForm.city}
                        onChange={handleShippingInputChange}
                        className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Tỉnh/Thành phố"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-1">
                    <FaTruck className="inline mr-2 text-purple-500" />
                    Phương thức vận chuyển
                  </label>
                  {isLoadingShipping ? (
                    <div className="flex items-center space-x-2 text-purple-600">
                      <FaSpinner className="animate-spin" />
                      <span>Đang tải phương thức vận chuyển...</span>
                    </div>
                  ) : (
                    <select
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      value={selectedShippingMethodId || ""}
                      onChange={(e) =>
                        setSelectedShippingMethodId(e.target.value)
                      }
                      required
                    >
                      {availableShippingMethods.map((method) => (
                        <option
                          key={method.shippingMethodId || method.id}
                          value={method.shippingMethodId || method.id}
                        >
                          {method.name} - {formatPrice(method.fee)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Payment Method (fixed) */}
                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-1">
                    <FaCreditCard className="inline mr-2 text-purple-500" />
                    Phương thức thanh toán
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked
                      readOnly
                      className="accent-purple-600"
                    />
                    <span>Thanh toán online qua PayOS</span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mt-6 bg-purple-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Giá Blindbox</span>
                    <span className="font-bold text-purple-700">
                      {formatPrice(blindboxDetails.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Phí vận chuyển</span>
                    <span className="font-bold text-purple-700">
                      {formatPrice(currentShippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2 mt-2">
                    <span className="text-lg font-bold text-gray-900">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-black text-purple-900">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Purchase Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isProcessingPurchase}
                  className={`w-full mt-6 py-3 rounded-xl font-bold text-lg flex items-center justify-center transition-colors
      ${
        isProcessingPurchase
          ? "bg-purple-300 text-white cursor-not-allowed"
          : "bg-purple-600 hover:bg-purple-700 text-white"
      }`}
                >
                  {isProcessingPurchase ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaGift className="mr-2" />
                      Mua ngay
                    </>
                  )}
                </motion.button>
              </form>
            </div>

            {/* Security Note */}
            <div className="mt-8 text-xs text-gray-500 flex items-center">
              <FaShieldAlt className="mr-2 text-green-500" />
              Thanh toán an toàn qua PayOS. Đảm bảo hoàn tiền nếu không nhận
              được hàng.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}