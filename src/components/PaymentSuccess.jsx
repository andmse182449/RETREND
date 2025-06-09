import React from 'react';
import { FaCheckCircle, FaShoppingCart, FaFileInvoiceDollar } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom'; // Assuming you use React Router for navigation and to get query params

export default function PaymentSuccess() {
  // Example: Get order details from URL query parameters or state
  // In a real app, you might fetch this from your backend using an order ID
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // --- DYNAMIC DATA PLACEHOLDERS ---
  // Replace these with actual data passed to the component or fetched
  const orderNumber = queryParams.get('orderCode') || '12345XYZ'; // Example from your PayOS code
  const transactionId = queryParams.get('transactionId') || 'PAYOS_TRX_ABCDEF';
  const paymentMethod = queryParams.get('paymentMethod') || 'Chuyển khoản ngân hàng';
  const amountPaid = parseFloat(queryParams.get('amount') || '250000').toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  const purchaseDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const itemsPurchased = [ // This would ideally come from order details
    { name: 'Áo khoác Denim Xanh', quantity: 1, price: 180000 },
    { name: 'Quần Jeans Rách Gối', quantity: 1, price: 70000 },
  ];
  // --- END DYNAMIC DATA PLACEHOLDERS ---

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg text-center">
        <div>
          <FaCheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            Thanh Toán Thành Công!
          </h1>
          <p className="mt-2 text-md text-gray-600">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6 text-left space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Chi Tiết Đơn Hàng:</h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              {/* <li><strong>Mã đơn hàng:</strong> {orderNumber}</li>
              <li><strong>Mã giao dịch:</strong> {transactionId}</li> */}
              <li><strong>Ngày thanh toán:</strong> {purchaseDate}</li>
              <li><strong>Phương thức thanh toán:</strong> {paymentMethod}</li>
              {/* <li><strong>Tổng tiền:</strong> <span className="font-semibold text-green-600">{amountPaid}</span></li> */}
            </ul>
          </div>

          {/* Optional: Itemized list - if you have this data readily available */}
          {/* {itemsPurchased.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800">Sản phẩm đã mua:</h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc list-inside pl-1">
                {itemsPurchased.map((item, index) => (
                  <li key={index}>
                    {item.name} (SL: {item.quantity}) - {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </li>
                ))}
              </ul>
            </div>
          )} */}

          {/* <div>
            <p className="text-sm text-gray-600">
              Một email xác nhận cùng với chi tiết đơn hàng đã được gửi đến địa chỉ email của bạn.
              Chúng tôi sẽ xử lý và giao hàng cho bạn trong thời gian sớm nhất.
            </p>
          </div> */}
        </div>

        <div className="mt-8 space-y-3">
          <Link
            to="/profile" // Link to user's order history page
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaFileInvoiceDollar className="mr-2 -ml-1 h-5 w-5" />
            Xem Lịch Sử Đơn Hàng
          </Link>
          <Link
            to="/products" // Link to homepage
            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaShoppingCart className="mr-2 -ml-1 h-5 w-5" />
            Tiếp Tục Mua Sắm
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Nếu bạn có bất kỳ câu hỏi nào, vui lòng <Link to="/lien-he" className="font-medium text-green-600 hover:text-green-500">liên hệ</Link> với chúng tôi.
        </p>
      </div>
    </div>
  );
}