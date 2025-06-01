import React from 'react';
import { FaTimesCircle, FaRedo, FaQuestionCircle, FaShoppingCart } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom'; // Assuming you use React Router

export default function PaymentFailed() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // --- DYNAMIC DATA PLACEHOLDERS ---
  const orderNumberAttempted = queryParams.get('orderCode') || '12345XYZ_ATTEMPT';
  const errorCode = queryParams.get('errorCode') || 'PAYMENT_DECLINED'; // Example error code
  const errorMessage = queryParams.get('message') || 'Giao dịch của bạn không thể hoàn tất. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
  // --- END DYNAMIC DATA PLACEHOLDERS ---

  // You can map error codes to more user-friendly messages
  const getFriendlyErrorMessage = (code) => {
    switch (code) {
      case 'INSUFFICIENT_FUNDS':
        return 'Số dư trong tài khoản/thẻ của bạn không đủ để thực hiện giao dịch này.';
      case 'CARD_EXPIRED':
        return 'Thẻ thanh toán của bạn đã hết hạn. Vui lòng sử dụng thẻ khác.';
      case 'PAYMENT_DECLINED':
        return 'Giao dịch bị từ chối bởi ngân hàng hoặc đơn vị phát hành thẻ. Vui lòng kiểm tra lại thông tin hoặc liên hệ ngân hàng của bạn.';
      case 'TIMEOUT':
        return 'Giao dịch đã hết thời gian chờ. Vui lòng thử lại.';
      default:
        return errorMessage; // Default message from query or a generic one
    }
  };

  const friendlyError = getFriendlyErrorMessage(errorCode);

  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg text-center">
        <div>
          <FaTimesCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            Thanh Toán Thất Bại
          </h1>
          <p className="mt-2 text-md text-gray-700">
            Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán của bạn.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6 text-left space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Chi Tiết Lỗi:</h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              {orderNumberAttempted && <li><strong>Mã đơn hàng (thử lại):</strong> {orderNumberAttempted}</li>}
              <li className="text-red-600"><strong>Thông báo:</strong> {friendlyError}</li>
              {errorCode && errorCode !== 'UNKNOWN' && <li><strong>Mã lỗi:</strong> {errorCode}</li>}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800">Bạn có thể làm gì?</h3>
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside pl-1 space-y-1">
              <li>Kiểm tra lại thông tin thanh toán (số thẻ, ngày hết hạn, CVV, OTP).</li>
              <li>Đảm bảo bạn có đủ số dư trong tài khoản/thẻ.</li>
              <li>Thử sử dụng một phương thức thanh toán khác.</li>
              <li>Chờ một vài phút và thử lại giao dịch.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            // You might need to pass order details again or have a way to resume the checkout
            to="/thanh-toan" // Link back to checkout page, potentially with pre-filled info
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FaRedo className="mr-2 -ml-1 h-5 w-5" />
            Thử Lại Thanh Toán
          </Link>
          <Link
            to="/lien-he" // Link to contact/support page
            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaQuestionCircle className="mr-2 -ml-1 h-5 w-5" />
            Liên Hệ Hỗ Trợ
          </Link>
           <Link
            to="/" // Link to homepage
            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaShoppingCart className="mr-2 -ml-1 h-5 w-5" />
            Quay Lại Trang Chủ
          </Link>
        </div>
         <p className="mt-4 text-xs text-gray-500">
          Nếu vấn đề vẫn tiếp diễn, vui lòng lưu lại mã lỗi (nếu có) và liên hệ với chúng tôi.
        </p>
      </div>
    </div>
  );
}