// src/pages/CheckoutPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  FaTimes,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaShoppingCart as FaShoppingCartIcon,
  FaBoxOpen,
  FaSpinner,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useCart } from "../../context/CartContext"; // Adjust path
import PaymentMethodModal from "../../components/PaymentMethodModal"; // Adjust path
import VoucherModal from "../../components/VoucherModal"; // Adjust path
import voucherApiService from "../../services/VoucherApiService"; // Adjust path

// --- Helper to get Logged In User Info (Replace with your actual auth logic) ---
const getLoggedInUserInfo = () => {
  const token = localStorage.getItem("authToken");
  const userString = localStorage.getItem("user"); // Key used to store user object

  if (token && userString) {
    try {
      const userData = JSON.parse(userString);
      // Ensure the necessary fields exist in the stored userData
      return {
        userId: userData.userId || null, // CRITICAL for API
        phone: userData.phone || "",
        email: userData.email || "",
        // Assuming shippingAddress might also be part of the stored user object
        // If not, this part will be empty and user has to fill it
        shippingAddress: userData.shippingAddress || {
          city: "",
          district: "",
          ward: "",
          address: "",
          addressDetail: "",
        },
      };
    } catch (e) {
      console.error(
        "CheckoutPage: Error parsing user data from localStorage:",
        e
      );
      // Fallback if user data is corrupted but token exists
      return {
        userId: null,
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
      };
    }
  }

  return null; // No token or no user data found
};

const ORDER_CREATE_API_URL =
  "https://be-exe2-1.onrender.com/v1.0/orders/create";
