import React from "react";
import { FaTimes } from "react-icons/fa"; // Assuming you use react-icons/fa

const PaymentMethodModal = ({
  isOpen,
  onClose,
  onMethodSelected,
  currentMethod,
}) => {
  if (!isOpen) return null;

  // Sample payment methods
  const methods = [
    { key: "cod", label: "Trả tiền mặt khi nhận hàng (COD)" },
    { key: "vnpay", label: "Thanh toán VNPAY" }, // Example
    // Add more methods as needed
  ];

  return (
    // Fixed overlay with high z-index
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Chọn phương thức thanh toán
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="space-y-4">
          {methods.map((method) => (
            <label
              key={method.key}
              className="flex items-center text-gray-700 cursor-pointer hover:bg-gray-100 p-3 rounded-md"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.key}
                checked={currentMethod === method.key}
                onChange={() => onMethodSelected(method.key)} // Call handler from parent
                className="form-radio text-blue-600"
              />
              <span className="ml-3 text-base">{method.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
