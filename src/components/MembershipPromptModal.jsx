// src/components/MembershipPromptModal.js
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa"; // Example icon

export default function MembershipPromptModal({
  isOpen,
  onClose,
  onBuyMembership,
  message,
}) {
  if (!isOpen) return null;

  const displayMessage =
    message ||
    "Dường như bạn cần nâng cấp tài khoản hoặc gia hạn thành viên để sử dụng tính năng này.";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full text-center"
      >
        <FaExclamationTriangle className="text-yellow-500 text-4xl mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Yêu Cầu Quyền Hạn
        </h2>
        <p className="text-sm text-gray-600 mb-6 px-2">{displayMessage}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full sm:w-auto"
          >
            Để Sau
          </button>
          <button // Or Link if it navigates directly
            onClick={onBuyMembership} // This might navigate or trigger another flow
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors w-full sm:w-auto"
          >
            Xem Gói Hội Viên
          </button>
        </div>
      </motion.div>
    </div>
  );
}
