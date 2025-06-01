// src/pages/CartPage.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext"; // USE THE CONTEXT
import voucherApiService from "../../services/VoucherApiService"; // Adjust path
import { FaTrash } from "react-icons/fa";

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems, // FROM CONTEXT
    removeItem, // FROM CONTEXT
    // updateQuantity,  // We removed quantity updates from CartPage UI
    formatPrice, // FROM CONTEXT
    subtotal, // Subtotal of selected items FROM CONTEXT
    selectedItems, // Selected items object FROM CONTEXT
    toggleItemSelected, // FROM CONTEXT
    selectAllItems, // FROM CONTEXT
    deselectAllItems, // FROM CONTEXT
    selectedItemsCount, // Count of selected items FROM CONTEXT
    totalCartItemCount, // Total items in cart (for header display) FROM CONTEXT
  } = useCart();

  // Local state for this page only
  const [note, setNote] = useState("");
  const [apiVouchers, setApiVouchers] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [voucherError, setVoucherError] = useState(null);

  // No more local isLoadingCart or direct localStorage loading for cartItems

  // Fetch vouchers from API (this logic can remain)
  useEffect(() => {
    const fetchUserVouchers = async () => {
      // ... (your existing voucher fetching logic using voucherApiService - ensure formatPrice used here is the one from context)
      // Example modification if formatPrice from context is needed for voucher formatting:
      const token = localStorage.getItem("authToken");
      if (!token) {
        setApiVouchers([]);
        return;
      }
      setIsLoadingVouchers(true);
      setVoucherError(null);
      try {
        const fetchedVouchers = await voucherApiService.getAvailableVouchers();
        const formattedVouchers = (fetchedVouchers || []).map((v) => ({
          id: v.voucherId,
          code: v.code,
          name: v.name || `Giảm ${formatPrice(v.discountAmount || 0)}`, // Using context's formatPrice
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
        setApiVouchers(formattedVouchers);
      } catch (error) {
        setVoucherError(error.message || "Could not load vouchers.");
        setApiVouchers([]);
      } finally {
        setIsLoadingVouchers(false);
      }
    };
    fetchUserVouchers();
  }, [formatPrice]); // Add formatPrice if used in effect

  // --- Item selection, remove selected, apply voucher, calculations, checkout ---
  // These will now operate on `cartItems` and `selectedItems` from the context.

  const isAllSelected =
    cartItems.length > 0 &&
    cartItems.every(
      (item) => item && typeof item.id !== "undefined" && selectedItems[item.id]
    );

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      deselectAllItems(); // Context function
    } else {
      selectAllItems(); // Context function
    }
  };

  const removeSelectedItemsFromCart = () => {
    const selectedIds = Object.keys(selectedItems).filter(
      (id) => selectedItems[id]
    );
    if (selectedIds.length > 0) {
      selectedIds.forEach((id) => removeItem(id)); // Call context's removeItem for each
    }
    // selectedItems state in context will be updated by removeItem if needed,
    // or you could call deselectAllItems() here if appropriate after bulk removal.
  };

  const handleApplyVoucher = (voucher) => {
    const currentSubtotalOfSelected = subtotal; // Use subtotal from context
    if (currentSubtotalOfSelected < voucher.minAmount) {
      alert(
        `Voucher này yêu cầu đơn hàng tối thiểu ${formatPrice(
          voucher.minAmount
        )}. Đơn hàng đã chọn của bạn là ${formatPrice(
          currentSubtotalOfSelected
        )}.`
      );
      return;
    }
    setAppliedVoucher(voucher);
    // alert(`Đã áp dụng voucher: ${voucher.name}`); // Feedback can be more subtle
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
  };

  // Calculations for display, based on context's subtotal (of selected items)
  const calculateDiscountForDisplay = () => {
    if (!appliedVoucher) return 0;
    const subtotalForVoucher = subtotal; // Subtotal of selected items
    if (subtotalForVoucher < appliedVoucher.minAmount) return 0;

    let discount = 0;
    if (appliedVoucher.discountType === "fixed") {
      discount = appliedVoucher.discountValue;
    } else if (appliedVoucher.discountType === "percentage") {
      discount = (subtotalForVoucher * appliedVoucher.discountValue) / 100;
    }
    return Math.min(discount, subtotalForVoucher);
  };

  const calculateShippingForDisplay = () => {
    const subtotalAfterDiscount = subtotal - calculateDiscountForDisplay();
    const freeShippingThreshold = 600000;
    if (
      appliedVoucher?.discountType === "shipping" ||
      subtotalAfterDiscount >= freeShippingThreshold
    )
      return 0;
    return 30000;
  };

  const discountForDisplay = calculateDiscountForDisplay();
  const shippingForDisplay = calculateShippingForDisplay();
  const totalForDisplay = Math.max(
    0,
    subtotal + shippingForDisplay - discountForDisplay
  );

  const handleCheckout = () => {
    if (selectedItemsCount === 0) {
      // Use selectedItemsCount from context
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
    navigate("/checkout", {
      state: {
        // itemsToCheckout: getSelectedCartItems(), // No longer need to pass, CheckoutPage will use context
        orderNote: note,
        appliedVoucher: appliedVoucher,
        // Totals can also be recalculated on CheckoutPage or passed if preferred
        // finalTotal: totalForDisplay,
        // subtotalForCheckout: subtotal,
        // discountForCheckout: discountForDisplay,
        // shippingForCheckout: shippingForDisplay,
      },
    });
  };

  // --- Render Logic ---
  if (totalCartItemCount === 0) {
    // Use totalCartItemCount from context
    return (
      <div className="bg-gray-100 min-h-screen py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Giỏ hàng của bạn trống</h1>
        <Link
          to="/products"
          className="bg-red-500 text-white px-6 py-3 rounded-md inline-block hover:bg-red-600 transition"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  const currentSubtotalForDisplay = subtotal; // Use subtotal from context (already for selected items)
  const freeShippingThreshold = 600000;
  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - (currentSubtotalForDisplay - discountForDisplay)
  );

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center pb-4 border-b border-gray-300 mb-6">
          <h1 className="text-2xl font-semibold">Giỏ hàng của bạn</h1>
          <div className="text-sm text-gray-600">
            {totalCartItemCount} sản phẩm {/* Display total items in cart */}
            {selectedItemsCount > 0 && ` (Đã chọn: ${selectedItemsCount})`}
          </div>
        </div>

        {cartItems.length > 0 && ( // Check actual cartItems from context
          <div className="mb-6 flex justify-between items-center">
            <label
              htmlFor="select-all"
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                id="select-all"
                className="h-5 w-5 text-blue-600 border-gray-400 rounded focus:ring-blue-500"
                checked={isAllSelected} // isAllSelected calculated based on context state
                onChange={handleSelectAllToggle} // Uses context function
              />
              <span className="text-sm font-medium text-gray-700">
                Chọn tất cả ({cartItems.length})
              </span>
            </label>
            {selectedItemsCount > 0 && (
              <button
                onClick={removeSelectedItemsFromCart}
                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
              >
                <FaTrash className="mr-1" /> Xóa ({selectedItemsCount}) đã chọn
              </button>
            )}
          </div>
        )}

        <div className="mt-0 flex flex-col lg:flex-row gap-6">
          {/* Left Column - Cart Items */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => {
              if (!item || typeof item.id === "undefined") {
                // Guard against invalid items
                console.warn("CartPage: Rendering invalid item", item);
                return null;
              }
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm p-4"
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={!!selectedItems[item.id]} // Use selectedItems from context
                      onChange={() => toggleItemSelected(item.id)} // Use context function
                      className="mt-1 mr-4 h-5 w-5 text-blue-600 border-gray-400 rounded focus:ring-blue-500 shrink-0"
                      aria-labelledby={`item-name-${item.id}`}
                    />
                    <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden mr-4 shrink-0">
                      <img
                        src={
                          item.image ||
                          "https://via.placeholder.com/80x80?text=No+Image"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div className="mb-1 sm:mb-0">
                          <h3
                            id={`item-name-${item.id}`}
                            className="font-semibold text-gray-800"
                          >
                            {item.name}
                          </h3>
                          {item.variant && (
                            <p className="text-xs text-gray-500">
                              {item.variant}
                            </p>
                          )}
                        </div>
                        {/* PRICE DISPLAY */}
                        <p className="font-semibold text-gray-800 sm:text-right">
                          {typeof item.price === "number"
                            ? formatPrice(item.price)
                            : "N/A"}
                        </p>
                      </div>
                      <div className="mt-3 text-right">
                        <button
                          onClick={() => removeItem(item.id)} // Use context's removeItem
                          className="text-gray-500 hover:text-red-500 text-xs font-medium flex items-center ml-auto"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          {" "}
                          <FaTrash className="mr-1" /> Xóa{" "}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Note Section - remains local state */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
              <h3 className="font-semibold mb-3">Ghi chú đơn hàng</h3>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md resize-none min-h-[80px] text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập ghi chú..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-8">
              <h2 className="font-semibold text-lg mb-4 border-b pb-3">
                Thông tin đơn hàng
              </h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Tạm tính ({selectedItemsCount} sản phẩm):</span>{" "}
                  {/* Use selectedItemsCount from context */}
                  <span>{formatPrice(currentSubtotalForDisplay)}</span>{" "}
                  {/* Use subtotal from context (already for selected) */}
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Mã giảm giá ({appliedVoucher.code}):</span>
                    <span>-{formatPrice(discountForDisplay)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {shippingForDisplay === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatPrice(shippingForDisplay)
                    )}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-300 pt-3 mt-3">
                <div className="flex justify-between font-semibold text-base">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600 text-xl">
                    {formatPrice(totalForDisplay)}
                  </span>
                </div>
              </div>

              {shippingForDisplay > 0 &&
                remainingForFreeShipping > 0 &&
                !appliedVoucher?.discountType === "shipping" && (
                  <div className="mt-4 bg-yellow-100 border border-yellow-300 p-3 rounded-md text-xs text-yellow-800 text-center">
                    Mua thêm{" "}
                    <span className="font-semibold">
                      {formatPrice(remainingForFreeShipping)}
                    </span>{" "}
                    để được miễn phí vận chuyển!
                  </div>
                )}

              <button
                onClick={handleCheckout}
                disabled={selectedItemsCount === 0}
                className={`w-full font-semibold py-3 rounded-md mt-6 uppercase transition-colors text-white ${
                  selectedItemsCount === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                Thanh Toán ({selectedItemsCount})
              </button>

              {/* Voucher List - remains local state for display */}
              <div className="mt-6">
                {/* ... (Voucher display logic using apiVouchers, handleApplyVoucher, handleRemoveVoucher - can remain largely the same) ... */}
                <h3 className="font-semibold mb-3 uppercase text-sm tracking-wide">
                  Mã ưu đãi
                </h3>
                {isLoadingVouchers && (
                  <p className="text-xs text-gray-500">Đang tải mã...</p>
                )}
                {voucherError && (
                  <p className="text-xs text-red-500">Lỗi: {voucherError}</p>
                )}
                {!isLoadingVouchers &&
                  !voucherError &&
                  apiVouchers.length === 0 && (
                    <p className="text-xs text-gray-500 italic">
                      Không có mã ưu đãi nào.
                    </p>
                  )}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                  {apiVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className={`border rounded-md p-2.5 transition-all cursor-pointer ${
                        appliedVoucher?.id === voucher.id
                          ? "border-green-500 bg-green-50 ring-2 ring-green-300"
                          : "border-gray-300 bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 mr-2">
                          <div className="font-semibold text-xs text-gray-800 truncate">
                            {voucher.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {voucher.description}
                          </div>
                          {voucher.expiryDate && (
                            <div className="text-xs text-gray-400">
                              HSD:{" "}
                              {new Date(voucher.expiryDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          )}
                        </div>
                        {appliedVoucher?.id === voucher.id ? (
                          <button
                            onClick={handleRemoveVoucher}
                            className="bg-gray-700 text-white text-xs px-3 py-1.5 rounded hover:bg-gray-600 shrink-0"
                          >
                            HỦY
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApplyVoucher(voucher)}
                            disabled={subtotal < voucher.minAmount}
                            className={`text-white text-xs px-3 py-1.5 rounded shrink-0 ${
                              subtotal < voucher.minAmount
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            DÙNG
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
