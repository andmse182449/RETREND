import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  FaTags,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion"; // motion for animations
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useCart } from "../../context/CartContext";
import PaymentMethodModal from "../../components/PaymentMethodModal";
// VoucherModal import might be removed if "Xem tất cả" button is removed from this page
// import VoucherModal from "../../components/VoucherModal";
import voucherApiService from "../../services/VoucherApiService";
import shippingApiService from "../../services/ShippingApiService";

const getLoggedInUserInfo = () => {
  const token = localStorage.getItem("authToken");
  const userString = localStorage.getItem("user");
  if (token && userString) {
    try {
      const userData = JSON.parse(userString);
      return {
        userId: userData.userId || userData.id || null,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
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
      console.error(
        "CheckoutPage: Error parsing user data from localStorage:",
        e
      );
      return {
        userId: null,
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
      };
    }
  }
  return null;
};

const ORDER_CREATE_API_URL = "http://localhost:8080/v1.0/orders/create";

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
  const [availableShippingMethods, setAvailableShippingMethods] = useState([]);
  const [selectedShippingMethodId, setSelectedShippingMethodId] =
    useState(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(true);
  const [shippingError, setShippingError] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethodDisplay, setSelectedPaymentMethodDisplay] =
    useState("online_payos");
  const [availableApiVouchers, setAvailableApiVouchers] = useState([]);
  // const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false); // Not needed if list is inline
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [calculatedDiscount, setCalculatedDiscount] = useState(0);
  // Add state for collapsible sections
  const [shippingCollapsed, setShippingCollapsed] = useState(false);
  const [paymentCollapsed, setPaymentCollapsed] = useState(false);
  const [voucherCollapsed, setVoucherCollapsed] = useState(false);

  useEffect(() => {
    /* ... Effect to initialize items, user form, passed voucher (keep as is) ... */
    const selectedItemsFromContext = getSelectedCartItems();
    const initialItems =
      location.state?.itemsToCheckout || selectedItemsFromContext || [];
    if (initialItems.length === 0 && !isSubmittingOrder) {
      toast.info(
        "Giỏ hàng trống hoặc không có sản phẩm nào được chọn. Đang chuyển về giỏ hàng..."
      );
      navigate("/cart", { replace: true });
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
      setVoucherCodeInput(location.state.appliedVoucher.code || "");
    }
  }, [getSelectedCartItems, location.state, navigate, isSubmittingOrder]);

  useEffect(() => {
    /* ... Effect to Fetch Shipping Methods (keep as is) ... */
    const fetchShippingOptions = async () => {
      setIsLoadingShipping(true);
      setShippingError(null);
      try {
        const methods = await shippingApiService.getAllShippingMethods();
        setAvailableShippingMethods(methods || []);
        if (methods && methods.length > 0) {
          const defaultMethod =
            methods.find((m) => parseFloat(m.fee) === 0) ||
            methods.find((m) => m.name?.toLowerCase().includes("tiêu chuẩn")) ||
            methods[0];
          if (defaultMethod)
            setSelectedShippingMethodId(
              String(defaultMethod.shippingMethodId || defaultMethod.id)
            );
        }
      } catch (err) {
        setShippingError(err.message || "Không thể tải PTVC.");
        setAvailableShippingMethods([]);
      } finally {
        setIsLoadingShipping(false);
      }
    };
    fetchShippingOptions();
  }, []);

  useEffect(() => {
    /* ... Effect to Fetch Vouchers (keep as is) ... */
    const fetchVouchers = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setAvailableApiVouchers([]);
        return;
      }
      setIsLoadingVouchers(true);
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
        toast.error("Lỗi tải danh sách voucher.");
      } finally {
        setIsLoadingVouchers(false);
      }
    };
    fetchVouchers();
  }, [formatPrice]);

  const currentSubtotal = useMemo(
    () =>
      itemsToCheckout.reduce(
        (sum, item) =>
          sum + (parseFloat(item.price) || 0) * (item.quantity || 1),
        0
      ),
    [itemsToCheckout]
  );
  useEffect(() => {
    /* Effect to recalculate discount (keep as is) */
    if (!appliedVoucher || currentSubtotal < appliedVoucher.minAmount) {
      setCalculatedDiscount(0);
      return;
    }
    let discount = 0;
    const type = appliedVoucher.discountType || appliedVoucher.type;
    const value = appliedVoucher.discountValue;
    if (type === "fixed") discount = value;
    else if (type === "percentage") discount = currentSubtotal * (value / 100);
    setCalculatedDiscount(Math.min(discount, currentSubtotal));
  }, [appliedVoucher, currentSubtotal]);

  // src/pages/CheckoutPage.js

  // ... (other state and useEffects) ...

  const currentShippingCost = useMemo(() => {
    console.log("CALCULATING currentShippingCost...");
    console.log("  Applied Voucher:", appliedVoucher);
    console.log("  Selected Shipping Method ID:", selectedShippingMethodId);
    console.log(
      "  Available Shipping Methods:",
      JSON.stringify(availableShippingMethods)
    );
    console.log("  Current Subtotal (items):", currentSubtotal);
    console.log("  Calculated Discount:", calculatedDiscount);

    if (
      appliedVoucher?.discountType === "shipping" ||
      appliedVoucher?.type === "shipping"
    ) {
      console.log("  --> Free shipping due to voucher.");
      return 0;
    }

    let determinedBaseFee = 30000; // Default shipping fee if no specific method applies or is found

    if (selectedShippingMethodId && availableShippingMethods.length > 0) {
      const selectedMethod = availableShippingMethods.find(
        (method) =>
          String(method.shippingMethodId || method.id) ===
          String(selectedShippingMethodId)
      );

      console.log("  Found selectedMethod:", selectedMethod);

      if (selectedMethod && typeof selectedMethod.fee !== "undefined") {
        const parsedFee = parseFloat(selectedMethod.fee);
        if (!isNaN(parsedFee)) {
          determinedBaseFee = parsedFee;
          console.log(
            `  --> Using fee from selected method '${selectedMethod.name}': ${determinedBaseFee}`
          );
        } else {
          console.warn(
            `  Warning: Fee for selected method '${selectedMethod.name}' is not a valid number: '${selectedMethod.fee}'. Using default ${determinedBaseFee}.`
          );
          // determinedBaseFee remains default 30000
        }
      } else if (selectedMethod) {
        console.warn(
          `  Warning: Selected method '${selectedMethod.name}' has no 'fee' property. Using default ${determinedBaseFee}.`
        );
        // determinedBaseFee remains default 30000
      } else {
        console.log(
          "  No specific shipping method selected or found by ID, but methods are available. Consider default."
        );
        // If no specific method is selected yet, but methods are available,
        // you might default to the first one's fee or a standard fee.
        // For now, if ID doesn't match, it will use the initial determinedBaseFee (30000).
      }
    } else if (availableShippingMethods.length === 0 && !isLoadingShipping) {
      console.log(
        "  No shipping methods available. Setting shipping cost to 0."
      );
      determinedBaseFee = 0; // Or handle as an error / prevent checkout
    } else if (
      !selectedShippingMethodId &&
      availableShippingMethods.length > 0
    ) {
      console.log("  No shipping method ID selected yet. Using default fee.");
      // determinedBaseFee remains 30000
    }

    const subtotalAfterItemDiscount = currentSubtotal - calculatedDiscount;
    if (subtotalAfterItemDiscount >= 600000) {
      // Free shipping threshold based on items' value
      console.log(
        `  --> Free shipping due to subtotal threshold (${subtotalAfterItemDiscount} >= 600000).`
      );
      return 0;
    }

    console.log("  --> Final determined shipping cost:", determinedBaseFee);
    return determinedBaseFee;
  }, [
    appliedVoucher,
    selectedShippingMethodId,
    availableShippingMethods,
    currentSubtotal,
    calculatedDiscount,
    isLoadingShipping,
  ]);

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
  // const openVoucherModal = () => setIsVoucherModalOpen(true); // No longer needed for inline list
  // const closeVoucherModal = () => setIsVoucherModalOpen(false); // No longer needed

  // --- Voucher Handlers ---
  const handleSelectAndApplyVoucher = (voucherToApply) => {
    if (currentSubtotal < voucherToApply.minAmount) {
      toast.warn(
        `Voucher "${
          voucherToApply.name
        }" yêu cầu đơn hàng tối thiểu ${formatPrice(voucherToApply.minAmount)}.`
      );
      return;
    }
    setAppliedVoucher(voucherToApply);
    setVoucherCodeInput(voucherToApply.code);
    setError(null); // Clear general form errors when voucher is successfully applied
    toast.success(`Đã áp dụng voucher: ${voucherToApply.name}`);
  };

  const handleApplyVoucherFromInput = () => {
    if (!voucherCodeInput.trim()) {
      handleRemoveAppliedVoucher(); // Clear if input is empty and apply is clicked
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
    // Reuse the selection logic
    handleSelectAndApplyVoucher(voucher);
  };

  const handleRemoveAppliedVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput("");
    toast.info("Đã hủy áp dụng voucher.");
  };
  // --- End Voucher Handlers ---

  const handleSubmitOrder = async (e) => {
    /* ... (keep your existing submit logic) ... */
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
        toast.error(`Vui lòng điền: ${field}.`);
        document.getElementsByName(field)[0]?.focus();
        return;
      }
    }
    if (!selectedShippingMethodId) {
      toast.error("Vui lòng chọn phương thức vận chuyển.");
      return;
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
      toast.error("Lỗi xác thực người dùng. Vui lòng đăng nhập lại.");
      setIsSubmittingOrder(false);
      return;
    }
    const orderPayload = {
      createOrderRequest: {
        userId: String(currentUser.userId),
        shippingId: parseInt(selectedShippingMethodId, 10),
        shippingAddress:
          `${shippingForm.address}, ${shippingForm.ward}, ${shippingForm.district}, ${shippingForm.city}`.trim(),
        methodPayment: selectedPaymentMethodDisplay,
        voucherId: appliedVoucher ? parseInt(appliedVoucher.id, 10) : 0,
        subtotal: currentSubtotal,
      },
      orderItemsRequest: {
        productIds: itemsToCheckout.map((item) => parseInt(item.id, 10)),
      },
    };
    console.log(
      "Submitting Order Payload to API:",
      JSON.stringify(orderPayload, null, 2)
    );
    try {
      const response = await fetch(ORDER_CREATE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderPayload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        console.error("API order creation failed:", result);
        throw new Error(
          result.messages ||
            result.message ||
            `Lỗi từ máy chủ: ${response.statusText} (${response.status})`
        );
      }
      toast.success(
        result.messages || "Đơn hàng đã được tạo! Đang chuyển hướng..."
      );
      if (result.checkoutUrl) {
        if (typeof clearCart === "function") {
          clearCart();
        } else {
          localStorage.removeItem("cartItems");
        }
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error("Không nhận được URL thanh toán PayOS từ API.");
      }
    } catch (err) {
      console.error("Error submitting order:", err);
      setError(`Đặt hàng thất bại: ${err.message}`);
      toast.error(`Lỗi đặt hàng: ${err.message || "Vui lòng thử lại."}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (itemsToCheckout.length === 0 && !isSubmittingOrder) {
    /* ... Empty cart redirect JSX ... */
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="flex items-center justify-center mb-8">
        <div className="bg-gradient-to-r text-black px-8 py-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
            Thanh toán đơn hàng
          </h1>
        </div>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              1
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700">
              Giỏ hàng
            </span>
          </div>
          <div className="w-24 h-1 bg-blue-600 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              2
            </div>
            <span className="mt-2 text-sm font-medium text-blue-600 font-semibold">
              Thanh toán
            </span>
          </div>
          <div className="w-24 h-1 bg-gray-300 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold">
              3
            </div>
            <span className="mt-2 text-sm font-medium text-gray-500">
              Hoàn tất
            </span>
          </div>
        </div>
      </div>

      {/* INPUT CUS INFO */}
      <form onSubmit={handleSubmitOrder} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10">
          {/* Column 1 & 2: Shipping, Payment, Voucher */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information Form - (JSX from previous full code, ensure input names match shippingForm state) */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div
                className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer"
                onClick={() => setShippingCollapsed(!shippingCollapsed)}
              >
                <div className="flex items-center">
                  <div className="bg-blue-600 p-2 rounded-lg mr-3">
                    <FaUser className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Thông tin giao hàng
                  </h3>
                </div>
                {shippingCollapsed ? <FaChevronDown /> : <FaChevronUp />}
              </div>

              <AnimatePresence>
                {!shippingCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-5"
                  >
                    {getLoggedInUserInfo() && shippingForm.firstName && (
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
                          value={orderNote}
                          onChange={(e) => setOrderNote(e.target.value)}
                          className="checkout-input"
                          rows="3"
                          placeholder="Ghi chú thêm cho người bán (Không bắt buộc)"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shipping and Payment Methods - (JSX from previous full code) */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div
                className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer"
                onClick={() => setPaymentCollapsed(!paymentCollapsed)}
              >
                <div className="flex items-center">
                  <div className="bg-blue-600 p-2 rounded-lg mr-3">
                    <FaBoxOpen className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Vận chuyển & Thanh toán
                  </h3>
                </div>
                {paymentCollapsed ? <FaChevronDown /> : <FaChevronUp />}
              </div>

              <AnimatePresence>
                {!paymentCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-5"
                  >
                    <div className="space-y-6">
                      <div>
                        {" "}
                        {/* Shipping Methods */}
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">
                          Phương thức vận chuyển{" "}
                          <span className="text-red-500">*</span>
                        </h4>
                        {isLoadingShipping && (
                          <div className="flex items-center text-xs text-gray-500 py-2">
                            <FaSpinner className="animate-spin mr-2" /> Đang tải
                            PTVC...
                          </div>
                        )}
                        {shippingError && (
                          <p className="text-xs text-red-500 py-2 bg-red-50 p-2 rounded-md">
                            {shippingError}
                          </p>
                        )}
                        {!isLoadingShipping &&
                          !shippingError &&
                          availableShippingMethods.length === 0 && (
                            <p className="text-xs text-gray-500 py-2 bg-yellow-50 p-2 rounded-md">
                              Hiện chưa có phương thức vận chuyển nào.
                            </p>
                          )}
                        <div className="space-y-2">
                          {availableShippingMethods.map((method) => (
                            <label
                              key={method.shippingMethodId || method.id}
                              className={`flex items-center p-3 border rounded-lg hover:border-blue-600 cursor-pointer transition-all ${
                                String(method.shippingMethodId || method.id) ===
                                String(selectedShippingMethodId)
                                  ? "bg-blue-50 border-blue-600 ring-2 ring-blue-500"
                                  : "border-gray-200"
                              }`}
                            >
                              <input
                                type="radio"
                                name="shippingMethodRadio"
                                value={String(
                                  method.shippingMethodId || method.id
                                )}
                                checked={
                                  String(
                                    method.shippingMethodId || method.id
                                  ) === String(selectedShippingMethodId)
                                }
                                onChange={() =>
                                  setSelectedShippingMethodId(
                                    String(method.shippingMethodId || method.id)
                                  )
                                }
                                className="form-radio h-4 w-4 text-blue-600 mr-3 focus:ring-offset-0 focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="text-sm flex-grow font-medium text-gray-800">
                                {method.name}
                              </span>
                              <span className="text-sm font-semibold text-gray-700">
                                {formatPrice(method.fee)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        {" "}
                        {/* Payment Method */}
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">
                          Phương thức thanh toán
                        </h4>
                        <div className="p-3 border rounded-lg bg-gray-50 border-gray-200">
                          {" "}
                          {/* Default selected or display current */}
                          <label className="flex items-center cursor-default">
                            <input
                              type="radio"
                              name="paymentMethodRadioDisplay"
                              value="online_payos"
                              checked={
                                selectedPaymentMethodDisplay === "online_payos"
                              }
                              readOnly
                              className="form-radio h-4 w-4 text-blue-600 mr-3 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              Thanh toán trực tuyến qua PayOS
                            </span>
                          </label>
                        </div>
                        {/* If you add other payment methods, use openPaymentModal */}
                        {/* <button type="button" onClick={openPaymentModal} className="text-xs font-medium text-blue-600 hover:underline mt-1.5">Thay đổi phương thức</button> */}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- NEW VOUCHER SECTION UI --- */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div
                className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer"
                onClick={() => setVoucherCollapsed(!voucherCollapsed)}
              >
                <div className="flex items-center">
                  <div className="bg-blue-600 p-2 rounded-lg mr-3">
                    <FaTags className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Mã giảm giá
                  </h3>
                </div>
                {voucherCollapsed ? <FaChevronDown /> : <FaChevronUp />}
              </div>

              <AnimatePresence>
                {!voucherCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-5"
                  >
                    {/* Manual Voucher Input (Optional, can be removed if only list selection is desired) */}
                    <div className="flex gap-2 mb-4 items-end">
                      <div className="flex-grow">
                        <label
                          htmlFor="voucherCodeInputCheckoutPage"
                          className="block text-xs font-medium text-gray-600 mb-1"
                        >
                          Nhập mã voucher
                        </label>
                        <input
                          type="text"
                          id="voucherCodeInputCheckoutPage"
                          placeholder="Nhập mã tại đây"
                          value={voucherCodeInput}
                          onChange={(e) =>
                            setVoucherCodeInput(e.target.value.toUpperCase())
                          }
                          className={`checkout-input ${
                            error &&
                            (error.toLowerCase().includes("voucher") ||
                              error.toLowerCase().includes("mã"))
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-blue-500"
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyVoucherFromInput}
                        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors flex-shrink-0 h-[38px]"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {error &&
                      (error.toLowerCase().includes("voucher") ||
                        error.toLowerCase().includes("mã")) && (
                        <p className="text-red-500 text-xs mb-3 -mt-2">
                          {error}
                        </p>
                      )}
                    {/* Display Applied Voucher Info */}
                    {appliedVoucher && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-400 rounded-md text-sm shadow-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-green-700">
                              {appliedVoucher.name}
                            </p>
                            <p className="text-xs text-green-600">
                              Đã áp dụng: -{formatPrice(calculatedDiscount)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveAppliedVoucher}
                            className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                    {/* List of Available Vouchers */}
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 pt-3 border-t border-gray-200">
                      Hoặc chọn từ voucher hiện có:
                    </h4>
                    {isLoadingVouchers && (
                      <div className="flex items-center text-xs text-gray-500 py-2">
                        <FaSpinner className="animate-spin mr-2" /> Đang tải
                        danh sách voucher...
                      </div>
                    )}
                    {!isLoadingVouchers &&
                      !error &&
                      availableApiVouchers.length === 0 && (
                        <p className="text-xs text-gray-500 py-2 italic bg-gray-50 p-2 rounded-md">
                          Bạn không có voucher nào khả dụng.
                        </p>
                      )}
                    {/* Display specific voucher fetch error if any */}
                    {!isLoadingVouchers &&
                      error &&
                      error.includes("voucher") && ( // Be more specific if error state is used for other things
                        <p className="text-xs text-red-500 py-2 bg-red-50 p-2 rounded-md">
                          {error}
                        </p>
                      )}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar-thin border-t border-gray-100 pt-2">
                      {availableApiVouchers.map((voucher) => {
                        const isCurrentlyApplied =
                          appliedVoucher?.id === voucher.id;
                        const canApply = currentSubtotal >= voucher.minAmount;
                        return (
                          <div
                            key={voucher.id}
                            className={`border rounded-md p-2.5 transition-all ${
                              isCurrentlyApplied
                                ? "border-green-500 bg-green-50 ring-2 ring-green-200 shadow-md"
                                : canApply
                                ? "border-gray-300 bg-white hover:border-blue-500 hover:shadow-sm cursor-pointer"
                                : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                            }`}
                            onClick={() =>
                              canApply &&
                              !isCurrentlyApplied &&
                              handleSelectAndApplyVoucher(voucher)
                            }
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex-1 mr-2">
                                <p
                                  className={`font-semibold text-xs truncate ${
                                    isCurrentlyApplied
                                      ? "text-green-700"
                                      : "text-gray-800"
                                  }`}
                                  title={voucher.name}
                                >
                                  {voucher.name}
                                </p>
                                <p
                                  className="text-xs text-gray-500 truncate"
                                  title={voucher.description}
                                >
                                  {voucher.description}
                                </p>
                                {voucher.expiryDate && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    HSD:{" "}
                                    {new Date(
                                      voucher.expiryDate
                                    ).toLocaleDateString("vi-VN")}
                                  </p>
                                )}
                              </div>
                              {isCurrentlyApplied ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveAppliedVoucher();
                                  }}
                                  className="bg-slate-600 text-white text-[10px] px-2.5 py-1 rounded-md hover:bg-slate-500 shrink-0 font-medium"
                                >
                                  {" "}
                                  HỦY{" "}
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectAndApplyVoucher(voucher);
                                  }}
                                  disabled={!canApply}
                                  className={`text-white text-[10px] px-2.5 py-1 rounded-md shrink-0 font-medium ${
                                    !canApply
                                      ? "bg-gray-300 cursor-not-allowed"
                                      : "bg-blue-600 hover:bg-blue-700"
                                  }`}
                                >
                                  {" "}
                                  ÁP DỤNG{" "}
                                </button>
                              )}
                            </div>
                            {!canApply && !isCurrentlyApplied && (
                              <p className="text-xs text-red-400 mt-1 text-right">
                                Cần thêm{" "}
                                {formatPrice(
                                  voucher.minAmount - currentSubtotal
                                )}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>{" "}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* --- END NEW VOUCHER SECTION UI --- */}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 sticky top-8">
              <div className="bg-gradient-to-r p-3 from-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-black">
                  Tóm tắt đơn hàng
                </h3>
              </div>

              <div className="p-5">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4 custom-scrollbar-thin">
                  {itemsToCheckout.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 items-center text-sm py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="relative">
                        <img
                          src={item.image || "https://via.placeholder.com/64"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0 shadow-md border border-gray-200"
                        />
                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                          {item.quantity || 1}
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-semibold text-gray-800 leading-tight truncate">
                          {item.name}
                        </h4>
                        <p className="text-gray-500 text-sm">Size: M</p>
                      </div>
                      <div className="font-semibold text-gray-800 flex-shrink-0">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">
                      {formatPrice(currentSubtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-600 flex items-center">
                      Phí vận chuyển
                      <span className="ml-1 text-blue-600 cursor-pointer group relative">
                        <FaInfoCircle size={12} />
                        <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 -left-24 -top-24 z-10">
                          Phí vận chuyển có thể thay đổi tùy vào địa chỉ giao
                          hàng
                        </span>
                      </span>
                    </span>
                    <span className="font-medium">
                      {isLoadingShipping ? (
                        <FaSpinner className="animate-spin inline text-xs" />
                      ) : currentShippingCost === 0 ? (
                        <span className="text-green-600 font-bold">
                          Miễn phí
                        </span>
                      ) : (
                        formatPrice(currentShippingCost)
                      )}
                    </span>
                  </div>

                  {calculatedDiscount > 0 && (
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="text-green-600 font-bold">
                        -{formatPrice(calculatedDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-3 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">
                        Tổng cộng:
                      </span>
                      <span className="text-2xl font-bold text-red-600">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmittingOrder ||
                    itemsToCheckout.length === 0 ||
                    isLoadingShipping
                  }
                  className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-4 rounded-xl font-bold hover:opacity-90 transition-all mt-6 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50"
                >
                  {isSubmittingOrder ? (
                    <FaSpinner className="animate-spin inline mr-2 h-5 w-5" />
                  ) : null}
                  {isSubmittingOrder ? "ĐANG XỬ LÝ..." : "THANH TOÁN NGAY"}
                </button>

                <div className="mt-4 text-center text-sm text-gray-500">
                  Bằng việc Đặt hàng, bạn đồng ý với{" "}
                  <Link
                    to="/terms"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Điều khoản
                  </Link>{" "}
                  &{" "}
                  <Link
                    to="/policy"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Chính sách
                  </Link>{" "}
                  của Retrend.
                </div>
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
      </AnimatePresence>
      <style jsx global>{`
        .checkout-input {
          @apply w-full border border-gray-300 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all;
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
