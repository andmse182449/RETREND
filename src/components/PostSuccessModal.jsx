// src/components/PostSuccessModal.js
import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

export default function PostSuccessModal({
  isOpen,
  onClose,
  onViewProduct,
  onListAnother,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full text-center"
      >
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">
          Đăng Bán Thành Công!
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Sản phẩm của bạn đã được đăng. Bạn muốn làm gì tiếp theo?
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              onViewProduct();
              onClose();
            }}
            className="px-5 py-2.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors w-full sm:w-auto"
          >
            Xem Sản Phẩm Vừa Đăng
          </button>
          <button
            onClick={() => {
              onListAnother();
              onClose();
            }}
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors w-full sm:w-auto"
          >
            Đăng Sản Phẩm Khác
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-xs text-gray-500 hover:underline"
        >
          Đóng
        </button>
      </motion.div>
    </div>
  );
}
