// src/pages/ShippingMethodsTable.js
import React, { useState, useEffect, useCallback } from "react";
import {
  FaEdit,
  FaPlus,
  FaSave,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import shippingApiService from "../../services/ShippingApiService"; // Ensure this path is correct

// Helper for formatting price (VND)
const formatPrice = (price) => {
  const numPrice = parseFloat(price);
  if (typeof numPrice !== "number" || isNaN(numPrice)) return "N/A"; // Or '0đ' or some placeholder
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numPrice);
};

export default function ShippingMethodsTable() {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // For initial list load and table-row actions
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // Specifically for form submissions
  const [error, setError] = useState(null); // For errors related to fetching the list
  const [formError, setFormError] = useState(null); // For errors related to form validation/submission

  const [showForm, setShowForm] = useState(false); // Combined flag for add/edit form visibility
  const [editingMethod, setEditingMethod] = useState(null); // Stores the full method object being edited

  const initialFormState = { name: "", description: "", fee: "" };
  const [currentFormData, setCurrentFormData] = useState(initialFormState);

  // --- Fetch initial data using real API ---
  const loadMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const methods = await shippingApiService.getAllShippingMethods();
      setShippingMethods(methods || []);
    } catch (err) {
      setError(
        err.message || "Không thể tải danh sách phương thức vận chuyển."
      );
      console.error("Error loading shipping methods:", err);
      setShippingMethods([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  // --- Form Input Handler ---
  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentFormData((prev) => ({
      ...prev,
      [name]: name === "fee" ? (value === "" ? "" : value) : value,
    }));
  };

  // --- Show/Hide Form Handlers ---
  const handleShowAddForm = () => {
    setEditingMethod(null); // Ensure not in edit mode
    setCurrentFormData(initialFormState); // Reset form
    setShowForm(true);
    setFormError(null);
  };

  const handleEditClick = (method) => {
    setEditingMethod(method);
    setCurrentFormData({
      // API returns shippingMethodId, your table might use method.id if transformed that way.
      // Use the ID field that your `method` object actually has.
      id: method.shippingMethodId || method.id,
      name: method.name || "",
      description: method.description || "",
      fee: method.fee != null ? method.fee.toString() : "", // Ensure fee is string for input
    });
    setShowForm(true);
    setFormError(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMethod(null);
    setCurrentFormData(initialFormState);
    setFormError(null);
  };

  // --- Form Submission (Add or Edit) ---
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (
      !currentFormData.name.trim() ||
      currentFormData.fee === "" ||
      isNaN(parseFloat(currentFormData.fee))
    ) {
      setFormError("Vui lòng nhập tên và phí vận chuyển hợp lệ.");
      return;
    }
    if (parseFloat(currentFormData.fee) < 0) {
      setFormError("Phí vận chuyển không thể là số âm.");
      return;
    }

    setIsSubmittingForm(true);
    const payload = {
      name: currentFormData.name.trim(),
      description: currentFormData.description.trim(),
      fee: parseFloat(currentFormData.fee),
    };

    try {
      if (editingMethod) {
        // --- Update Existing Method ---
        // The shippingMethodId for update needs to be the one from the original object
        const methodIdToUpdate =
          editingMethod.shippingMethodId || editingMethod.id;
        if (!methodIdToUpdate) {
          throw new Error(
            "Không tìm thấy ID để cập nhật phương thức vận chuyển."
          );
        }
        // Pass ID as first param if service expects it, or include in payload if API needs it in body
        const updatedMethod = await shippingApiService.updateShippingMethod(
          methodIdToUpdate,
          payload
        );
        alert(`Phương thức "${updatedMethod.name}" đã được cập nhật!`);
      } else {
        // --- Add New Method ---
        const createdMethod = await shippingApiService.createShippingMethod(
          payload
        );
        alert(`Phương thức "${createdMethod.name}" đã được thêm mới!`);
      }
      handleCancelForm(); // Close form and reset
      loadMethods(); // Refresh the list
    } catch (err) {
      console.error("Error submitting shipping method form:", err);
      setFormError(err.message || "Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // --- Handler for Delete ---
  const handleDeleteMethod = async (methodId, methodName) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa phương thức "${methodName}" (ID: ${methodId})?`
      )
    ) {
      return;
    }
    setIsLoading(true); // Indicate an action is happening on the table
    setError(null);
    try {
      await shippingApiService.deleteShippingMethod(methodId);
      alert(`Phương thức "${methodName}" đã được xóa.`);
      loadMethods(); // Refresh the list
    } catch (err) {
      setError(err.message || "Không thể xóa phương thức vận chuyển.");
      console.error("Error deleting shipping method:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render UI ---
  if (isLoading && shippingMethods.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <FaSpinner className="animate-spin text-3xl text-blue-500 mr-3" /> Đang
        tải dữ liệu phương thức vận chuyển...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {" "}
        {/* Increased max-width for better table layout */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-300">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-0">
            Quản lý Phương thức Vận chuyển
          </h1>
          {!showForm && (
            <button
              onClick={handleShowAddForm}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-md hover:shadow-lg text-sm"
            >
              <FaPlus className="mr-2 text-xs" /> Thêm Mới
            </button>
          )}
        </div>
        {/* Add or Edit Form Section (Modal-like) */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-xl mb-8 border border-gray-200"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-700">
                  {editingMethod
                    ? "Chỉnh Sửa Phương Thức"
                    : "Thêm Phương Thức Vận Chuyển Mới"}
                </h2>
                <button
                  onClick={handleCancelForm}
                  className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              {formError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                  {formError}
                </div>
              )}
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div>
                  <label
                    htmlFor="formName"
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    Tên phương thức <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="formName"
                    name="name"
                    value={currentFormData.name}
                    onChange={handleFormInputChange}
                    className="form-input-admin"
                    placeholder="VD: Giao hàng Tiết kiệm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="formDescription"
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    Mô tả
                  </label>
                  <textarea
                    id="formDescription"
                    name="description"
                    value={currentFormData.description}
                    onChange={handleFormInputChange}
                    rows="2"
                    className="form-input-admin"
                    placeholder="VD: Giao hàng trong 3-5 ngày"
                  ></textarea>
                </div>
                <div>
                  <label
                    htmlFor="formFee"
                    className="block text-xs font-medium text-gray-600 mb-1"
                  >
                    Phí vận chuyển (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="formFee"
                    name="fee"
                    value={currentFormData.fee}
                    onChange={handleFormInputChange}
                    className="form-input-admin"
                    placeholder="VD: 30000 (nhập 0 nếu miễn phí)"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-3 mt-2">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingForm}
                    className="px-5 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 flex items-center"
                  >
                    {isSubmittingForm && (
                      <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                    )}
                    {editingMethod ? "Lưu Thay Đổi" : "Thêm Phương Thức"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Table of Shipping Methods */}
        {(!isLoading || shippingMethods.length > 0) && !error && (
          <div className="bg-white rounded-lg shadow-md mt-6 border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên Phương thức
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phí
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading && shippingMethods.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-10">
                        <FaSpinner className="animate-spin text-xl text-blue-500 mx-auto" />
                      </td>
                    </tr>
                  )}
                  {!isLoading && shippingMethods.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-10 text-center text-sm text-gray-500 italic"
                      >
                        Chưa có phương thức vận chuyển nào được cấu hình.
                      </td>
                    </tr>
                  )}
                  {shippingMethods.map((method) => (
                    <tr
                      key={method.shippingMethodId}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">
                        {method.name}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs"
                        title={method.description}
                      >
                        <span className="block truncate">
                          {method.description || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatPrice(method.fee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(method)}
                            className="p-2 rounded-full text-blue-500 hover:text-white hover:bg-blue-500 transition"
                            title="Sửa"
                          >
                            <FaEdit size={15} />
                          </button>
                          {/* Đã bỏ nút Xóa khỏi table */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Error display for list if it occurs after initial load or form is hidden */}
        {error && !isLoading && !showForm && (
          <div className="p-6 text-center text-red-500 mt-4 bg-red-50 border border-red-200 rounded-lg">
            Lỗi: {error}{" "}
            <button
              onClick={loadMethods}
              className="ml-2 text-blue-500 underline font-medium"
            >
              Thử lại
            </button>
          </div>
        )}
      </div>
      <style jsx global>{`
        .form-input-admin {
          @apply block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors;
        }
        .th-admin-table {
          @apply px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap;
        }
        .td-admin-table {
          @apply px-4 py-3 whitespace-nowrap text-sm;
        }
      `}</style>
    </div>
  );
}
