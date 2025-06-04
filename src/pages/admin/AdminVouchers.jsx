// src/pages/AdminVouchers.js
import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import {
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaClipboard,
  FaTag,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
// --- API Service Import ---
import voucherApiService from "../../services/VoucherApiService"; // Adjust path

// Helper to format date for display
const formatDate = (dateString) => {
  if (!dateString) return "Không có"; // 'No expiry'
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    return dateString; // Fallback if already formatted or unparseable
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return "Ngày không hợp lệ";
  }
};

// Helper to display discount value based on type
const displayDiscount = (voucher) => {
  if (!voucher || typeof voucher.discountAmount === "undefined") return "N/A";
  const type = voucher.discountType || voucher.type; // Handle both possible prop names
  const amount = voucher.discountAmount;

  if (type === "fixed") {
    return `${amount.toLocaleString()}₫`;
  }
  if (type === "percentage") {
    return `${amount}%`; // Assuming discountAmount is already the percentage value (e.g., 10 for 10%)
  }
  if (type === "shipping") {
    return amount === 0 || amount === "free_shipping"
      ? "Miễn phí vận chuyển"
      : `${amount.toLocaleString()}₫ phí ship`;
  }
  return `${amount.toLocaleString()}?`; // Fallback for unknown type
};

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    code: "",
    discountAmount: "",
    minOrderAmount: "",
    discountType: "fixed", // API uses discountType
    expiryDate: "",
    status: "Active", // API uses status, default to Active
  });
  const [editingVoucher, setEditingVoucher] = useState(null); // Store full voucher object for edit

  // --- Loading and Error States ---
  const [isLoading, setIsLoading] = useState(false); // For main list loading
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission
  const [error, setError] = useState(null); // For general errors
  const [formError, setFormError] = useState(null); // For form-specific errors

  // --- Fetch Vouchers ---
  const fetchVouchers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // voucherApiService.getAvailableVouchers() returns the data array directly
      // This function should also return transformed data if needed
      const fetchedVouchers = await voucherApiService.getAllVouchers();
      // The API response for GET /available should match the structure needed
      // id, code, discountAmount, minOrderAmount, expiryDate, status (isActive), discountType
      // transformApiProduct from productService is not used here, so ensure direct fields match
      // Or create a transformVoucher function if needed
      setVouchers(
        fetchedVouchers.map((v) => ({
          ...v,
          // Ensure fields match what the UI expects, e.g., isActive from status
          isActive: v.status ? v.status.toLowerCase() === "active" : true,
          type: v.discountType || (v.discountAmount > 0 ? "fixed" : "shipping"), // Ensure 'type' for displayDiscount
        }))
      );
    } catch (err) {
      console.error("Failed to fetch vouchers:", err);
      setError(err.message || "Could not load vouchers.");
      setVouchers([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array, fetch on mount

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // --- Form Handlers ---
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVoucherForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddClick = () => {
    setEditingVoucher(null);
    setVoucherForm({
      code: "",
      discountAmount: "",
      minOrderAmount: "",
      discountType: "fixed",
      expiryDate: "",
      status: "Active", // Default status for new
    });
    setShowAddForm(true);
    setFormError(null);
  };

  const handleEditClick = (voucher) => {
    setEditingVoucher(voucher);
    setVoucherForm({
      code: voucher.code,
      discountAmount: voucher.discountAmount,
      minOrderAmount: voucher.minOrderAmount || 0, // Ensure it's a number
      discountType: voucher.discountType || voucher.type || "fixed", // Ensure type is set
      expiryDate: voucher.expiryDate
        ? new Date(voucher.expiryDate).toISOString().split("T")[0]
        : "", // Format for date input
      status: voucher.status || "Active", // Use status from API
    });
    setShowAddForm(true);
    setFormError(null);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    if (
      !voucherForm.code ||
      !voucherForm.discountType ||
      (voucherForm.discountType !== "shipping" &&
        (voucherForm.discountAmount === "" ||
          isNaN(parseFloat(voucherForm.discountAmount))))
    ) {
      setFormError(
        "Mã voucher, loại giảm giá và giá trị giảm giá là bắt buộc."
      );
      setIsSubmitting(false);
      return;
    }

    const payload = {
      code: voucherForm.code,
      discountAmount: parseFloat(voucherForm.discountAmount) || 0, // Ensure number
      minOrderAmount: parseFloat(voucherForm.minOrderAmount) || 0, // Ensure number
      expiryDate: voucherForm.expiryDate
        ? new Date(voucherForm.expiryDate).toISOString()
        : null, // API expects ISO string or null
      // status is handled by change-status API or included in update
      // discountType is conceptual for frontend, API might just use discountAmount
      // Your API create/update expects specific fields, ensure they match
    };

    // For create, API expects: code, discountAmount, minOrderAmount, expiryDate
    // For update, API expects: voucherId, and optionally other fields to update
    // For change-status, API expects: voucherId, status (as query params)

    try {
      if (editingVoucher) {
        // --- Update Existing Voucher ---
        const updatePayload = {
          voucherId: editingVoucher.id,
          // Only send fields that can be updated by this endpoint
          discountAmount: payload.discountAmount,
          minOrderAmount: payload.minOrderAmount,
          expiryDate: payload.expiryDate,
          status: voucherForm.status, // If update endpoint handles status
        };
        await voucherApiService.updateVoucher(updatePayload);
        alert("Voucher updated successfully!");
      } else {
        // --- Add New Voucher ---
        // Payload for create does not include voucherId or status initially
        const createPayload = {
          code: voucherForm.code,
          discountAmount: parseFloat(voucherForm.discountAmount) || 0,
          minOrderAmount: parseFloat(voucherForm.minOrderAmount) || 0,
          expiryDate: voucherForm.expiryDate
            ? new Date(voucherForm.expiryDate).toISOString()
            : null,
        };
        await voucherApiService.createVoucher(createPayload);
        alert("New voucher added successfully!");
      }
      fetchVouchers(); // Re-fetch the list to show changes
      setShowAddForm(false);
      setEditingVoucher(null);
    } catch (err) {
      console.error("Error submitting voucher form:", err);
      setFormError(err.message || "Failed to save voucher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    /* ... (keep as is) ... */ setEditingVoucher(null);
    setShowAddForm(false);
    setFormError(null);
  };

  const handleDeleteClick = async (voucherId, voucherCode) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa voucher "${voucherCode}" (ID: ${voucherId})?`
      )
    ) {
      setIsLoading(true); // Use general isLoading for table actions
      setError(null);
      try {
        await voucherApiService.deleteVoucher(voucherId); // Ensure deleteVoucher exists in service
        alert(`Voucher ${voucherCode} đã được xóa.`);
        fetchVouchers(); // Re-fetch to update list
      } catch (err) {
        console.error("Failed to delete voucher:", err);
        setError(err.message || "Could not delete voucher.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleActiveStatus = async (voucher) => {
    const newStatus =
      voucher.status && voucher.status.toLowerCase() === "active"
        ? "Inactive"
        : "Active";
    if (
      window.confirm(
        `Bạn có muốn đổi trạng thái voucher "${voucher.code}" thành "${newStatus}"?`
      )
    ) {
      setIsLoading(true);
      setError(null);
      try {
        await voucherApiService.changeVoucherStatus(voucher.id, newStatus);
        alert(`Trạng thái voucher "${voucher.code}" đã được cập nhật.`);
        fetchVouchers();
      } catch (err) {
        console.error("Failed to toggle voucher status:", err);
        setError(err.message || "Không thể cập nhật trạng thái voucher.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopyClick = (code) => {
    /* ... (keep as is) ... */ navigator.clipboard
      .writeText(code)
      .then(() => alert(`Mã "${code}" đã được sao chép!`))
      .catch((err) => console.error("Failed to copy code:", err));
  };

  // --- Render UI ---
  if (isLoading && vouchers.length === 0) {
    // Initial loading state
    return (
      <div className="text-center py-10">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto" />
      </div>
    );
  }
  if (error && vouchers.length === 0) {
    // Error when no data could be loaded
    return (
      <div className="text-center py-10 text-red-500">
        Lỗi: {error}{" "}
        <button
          onClick={fetchVouchers}
          className="ml-2 text-blue-500 underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Quản Lý Voucher
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tạo mới, chỉnh sửa và quản lý các mã giảm giá.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm shadow-md"
        >
          <FaPlusCircle size={16} /> Tạo Voucher Mới
        </button>
      </div>

      {/* Add/Edit Voucher Form Modal-like Section */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingVoucher ? "Chỉnh Sửa Voucher" : "Thêm Voucher Mới"}
              </h2>
              <button
                onClick={handleCancelForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={18} />
              </button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-600 rounded-md text-sm">
                {formError}
              </div>
            )}
            <form
              onSubmit={handleSubmitForm}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
            >
              {/* Voucher Code */}
              <div className="md:col-span-1">
                <label
                  htmlFor="code"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Mã Voucher <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={voucherForm.code}
                  onChange={handleFormChange}
                  required
                  className="admin-input"
                  placeholder="VD: SUMMER25"
                />
              </div>
              {/* Discount Type */}
              <div className="md:col-span-1">
                <label
                  htmlFor="discountType"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Loại Giảm Giá <span className="text-red-500">*</span>
                </label>
                <select
                  id="discountType"
                  name="discountType"
                  value={voucherForm.discountType}
                  onChange={handleFormChange}
                  className="admin-input"
                >
                  <option value="fixed">Số tiền cố định (₫)</option>
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="shipping">Miễn phí vận chuyển</option>
                </select>
              </div>
              {/* Discount Amount (conditional) */}
              {voucherForm.discountType !== "shipping" && (
                <div className="md:col-span-1">
                  <label
                    htmlFor="discountAmount"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Giá trị giảm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="discountAmount"
                    name="discountAmount"
                    value={voucherForm.discountAmount}
                    onChange={handleFormChange}
                    required
                    className="admin-input"
                    placeholder={
                      voucherForm.discountType === "fixed"
                        ? "VD: 50000"
                        : "VD: 10 (cho 10%)"
                    }
                    min="0"
                    step={
                      voucherForm.discountType === "percentage" ? "0.1" : "1000"
                    }
                  />
                </div>
              )}
              {/* Minimum Order */}
              <div
                className={`md:col-span-1 ${
                  voucherForm.discountType === "shipping"
                    ? "md:col-start-2"
                    : ""
                }`}
              >
                {" "}
                {/* Adjust span if discountAmount hidden */}
                <label
                  htmlFor="minOrderAmount"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Đơn hàng tối thiểu (₫)
                </label>
                <input
                  type="number"
                  id="minOrderAmount"
                  name="minOrderAmount"
                  value={voucherForm.minOrderAmount}
                  onChange={handleFormChange}
                  className="admin-input"
                  placeholder="VD: 100000 (bỏ trống nếu không có)"
                  min="0"
                  step="10000"
                />
              </div>
              {/* Expiry Date */}
              <div className="md:col-span-1">
                <label
                  htmlFor="expiryDate"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Ngày hết hạn
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={voucherForm.expiryDate}
                  onChange={handleFormChange}
                  className="admin-input"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              {/* Status (Active/Inactive) - only for edit or if backend sets default on create */}
              {editingVoucher && ( // Or always show if create should also set status
                <div className="md:col-span-1">
                  <label
                    htmlFor="status"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={voucherForm.status}
                    onChange={handleFormChange}
                    className="admin-input"
                  >
                    <option value="Active">Kích hoạt (Active)</option>
                    <option value="Inactive">Không kích hoạt (Inactive)</option>
                    {/* Add other statuses your API supports */}
                  </select>
                </div>
              )}
              <div className="md:col-span-2 flex justify-end gap-3 mt-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium transition-colors text-sm flex items-center disabled:bg-gray-400"
                >
                  {isSubmitting && <FaSpinner className="animate-spin mr-2" />}
                  {editingVoucher ? "Lưu Thay Đổi" : "Thêm Voucher"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voucher Table */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[768px]">
            {" "}
            {/* Min width for better responsive table */}
            <thead className="bg-gray-50">
              <tr>
                <th className="th-admin">Mã Code</th>
                <th className="th-admin">Giảm Giá</th>
                <th className="th-admin">Đơn Tối Thiểu</th>
                <th className="th-admin">Ngày Hết Hạn</th>
                <th className="th-admin">Trạng Thái</th>
                {/* <th className="th-admin">Lượt Dùng</th> */}
                <th className="th-admin text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vouchers.length === 0 && !isLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500 italic"
                  >
                    Không có voucher nào.
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      !(voucher.status === "Active" || voucher.isActive)
                        ? "bg-gray-100 opacity-70"
                        : ""
                    }`}
                  >
                    <td className="td-admin font-mono font-semibold text-blue-600">
                      {voucher.code}
                      <button
                        onClick={() => handleCopyClick(voucher.code)}
                        className="ml-2 text-gray-400 hover:text-blue-500"
                        title="Copy code"
                      >
                        <FaClipboard size={12} />
                      </button>
                    </td>
                    <td className="td-admin text-gray-800">
                      {displayDiscount(voucher)}
                    </td>
                    <td className="td-admin text-gray-800">
                      {voucher.minOrderAmount > 0
                        ? (voucher.minOrderAmount)
                        : "Mọi đơn"}
                    </td>
                    <td
                      className={`td-admin ${
                        voucher.expiryDate &&
                        new Date(voucher.expiryDate) < new Date() &&
                        voucher.status !== "Expired"
                          ? "text-red-600 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {formatDate(voucher.expiryDate)}
                      {voucher.expiryDate &&
                        new Date(voucher.expiryDate) < new Date() &&
                        voucher.status !== "Expired" && (
                          <span className="ml-1 text-xs">(Hết hạn)</span>
                        )}
                    </td>
                    <td className="td-admin">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          voucher.status === "Active" || voucher.isActive
                            ? "bg-green-100 text-green-700"
                            : voucher.status === "Inactive"
                            ? "bg-yellow-100 text-yellow-700"
                            : voucher.status === "Expired"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {voucher.status ||
                          (voucher.isActive ? "Active" : "Inactive")}
                      </span>
                    </td>
                    {/* <td className="td-admin text-gray-500">{voucher.usageCount || 0}</td> */}
                    <td className="td-admin text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleEditClick(voucher)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 rounded-md hover:bg-blue-50"
                          title="Sửa"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(voucher.id, voucher.code)
                          }
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                          title="Xóa"
                        >
                          <FaTrash size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActiveStatus(voucher)}
                          className={`p-1.5 rounded-md hover:bg-opacity-20 ${
                            voucher.status === "Active" || voucher.isActive
                              ? "text-yellow-600 hover:bg-yellow-100"
                              : "text-green-600 hover:bg-green-100"
                          }`}
                          title={
                            voucher.status === "Active" || voucher.isActive
                              ? "Hủy kích hoạt"
                              : "Kích hoạt"
                          }
                        >
                          {voucher.status === "Active" || voucher.isActive ? (
                            <FaTimes size={15} />
                          ) : (
                            <FaCheckCircle size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx global>{`
        .admin-input {
          @apply block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors;
        }
        .th-admin {
          @apply px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap;
        }
        .td-admin {
          @apply px-4 py-3 whitespace-nowrap text-sm;
        }
      `}</style>
    </div>
  );
}
