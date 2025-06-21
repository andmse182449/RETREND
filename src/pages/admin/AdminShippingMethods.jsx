// src/pages/ShippingMethodsTable.js
import React, { useState, useEffect, useCallback } from "react";
import { FaEdit, FaPlus, FaSave, FaTimes, FaSpinner, FaSearch, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import shippingApiService from "../../services/ShippingApiService"; // Ensure this path is correct

// Helper for formatting price (VND)
const formatPrice = (price) => {
  const numPrice = parseFloat(price);
  if (typeof numPrice !== "number" || isNaN(numPrice)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numPrice);
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed top-6 right-6 z-50 max-w-sm w-full shadow-2xl rounded-xl border-l-4 ${
        type === 'success' 
          ? 'bg-white border-green-500' 
          : 'bg-white border-red-500'
      }`}
    >
      <div className="p-4 flex items-start">
        <div className={`flex-shrink-0 mr-3 mt-0.5 ${
          type === 'success' ? 'text-green-500' : 'text-red-500'
        }`}>
          {type === 'success' ? (
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheck size={12} />
            </div>
          ) : (
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle size={12} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {type === 'success' ? 'Thành công!' : 'Có lỗi xảy ra!'}
          </p>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes size={12} />
        </button>
      </div>
      <div className={`h-1 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } rounded-b-xl`}>
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 4, ease: "linear" }}
          className="h-full bg-gray-200 rounded-b-xl"
        />
      </div>
    </motion.div>
  );
};

export default function ShippingMethodsTable() {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [filteredMethods, setFilteredMethods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [toast, setToast] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  const initialFormState = { name: "", description: "", fee: "" };
  const [currentFormData, setCurrentFormData] = useState(initialFormState);

  // Toast helper
  const showToast = (message, type) => {
    setToast({ message, type, id: Date.now() });
  };

  // Search filter effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMethods(shippingMethods);
    } else {
      const filtered = shippingMethods.filter(method =>
        method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (method.description && method.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMethods(filtered);
    }
  }, [searchTerm, shippingMethods]);

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
    setEditingMethod(null);
    setCurrentFormData(initialFormState);
    setShowForm(true);
    setFormError(null);
  };

  const handleEditClick = (method) => {
    setEditingMethod(method);
    setCurrentFormData({
      id: method.shippingMethodId || method.id,
      name: method.name || "",
      description: method.description || "",
      fee: method.fee != null ? method.fee.toString() : "",
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
        const methodIdToUpdate =
          editingMethod.shippingMethodId || editingMethod.id;
        if (!methodIdToUpdate) {
          throw new Error(
            "Không tìm thấy ID để cập nhật phương thức vận chuyển."
          );
        }
        const updatedMethod = await shippingApiService.updateShippingMethod(
          methodIdToUpdate,
          payload
        );
        showToast(`Phương thức "${updatedMethod.name}" đã được cập nhật thành công!`, 'success');
      } else {
        // --- Add New Method ---
        const createdMethod = await shippingApiService.createShippingMethod(
          payload
        );
        showToast(`Phương thức "${createdMethod.name}" đã được thêm mới thành công!`, 'success');
      }
      handleCancelForm();
      loadMethods();
    } catch (err) {
      console.error("Error submitting shipping method form:", err);
      const errorMessage = err.message || "Lưu thất bại. Vui lòng thử lại.";
      setFormError(errorMessage);
      showToast(errorMessage, 'error');
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
    setIsLoading(true);
    setError(null);
    try {
      await shippingApiService.deleteShippingMethod(methodId);
      showToast(`Phương thức "${methodName}" đã được xóa thành công!`, 'success');
      loadMethods();
    } catch (err) {
      const errorMessage = err.message || "Không thể xóa phương thức vận chuyển.";
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error("Error deleting shipping method:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render UI ---
  if (isLoading && shippingMethods.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-lg font-medium">Đang tải dữ liệu...</p>
          <p className="text-sm text-gray-400">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal Backdrop */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
            onClick={handleCancelForm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingMethod ? "Chỉnh Sửa Phương Thức" : "Thêm Phương Thức Mới"}
                  </h2>
                  <button
                    onClick={handleCancelForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start"
                  >
                    <FaExclamationTriangle className="mr-2 mt-0.5 text-red-500" size={14} />
                    {formError}
                  </motion.div>
                )}

                <form onSubmit={handleSubmitForm} className="space-y-5">
                  <div>
                    <label htmlFor="formName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên phương thức <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="formName"
                      name="name"
                      value={currentFormData.name}
                      onChange={handleFormInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                      placeholder="VD: Giao hàng Tiết kiệm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="formDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      id="formDescription"
                      name="description"
                      value={currentFormData.description}
                      onChange={handleFormInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm resize-none"
                      placeholder="VD: Giao hàng trong 3-5 ngày làm việc"
                    />
                  </div>

                  <div>
                    <label htmlFor="formFee" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phí vận chuyển (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="formFee"
                      name="fee"
                      value={currentFormData.fee}
                      onChange={handleFormInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                      placeholder="VD: 30000 (nhập 0 nếu miễn phí)"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingForm}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex items-center min-w-[140px] justify-center"
                    >
                      {isSubmittingForm ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" size={14} />
                          {editingMethod ? "Lưu thay đổi" : "Thêm mới"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Quản lý Phương thức Vận chuyển
              </h1>

            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Tìm kiếm phương thức..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm w-full sm:w-64"
                />
              </div>
              
              {!showForm && (
                <button
                  onClick={handleShowAddForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg flex items-center transition-all duration-200 shadow-md hover:shadow-lg text-sm whitespace-nowrap"
                >
                  <FaPlus className="mr-2" size={14} />
                  Thêm mới
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        {(!isLoading || shippingMethods.length > 0) && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tên phương thức
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Phí vận chuyển
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading && shippingMethods.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                          <p className="mt-3 text-sm text-gray-500">Đang tải...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {!isLoading && filteredMethods.length === 0 && searchTerm && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FaSearch className="text-gray-300 mb-3" size={24} />
                          <p className="text-sm text-gray-500">
                            Không tìm thấy phương thức nào với từ khóa "{searchTerm}"
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {!isLoading && shippingMethods.length === 0 && !searchTerm && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FaPlus className="text-gray-400" size={24} />
                          </div>
                          <p className="text-sm text-gray-500 mb-2">Chưa có phương thức vận chuyển nào</p>
                          <button
                            onClick={handleShowAddForm}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Thêm phương thức đầu tiên
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {filteredMethods.map((method, index) => (
                    <motion.tr
                      key={method.shippingMethodId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-sm font-semibold text-gray-900">{method.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <span className="block truncate" title={method.description}>
                          {method.description || (
                            <span className="italic text-gray-400">Chưa có mô tả</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-600">
                          {formatPrice(method.fee)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleEditClick(method)}
                          className="p-2 rounded-full text-blue-500 hover:text-white hover:bg-blue-500 transition-all duration-200 hover:scale-110"
                          title="Chỉnh sửa"
                        >
                          <FaEdit size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            {filteredMethods.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Hiển thị {filteredMethods.length} trên tổng {shippingMethods.length} phương thức
                  {searchTerm && ` (đã lọc với "${searchTerm}")`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && !isLoading && !showForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaExclamationTriangle className="text-red-500" size={20} />
              </div>
              <p className="text-red-700 font-medium mb-2">Có lỗi xảy ra</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={loadMethods}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Thử lại
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}