export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { getSelectedCartItems, formatPrice, clearCart } = useCart();

  const [itemsToCheckout, setItemsToCheckout] = useState([]);
  const [orderNote, setOrderNote] = useState("");

  const [shippingForm, setShippingForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    ward: "",
    address: "",
    addressDetail: "",
  });
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState("standard");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethodDisplay, setSelectedPaymentMethodDisplay] =
    useState("online_payos");

  const [availableApiVouchers, setAvailableApiVouchers] = useState([]);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [calculatedDiscount, setCalculatedDiscount] = useState(0);

  const [error, setError] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);

  useEffect(() => {
    const selectedItemsFromContext = getSelectedCartItems();
    const initialItems =
      location.state?.itemsToCheckout || selectedItemsFromContext || [];

    if (initialItems.length === 0) {
      navigate("/cart");
      return;
    }
    setItemsToCheckout(initialItems.map((item) => ({ ...item, quantity: 1 })));
    setOrderNote(location.state?.orderNote || "");

    const currentUser = getLoggedInUserInfo();
    if (currentUser) {
      setShippingForm({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        phone: currentUser.phone || "",
        email: currentUser.email || "",
        city: currentUser.shippingAddress?.city || "",
        district: currentUser.shippingAddress?.district || "",
        ward: currentUser.shippingAddress?.ward || "",
        address: currentUser.shippingAddress?.address || "",
        addressDetail: currentUser.shippingAddress?.addressDetail || "",
      });
    }
    if (location.state?.appliedVoucher) {
      setAppliedVoucher(location.state.appliedVoucher);
      setVoucherCodeInput(location.state.appliedVoucher.code);
    }
  }, [getSelectedCartItems, location.state, navigate]);

  useEffect(() => {
    const fetchVouchers = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      setIsLoadingVouchers(true);
      setError(null);
      try {
        const fetched = await voucherApiService.getAvailableVouchers();
        const formatted = (fetched || []).map((v) => ({
          id: v.voucherId,
          code: v.code,
          name: v.name || `Voucher ${v.code}`,
          description:
            v.description ||
            (v.minOrderAmount > 0
              ? `Đơn hàng từ ${formatPrice(v.minOrderAmount)}`
              : "Mọi đơn hàng"),
          minAmount: v.minOrderAmount || 0,
          discountType:
            v.discountType || (v.discountAmount > 0 ? "fixed" : "shipping"),
          discountValue: v.discountAmount || 0,
          expiryDate: v.expiryDate,
        }));
        setAvailableApiVouchers(formatted);
      } catch (err) {
        console.error("CheckoutPage: Failed to fetch API vouchers:", err);
      } finally {
        setIsLoadingVouchers(false);
      }
    };
    fetchVouchers();
  }, [formatPrice]);

  const currentSubtotal = itemsToCheckout.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0),
    0
  );

  const calculateCurrentDiscount = useCallback(() => {
    if (!appliedVoucher || currentSubtotal < appliedVoucher.minAmount) return 0;
    let discount = 0;
    const type = appliedVoucher.discountType || appliedVoucher.type;
    const value = appliedVoucher.discountValue || appliedVoucher.discount;
    if (type === "fixed") discount = value;
    else if (type === "percentage") discount = currentSubtotal * (value / 100);
    return Math.min(discount, currentSubtotal);
  }, [appliedVoucher, currentSubtotal]);

  useEffect(() => {
    setCalculatedDiscount(calculateCurrentDiscount());
  }, [appliedVoucher, currentSubtotal, calculateCurrentDiscount]);

  const currentShippingCost = (() => {
    if (
      appliedVoucher?.discountType === "shipping" ||
      appliedVoucher?.type === "shipping"
    )
      return 0;
    const subtotalForShippingCalc = currentSubtotal - calculatedDiscount;
    if (subtotalForShippingCalc >= 600000) return 0;
    return selectedShippingMethod === "express" ? 30000 : 0;
  })();

  const finalTotal = Math.max(
    0,
    currentSubtotal - calculatedDiscount + currentShippingCost
  );

  const handleShippingInputChange = (e) =>
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  const openPaymentModal = () => setIsPaymentModalOpen(true);
  const closePaymentModal = () => setIsPaymentModalOpen(false);
  const handlePaymentMethodSelected = (method) => {
    setSelectedPaymentMethodDisplay(method);
    closePaymentModal();
  };
  const openVoucherModal = () => setIsVoucherModalOpen(true);
  const closeVoucherModal = () => setIsVoucherModalOpen(false);

  const handleVoucherSelectedFromModal = (voucherFromModal) => {
    if (currentSubtotal < voucherFromModal.minAmount) {
      toast.warn(
        `Voucher "${
          voucherFromModal.name
        }" yêu cầu đơn hàng tối thiểu ${formatPrice(
          voucherFromModal.minAmount
        )}.`
      );
      closeVoucherModal();
      return;
    }
    setAppliedVoucher(voucherFromModal);
    setVoucherCodeInput(voucherFromModal.code);
    setError(null);
    closeVoucherModal();
    toast.info(`Đã chọn voucher: ${voucherFromModal.name}`);
  };
  const handleApplyVoucherByInput = () => {
    if (!voucherCodeInput.trim()) {
      setAppliedVoucher(null);
      return;
    }
    const codeToApply = voucherCodeInput.toUpperCase().trim();
    const voucher = availableApiVouchers.find(
      (v) => v.code.toUpperCase() === codeToApply
    );
    if (!voucher) {
      setAppliedVoucher(null);
      toast.error(`Mã voucher "${codeToApply}" không hợp lệ.`);
      return;
    }
    if (currentSubtotal < voucher.minAmount) {
      setAppliedVoucher(null);
      toast.warn(
        `Đơn hàng chưa đủ ${formatPrice(
          voucher.minAmount
        )} để dùng mã "${codeToApply}".`
      );
      return;
    }
    setAppliedVoucher(voucher);
    setError(null);
    toast.success(`Đã áp dụng voucher: ${voucher.name}`);
  };
  const handleRemoveAppliedVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput("");
    setCalculatedDiscount(0);
    setError(null);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError(null);
    const requiredShippingFields = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "city",
      "district",
      "ward",
      "address",
    ];
    for (const field of requiredShippingFields) {
      if (!shippingForm[field]?.trim()) {
        toast.error(
          `Vui lòng điền: ${
            field === "firstName" ? "Tên" : field === "lastName" ? "Họ" : field
          }.`
        );
        document.getElementsByName(field)[0]?.focus();
        return;
      }
    }

    setIsSubmittingOrder(true);
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      toast.error("Bạn cần đăng nhập để đặt hàng.");
      setIsSubmittingOrder(false);
      navigate("/login");
      return;
    }

    const currentUser = getLoggedInUserInfo();
    if (!currentUser || !currentUser.userId) {
      toast.error("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
      setIsSubmittingOrder(false);
      return;
    }

    // --- Construct Payload for YOUR API /v1.0/orders/create ---
    const orderPayload = {
      createOrderRequest: {
        userId: currentUser.userId, // Actual logged-in user ID (must be string as per your API)
        shippingId: selectedShippingMethod === "express" ? 2 : 1, // Example mapping
        shippingAddress: `${shippingForm.address}, ${shippingForm.ward}, ${shippingForm.district}, ${shippingForm.city}`,
        methodPayment: "online", // For PayOS
        // voucherId: appliedVoucher ? parseInt(appliedVoucher.id, 10) : null, // Ensure ID is integer if API expects int
        voucherId: appliedVoucher ? appliedVoucher.id : null, // Assuming API handles null or expects integer
        subtotal: currentSubtotal,
      },
      orderItemsRequest: {
        // orderId: Your API specifies this. If backend generates it, client shouldn't send.
        //          If client must send a placeholder for linking, it needs careful thought.
        //          For now, assuming backend handles linking items to the new order.
        //          If your API *strictly* needs an int orderId here for create, that's unusual.
        //          Let's assume it's not needed or backend implies it for new order.
        // orderId: 0, // Placeholder if absolutely required, backend should ignore/replace
        productIds: itemsToCheckout.map((item) => parseInt(item.id, 10)), // Ensure product IDs are integers
      },
    };

    // If your API expects voucherId and productIds as integers explicitly:
    if (orderPayload.createOrderRequest.voucherId !== null) {
      orderPayload.createOrderRequest.voucherId = parseInt(
        orderPayload.createOrderRequest.voucherId,
        10
      );
    }
    // orderPayload.orderItemsRequest.orderId = parseInt(orderPayload.orderItemsRequest.orderId, 10); // if sending

    console.log(
      "Submitting Order Payload to API:",
      JSON.stringify(orderPayload, null, 2)
    );

    try {
      const response = await fetch(ORDER_CREATE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("API order creation failed:", result);
        throw new Error(
          result.messages || `Lỗi từ máy chủ: ${response.status}`
        );
      }

      console.log("API Order creation successful, server response:", result);
      toast.info("Đang chuyển hướng đến cổng thanh toán PayOS...");

      if (result.checkoutUrl) {
        if (typeof clearCart === "function") {
          clearCart(); // Clear cart from context
        } else {
          localStorage.removeItem("cartItems"); // Fallback
          console.warn(
            "CartContext does not have a clearCart function. Only localStorage was cleared."
          );
        }
        window.location.href = result.checkoutUrl; // Redirect to PayOS
      } else {
        throw new Error("Không nhận được URL thanh toán PayOS từ API.");
      }
    } catch (err) {
      console.error("Error submitting order:", err);
      setError(`Đặt hàng thất bại: ${err.message}`);
      toast.error(`Đặt hàng thất bại: ${err.message}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (itemsToCheckout.length === 0 && !isSubmittingOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <FaBoxOpen className="text-6xl text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Chưa có sản phẩm nào để thanh toán.
        </h2>
        <p className="text-gray-500 mb-6">
          Vui lòng chọn sản phẩm từ giỏ hàng của bạn.
        </p>
        <Link
          to="/cart"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Quay lại Giỏ hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
        Thanh toán
      </h1>
      <form onSubmit={handleSubmitOrder} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10">
          {/* Column 1 & 2: Shipping, Payment, Voucher */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information Form */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-5 border-b pb-3">
                Thông tin giao hàng
              </h3>
              {getLoggedInUserInfo() && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                  <p>
                    Sử dụng thông tin đã lưu của{" "}
                    <span className="font-semibold">
                      {shippingForm.firstName} {shippingForm.lastName}
                    </span>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setShippingForm({
                        firstName: "",
                        lastName: "",
                        phone: "",
                        email: "",
                        city: "",
                        district: "",
                        ward: "",
                        address: "",
                        addressDetail: "",
                      })
                    }
                    className="text-blue-600 hover:underline text-xs font-medium mt-1"
                  >
                    Nhập địa chỉ khác
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label
                    htmlFor="shippingFirstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shippingFirstName"
                    name="firstName"
                    type="text"
                    value={shippingForm.firstName}
                    onChange={handleShippingInputChange}
                    className="checkout-input"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="shippingLastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Họ <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shippingLastName"
                    name="lastName"
                    type="text"
                    value={shippingForm.lastName}
                    onChange={handleShippingInputChange}
                    className="checkout-input"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="shippingPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shippingPhone"
                    name="phone"
                    type="tel"
                    value={shippingForm.phone}
                    onChange={handleShippingInputChange}
                    className="checkout-input"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="shippingEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Địa chỉ Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shippingEmail"
                    name="email"
                    type="email"
                    value={shippingForm.email}
                    onChange={handleShippingInputChange}
                    className="checkout-input"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="shippingCity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shippingCity"
                    name="city"
                    type="text"
                    value={shippingForm.city}
                    onChange={handleShippingInputChange}
                    className="checkout-input"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="shippingDistrict"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shippingDistrict"
                    name="district"
                    type="text"
                    value={shippingForm.district}
                    onChange={handleShippingInputChange}
                    className="checkout-input"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="shippingWard"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shippingWard"
                    name="ward"
                    type="text"
                    value={shippingForm.ward}
                    onChange={handleShippingInputChange}
                    className="checkout-input"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="shippingAddress"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Địa chỉ cụ thể (Số nhà, tên đường){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shippingAddress"
                    name="address"
                    type="text"
                    value={shippingForm.address}
                    onChange={handleShippingInputChange}
                    className="checkout-input"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="shippingAddressDetail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Chi tiết địa chỉ (Tòa nhà, tầng...)
                  </label>
                  <textarea
                    id="shippingAddressDetail"
                    name="addressDetail"
                    value={shippingForm.addressDetail}
                    onChange={handleShippingInputChange}
                    className="checkout-input"
                    rows="2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="orderNoteCheckoutPage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ghi chú đơn hàng
                  </label>
                  <textarea
                    id="orderNoteCheckoutPage"
                    name="orderNoteFormTextArea"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="checkout-input"
                    rows="2"
                    placeholder="Ghi chú cho người bán..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-5 border-b pb-3">
                Vận chuyển & Thanh toán
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">
                    Phương thức vận chuyển
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg hover:border-blue-500 cursor-pointer transition-all">
                      <input
                        type="radio"
                        name="shippingMethodRadio"
                        value="standard"
                        checked={selectedShippingMethod === "standard"}
                        onChange={() => setSelectedShippingMethod("standard")}
                        className="form-radio h-4 w-4 text-blue-600 mr-3 focus:ring-blue-500"
                      />
                      <span className="text-sm">
                        Giao hàng tiêu chuẩn (Miễn phí)
                      </span>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg hover:border-blue-500 cursor-pointer transition-all">
                      <input
                        type="radio"
                        name="shippingMethodRadio"
                        value="express"
                        checked={selectedShippingMethod === "express"}
                        onChange={() => setSelectedShippingMethod("express")}
                        className="form-radio h-4 w-4 text-blue-600 mr-3 focus:ring-blue-500"
                      />
                      <span className="text-sm">
                        Giao hàng nhanh ({formatPrice(30000)})
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">
                    Phương thức thanh toán
                  </h4>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <label className="flex items-center cursor-default">
                      <input
                        type="radio"
                        name="paymentMethodRadio"
                        value="online_payos"
                        checked={true}
                        readOnly
                        className="form-radio h-4 w-4 text-blue-600 mr-3 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Thanh toán trực tuyến qua PayOS
                      </span>
                    </label>
                  </div>
                  {/* Add PaymentMethodModal trigger if you offer other methods like COD that don't go through this form's submit */}
                  {/* <button type="button" onClick={openPaymentModal} className="text-sm font-medium text-blue-600 hover:underline mt-2">Chọn phương thức khác</button> */}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Mã giảm giá
                </h3>
                {availableApiVouchers.length > 0 && (
                  <button
                    type="button"
                    onClick={openVoucherModal}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Chọn hoặc nhập mã
                  </button>
                )}
              </div>
              {appliedVoucher ? (
                <div className="p-3 bg-green-50 border border-green-300 rounded-md text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-green-700">
                        {appliedVoucher.name}
                      </p>
                      <p className="text-xs text-green-600">
                        Đã áp dụng: - {formatPrice(calculatedDiscount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAppliedVoucher}
                      className="text-xs font-medium text-red-500 hover:underline"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã voucher"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value)}
                    className={`checkout-input flex-grow ${
                      error &&
                      (error.toLowerCase().includes("voucher") ||
                        error.toLowerCase().includes("mã"))
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucherByInput}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors flex-shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>
              )}
              {error &&
                (error.toLowerCase().includes("voucher") ||
                  error.toLowerCase().includes("mã")) && (
                  <p className="text-red-500 text-xs mt-1.5">{error}</p>
                )}
              {isLoadingVouchers && (
                <p className="text-xs text-gray-500 mt-2">Đang tải...</p>
              )}
            </div>
          </div>

          {/* Column 3: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 sticky top-8 md:top-24">
              {" "}
              {/* Adjusted sticky top */}
              <h3 className="text-xl font-bold text-gray-900 pb-3 border-b border-gray-200">
                Tóm tắt đơn hàng
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 no-scrollbar mb-3 custom-scrollbar-thin">
                {itemsToCheckout.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 items-center text-sm py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <img
                      src={item.image || "https://via.placeholder.com/64"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md flex-shrink-0 shadow-sm"
                    />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-gray-800 leading-tight truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">SL: 1</p>
                    </div>
                    <div className="font-medium text-gray-700 flex-shrink-0">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 text-sm pt-3 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({itemsToCheckout.length} sp):</span>{" "}
                  <span>{formatPrice(currentSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>{" "}
                  <span className="font-medium">
                    {currentShippingCost === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatPrice(currentShippingCost)
                    )}
                  </span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Giảm giá Voucher:</span>{" "}
                    <span>-{formatPrice(calculatedDiscount)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t-2 border-gray-300 text-gray-900 font-bold">
                <span className="text-lg">Thành tiền:</span>
                <span className="text-2xl text-red-600">
                  {formatPrice(finalTotal)}
                </span>
              </div>
              <button
                type="submit"
                disabled={isSubmittingOrder || itemsToCheckout.length === 0}
                className="w-full bg-red-600 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-red-700 transition-colors mt-4 text-base disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              >
                {isSubmittingOrder ? (
                  <FaSpinner className="animate-spin inline mr-2" />
                ) : null}
                {isSubmittingOrder ? "ĐANG XỬ LÝ..." : "TIẾP TỤC THANH TOÁN"}
              </button>
              {error &&
                !(
                  error.toLowerCase().includes("voucher") ||
                  error.toLowerCase().includes("mã")
                ) && (
                  <p className="text-red-500 text-xs mt-2 text-center">
                    {error}
                  </p>
                )}
              <div className="mt-4 text-center text-xs text-gray-500">
                Bằng việc Đặt hàng, bạn đồng ý với{" "}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Điều khoản
                </Link>{" "}
                &{" "}
                <Link to="/policy" className="text-blue-600 hover:underline">
                  Chính sách
                </Link>{" "}
                của Retrend.
              </div>
            </div>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {isPaymentModalOpen && (
          <PaymentMethodModal
            isOpen={isPaymentModalOpen}
            onClose={closePaymentModal}
            onMethodSelected={handlePaymentMethodSelected}
            currentMethod={selectedPaymentMethodDisplay}
          />
        )}
        {isVoucherModalOpen && (
          <VoucherModal
            isOpen={isVoucherModalOpen}
            onClose={closeVoucherModal}
            vouchers={availableApiVouchers}
            onVoucherSelect={handleVoucherSelectedFromModal}
            appliedVoucherCode={appliedVoucher?.code}
          />
        )}
      </AnimatePresence>
      <style jsx global>{`
        .checkout-input {
          @apply w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500;
        }
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
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
