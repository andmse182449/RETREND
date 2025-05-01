import React, { useState } from "react";

const CartPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [needInvoice, setNeedInvoice] = useState(false);

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const productPrice = 324000;
  const totalPrice = productPrice * quantity;
  const freeShippingThreshold = 600000;
  const remainingForFreeShipping = freeShippingThreshold - totalPrice;

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-300">
          <h1 className="text-2xl font-semibold">Giỏ hàng của bạn</h1>
          <div className="text-sm text-gray-600">
            Bạn đang có <span className="font-semibold">1 sản phẩm</span> trong
            giỏ hàng
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div
              className="absolute left-0 top-0 h-full bg-yellow-400 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (totalPrice / freeShippingThreshold) * 100
                )}%`,
              }}
            ></div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-5 h-5 bg-yellow-400 border-2 border-white rounded-full"></div>
          </div>
          <div className="mt-2 text-sm">
            {remainingForFreeShipping > 0 ? (
              <p>
                Bạn cần mua thêm{" "}
                <span className="font-bold text-red-500">
                  {formatPrice(remainingForFreeShipping)}
                </span>{" "}
                để được MIỄN PHÍ VẬN CHUYỂN
              </p>
            ) : (
              <p className="font-semibold text-green-600">
                Bạn đã đủ điều kiện để được MIỄN PHÍ VẬN CHUYỂN!
              </p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 flex flex-col lg:flex-row gap-6">
          {/* Left Column - Cart Items */}
          <div className="flex-1">
            {/* Product Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex">
                <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden mr-4">
                  <img
                    src="/api/placeholder/80/80"
                    alt="DAILY KAKI SHORT"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">DAILY KAKI SHORT | GRAY</h3>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-gray-500 mr-1"></span>
                        GRAY / XL
                      </div>
                    </div>
                    <div className="font-semibold mt-2 md:mt-0 text-right">
                      {formatPrice(productPrice)}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="inline-flex border border-gray-300 rounded-md">
                      <button
                        onClick={decreaseQuantity}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-10 h-8 text-center text-sm border-l border-r border-gray-300"
                      />
                      <button
                        onClick={increaseQuantity}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3">Ghi chú đơn hàng</h3>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md resize-none min-h-20"
                placeholder="Nhập ghi chú cho đơn hàng của bạn..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-semibold mb-4">Thông tin đơn hàng</h2>

              <div className="flex justify-between mb-2">
                <span>Tổng tiền:</span>
                <span className="font-semibold text-red-500">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <div className="text-xs text-gray-600 mt-4 space-y-1">
                <p>- Phí vận chuyển sẽ được tính ở trang thanh toán.</p>
                <p>
                  - Nếu bạn cần giúp đỡ, hãy liên hệ vào phần chủ shop Hotline
                  để được hỗ trợ.
                </p>
              </div>

              <button className="w-full bg-red-500 text-white font-semibold py-3 rounded-md mt-6 uppercase">
                Thanh Toán
              </button>

              {/* Promo Codes */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3 uppercase text-sm">
                  Mã ưu đãi dành cho bạn
                </h3>

                <div className="border border-gray-300 rounded-md p-3 mb-3 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm">
                      Miễn phí vận chuyển
                    </div>
                    <div className="text-xs text-gray-500">Đơn hàng từ 0đ</div>
                  </div>
                  <button className="bg-gray-800 text-white text-xs px-3 py-1 rounded-md">
                    XÁC NHẬN
                  </button>
                </div>

                <div className="border border-gray-300 rounded-md p-3 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm">Giảm 50k</div>
                    <div className="text-xs text-gray-500">
                      Đơn hàng từ 899.000đ
                    </div>
                  </div>
                  <button className="bg-gray-800 text-white text-xs px-3 py-1 rounded-md">
                    XÁC NHẬN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
