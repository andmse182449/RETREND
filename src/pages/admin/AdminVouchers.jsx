// src/pages/AdminVouchers.jsx
import React, { useState, useEffect, useCallback } from "react";
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
import voucherApiService from "../../services/VoucherApiService";

// --- Toast Component ---
function Toast({ message, type = "success", onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-6 right-6 z-50 min-w-[240px] px-5 py-3 rounded-lg shadow-lg flex items-center gap-3
        ${
          type === "success"
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white"
        }
      `}
    >
      {type === "success" ? (
        <FaCheckCircle className="text-white text-lg" />
      ) : (
        <FaTimes className="text-white text-lg" />
      )}
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/80 hover:text-white transition"
        aria-label="Đóng"
      >
        <FaTimes />
      </button>
    </motion.div>
  );
}

// --- Helper Functions ---
const formatDate = (dateString) => {
  if (!dateString) return "Không có";
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    return dateString;
  } catch (e) {
    return "Ngày không hợp lệ";
  }
};

const displayDiscount = (voucher) => {
  if (!voucher || typeof voucher.discountAmount === "undefined") return "N/A";
  const type = voucher.discountType || voucher.type;
  const amount = voucher.discountAmount;
  if (type === "fixed") return `${amount.toLocaleString()}₫`;
  if (type === "percentage") return `${amount}%`;
  if (type === "shipping")
    return amount === 0 || amount === "free_shipping"
      ? "Miễn phí vận chuyển"
      : `${amount.toLocaleString()}₫ phí ship`;
  return `${amount.toLocaleString()}?`;
};

// --- Modal Component ---
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative"
          initial={{ scale: 0.97, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.97, y: 40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    code: "",
    discountAmount: "",
    minOrderAmount: "",
    discountType: "fixed",
    expiryDate: "",
    status: "Active",
  });
  const [editingVoucher, setEditingVoucher] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  // --- Fetch Vouchers ---
  const fetchVouchers = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedVouchers = await voucherApiService.getAllVouchers();
      setVouchers(
        fetchedVouchers.map((v) => ({
          ...v,
          isActive: v.status ? v.status.toLowerCase() === "available" : true,
          type: v.discountType || (v.discountAmount > 0 ? "fixed" : "shipping"),
        }))
      );
    } catch (err) {
      setToast({
        message: err.message || "Không thể tải danh sách voucher.",
        type: "error",
      });
      setVouchers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      status: "Active",
    });
    setShowAddForm(true);
    setFormError(null);
  };

  const handleEditClick = (voucher) => {
    setEditingVoucher(voucher);
    setVoucherForm({
      code: voucher.code,
      discountAmount: voucher.discountAmount,
      minOrderAmount: voucher.minOrderAmount || 0,
      discountType: voucher.discountType || voucher.type || "fixed",
      expiryDate: voucher.expiryDate
        ? new Date(voucher.expiryDate).toISOString().split("T")[0]
        : "",
      status: voucher.status || "Active",
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

    try {
      if (editingVoucher) {
        const updatePayload = {
          voucherId: editingVoucher.voucherId ?? editingVoucher.id,
          discountAmount: parseFloat(voucherForm.discountAmount) || 0,
          minOrderAmount: parseFloat(voucherForm.minOrderAmount) || 0,
          expiryDate: voucherForm.expiryDate
            ? new Date(voucherForm.expiryDate).toISOString()
            : null,
          status: voucherForm.status,
        };
        await voucherApiService.updateVoucher(updatePayload);
        setToast({ message: "Cập nhật voucher thành công!", type: "success" });
      } else {
        const createPayload = {
          code: voucherForm.code,
          discountAmount: parseFloat(voucherForm.discountAmount) || 0,
          minOrderAmount: parseFloat(voucherForm.minOrderAmount) || 0,
          expiryDate: voucherForm.expiryDate
            ? new Date(voucherForm.expiryDate).toISOString()
            : null,
        };
        await voucherApiService.createVoucher(createPayload);
        setToast({ message: "Tạo voucher mới thành công!", type: "success" });
      }
      fetchVouchers();
      setShowAddForm(false);
      setEditingVoucher(null);
    } catch (err) {
      setFormError(err.message || "Không thể lưu voucher.");
      setToast({
        message: err.message || "Không thể lưu voucher.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setEditingVoucher(null);
    setShowAddForm(false);
    setFormError(null);
  };

  const handleDeleteClick = async (voucherId, voucherCode) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa voucher "${voucherCode}" (ID: ${voucherId})?`
      )
    ) {
      setIsLoading(true);
      try {
        await voucherApiService.deleteVoucher(voucherId);
        setToast({
          message: `Voucher "${voucherCode}" đã được xóa.`,
          type: "success",
        });
        fetchVouchers();
      } catch (err) {
        setToast({
          message: err.message || "Không thể xóa voucher.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleActiveStatus = async (voucher) => {
    const newStatus =
      voucher.status && voucher.status.toLowerCase() === "available"
        ? "Inactive"
        : "Available";
    if (
      window.confirm(
        `Bạn có muốn đổi trạng thái voucher "${voucher.code}" thành "${newStatus}"?`
      )
    ) {
      setIsLoading(true);
      try {
        await voucherApiService.changeVoucherStatus(
          Number(voucher.voucherId ?? voucher.id),
          newStatus
        );
        setToast({
          message: `Trạng thái voucher "${voucher.code}" đã được cập nhật.`,
          type: "success",
        });
        fetchVouchers();
      } catch (err) {
        setToast({
          message: err.message || "Không thể cập nhật trạng thái voucher.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopyClick = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() =>
        setToast({ message: `Mã "${code}" đã được sao chép!`, type: "success" })
      )
      .catch(() =>
        setToast({ message: "Không thể sao chép mã.", type: "error" })
      );
  };

  // --- Render UI ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Quản Lý Mã Giảm Giá
          </h1>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm shadow-md"
        >
          <FaPlusCircle size={16} /> Tạo Voucher Mới
        </button>
      </div>

      {/* Modal for Add/Edit */}
      <Modal open={showAddForm} onClose={handleCancelForm}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {editingVoucher ? "Chỉnh Sửa Voucher" : "Thêm Voucher Mới"}
          </h2>
          <button
            onClick={handleCancelForm}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Đóng"
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
              disabled={!!editingVoucher}
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
              disabled={!!editingVoucher}
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
              voucherForm.discountType === "shipping" ? "md:col-start-2" : ""
            }`}
          >
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
          {/* Status (Active/Inactive) - only for edit */}
          {editingVoucher && (
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
              </select>
            </div>
          )}
          <div className="md:col-span-2 flex justify-end gap-3 mt-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm font-medium transition-colors"
              disabled={isSubmitting}
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
      </Modal>

      {/* Voucher Table */}
      <div className="bg-white rounded-lg shadow-md mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảm Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn Tối Thiểu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày Hết Hạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    <div className="p-6 text-center text-gray-500 flex items-center justify-center min-h-[calc(100vh-10rem)]">
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="mt-4 text-lg font-medium">
                          Đang tải dữ liệu...
                        </p>
                        <p className="text-sm text-gray-400">
                          Vui lòng chờ trong giây lát
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    Không có voucher nào.
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-blue-600 flex items-center gap-2">
                      {voucher.code}
                      <button
                        onClick={() => handleCopyClick(voucher.code)}
                        className="text-gray-400 hover:text-blue-500 transition"
                        title="Copy code"
                      >
                        <FaClipboard size={13} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {displayDiscount(voucher)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {voucher.minOrderAmount > 0
                        ? voucher.minOrderAmount.toLocaleString()
                        : "Mọi đơn"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(voucher.expiryDate)}
                      {voucher.expiryDate &&
                        new Date(voucher.expiryDate) < new Date() &&
                        voucher.status !== "Expired" && (
                          <span className="ml-1 text-xs text-red-500">
                            (Hết hạn)
                          </span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      voucher.status === "Expired"
                        ? "bg-red-100 text-red-700"
                        : voucher.status === "Available"
                        ? "bg-blue-100 text-blue-700"
                        : voucher.status === "Inactive"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-gray-100 text-gray-700"
                    }
                  `}
                        style={{
                          minWidth: 90,
                          textAlign: "center",
                          letterSpacing: 1,
                        }}
                      >
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(voucher)}
                          className="p-2 rounded-full text-blue-500 hover:text-white hover:bg-blue-500 transition"
                          title="Sửa"
                        >
                          <FaEdit size={15} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(voucher.id, voucher.code)
                          }
                          className="p-2 rounded-full text-red-500 hover:text-white hover:bg-red-500 transition"
                          title="Xóa"
                        >
                          <FaTrash size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleActiveStatus(voucher)}
                          className={`p-2 rounded-full transition ${
                            voucher.status === "Active" || voucher.isActive
                              ? "text-yellow-600 hover:text-white hover:bg-yellow-400"
                              : "text-green-600 hover:text-white hover:bg-green-500"
                          }`}
                          title={
                            voucher.status === "Active" || voucher.isActive
                              ? "Hủy kích hoạt"
                              : "Kích hoạt"
                          }
                        >
                          {voucher.status === "Active" || voucher.isActive ? (
                            <FaTimes size={16} />
                          ) : (
                            <FaCheckCircle size={16} />
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
      `}</style>
    </div>
  );
}
