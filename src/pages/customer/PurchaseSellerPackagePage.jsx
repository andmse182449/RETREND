import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePayOS } from "@payos/payos-checkout";
import sellerPackageApiService from "../../services/SellerPackageService";
import {
  FaCheckCircle,
  FaShoppingCart,
  FaTimesCircle,
  FaLeaf,
  FaStore,
  FaMoneyBillWave,
  FaShieldAlt,
  FaFileContract,
  FaSpinner,
  FaExternalLinkAlt,
  FaArrowRight,
  FaPercent,
  FaInfinity,
  FaHeadset,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

// Helper to get current username
const getCurrentUsername = () => {
  const userString = localStorage.getItem("user");
  if (userString) {
    try {
      const user = JSON.parse(userString);
      return user.username || null;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      return null;
    }
  }
  return null;
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-all"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </motion.div>
);

const PricingCard = ({
  title,
  price,
  duration,
  features,
  ctaText,
  isPopular,
  action,
}) => (
  <motion.div
    className={`relative rounded-2xl overflow-hidden border ${
      isPopular ? "border-green-500 shadow-xl" : "border-gray-200 shadow-lg"
    }`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {isPopular && (
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-2 text-sm font-bold">
        GÓI PHỔ BIẾN
      </div>
    )}

    <div
      className={`pt-12 pb-8 px-6 ${
        isPopular ? "bg-gradient-to-b from-green-50 to-white" : "bg-white"
      }`}
    >
      <h3
        className={`text-2xl font-bold text-center ${
          isPopular ? "text-green-700" : "text-gray-800"
        }`}
      >
        {title}
      </h3>

      <div className="mt-6 text-center">
        <p className="text-4xl font-extrabold text-gray-900">{price}</p>
        <p className="text-gray-500 mt-1">{duration}</p>
      </div>

      <ul className="mt-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <FaCheckCircle className="w-5 h-5 text-green-500 mr-2.5 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={action}
        className={`mt-8 w-full py-3 px-6 rounded-lg font-semibold transition-all
          ${
            isPopular
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
      >
        {ctaText}
      </motion.button>
    </div>
  </motion.div>
);

export default function BecomeSellerPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [isPayOSEmbeddedOpen, setIsPayOSEmbeddedOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("features");

  const { open: openPayOS, exit: exitPayOS } = usePayOS({
    RETURN_URL: `${window.location.origin}/seller-package-status`,
    ELEMENT_ID: "payos-embedded-container",
    CHECKOUT_URL: paymentUrl,
    embedded: true,
    onSuccess: (event) => {
      setIsPayOSEmbeddedOpen(false);
      toast.success(
        "Thanh toán thành công! Đang cập nhật trạng thái tài khoản..."
      );
      navigate(`/sell`);
    },
    onExit: () => {
      setIsPayOSEmbeddedOpen(false);
      toast.info("Giao dịch thanh toán đã được hủy hoặc đóng lại.");
    },
    onError: (err) => {
      setIsPayOSEmbeddedOpen(false);
      setError(`Lỗi PayOS: ${err.message || "Không thể khởi tạo thanh toán."}`);
      toast.error(`Lỗi PayOS: ${err.message || "Vui lòng thử lại."}`);
    },
  });

  useEffect(() => {
    if (paymentUrl && isPayOSEmbeddedOpen) {
      openPayOS();
    }
  }, [paymentUrl, isPayOSEmbeddedOpen, openPayOS]);

  const handlePurchasePackage = async () => {
    const username = getCurrentUsername();
    if (!username) {
      toast.error("Vui lòng đăng nhập để mua gói bán hàng.");
      navigate("/login");
      return;
    }
    if (!agreedToTerms) {
      toast.warn(
        "Bạn cần đồng ý với Điều khoản Dịch vụ và Chính sách Bán hàng."
      );
      return;
    }

    setIsLoading(true);
    setError("");
    exitPayOS();

    try {
      const result = await sellerPackageApiService.createSellerPackagePayment(
        username
      );
      if (result.checkoutUrl) {
        setPaymentUrl(result.checkoutUrl);
        setIsPayOSEmbeddedOpen(true);
      } else {
        throw new Error("Không nhận được URL thanh toán từ máy chủ.");
      }
    } catch (err) {
      console.error("Failed to create seller package payment:", err);
      const errorMessage =
        err.message ||
        "Không thể tạo yêu cầu thanh toán. Vui lòng thử lại sau.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const sellerPackageDetails = {
    name: "Gói Bán Hàng Cơ Bản Retrend",
    price: 50000,
    priceFormatted: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(50000),
    duration: "Vĩnh viễn",
    features: [
      "Đăng bán không giới hạn số lượng sản phẩm",
      "Tiếp cận cộng đồng người mua yêu thích đồ vintage",
      "Công cụ quản lý sản phẩm trực quan",
      "Hỗ trợ từ đội ngũ Retrend",
      "Phí giao dịch ưu đãi trên mỗi đơn hàng",
    ],
    whatYouCanSell: [
      "Quần áo đã qua sử dụng còn trong tình trạng tốt",
      "Phụ kiện thời trang (túi xách, giày dép, trang sức)",
      "Đồ vintage, retro, độc đáo",
    ],
    prohibitedItems: [
      "Hàng giả, hàng nhái, hàng kém chất lượng",
      "Các mặt hàng bị cấm theo pháp luật",
      "Vũ khí, chất cấm, đồ không phù hợp",
      "Sản phẩm không liên quan đến thời trang",
    ],
    profitPolicy:
      "Bạn nhận được 100% giá bán sau khi trừ phí vận chuyển và phí giao dịch nền tảng. Retrend thông báo rõ ràng về các khoản phí.",
  };

  const benefits = [
    {
      icon: <FaInfinity className="text-xl" />,
      title: "Đăng bán không giới hạn",
      description: "Thoải mái đăng bao nhiêu sản phẩm tùy thích",
    },
    {
      icon: <FaStore className="text-xl" />,
      title: "Cửa hàng cá nhân",
      description: "Xây dựng thương hiệu với cửa hàng riêng trên Retrend",
    },
    {
      icon: <FaPercent className="text-xl" />,
      title: "Phí giao dịch thấp",
      description: "Chỉ 5% phí giao dịch trên mỗi đơn hàng thành công",
    },
    {
      icon: <FaHeadset className="text-xl" />,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-2xl mb-8"
          >
            <FaStore className="mx-auto h-12 w-12 text-white" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Trở Thành <span className="text-green-600">Người Bán</span> trên
            Retrend
          </motion.h1>

          <motion.p
            className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Tham gia cộng đồng bán hàng thời trang bền vững, kiếm thêm thu nhập
            và trao cơ hội mới cho những món đồ cũ
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-green-700 transition-colors"
              onClick={() =>
                document
                  .getElementById("pricing-section")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              <FaShoppingCart className="mr-2" />
              Đăng ký ngay
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center bg-white text-gray-800 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              onClick={() => setActiveTab("benefits")}
            >
              <FaLeaf className="mr-2 text-green-600" />
              Lợi ích khi bán hàng
            </motion.button>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-md text-center border border-green-100">
            <div className="text-3xl font-bold text-green-600">5,000+</div>
            <div className="text-gray-600 mt-2">Người bán</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center border border-green-100">
            <div className="text-3xl font-bold text-green-600">98%</div>
            <div className="text-gray-600 mt-2">Hài lòng với dịch vụ</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center border border-green-100">
            <div className="text-3xl font-bold text-green-600">20K+</div>
            <div className="text-gray-600 mt-2">Đơn hàng/tháng</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center border border-green-100">
            <div className="text-3xl font-bold text-green-600">24/7</div>
            <div className="text-gray-600 mt-2">Hỗ trợ người bán</div>
          </div>
        </motion.div>

        {/* Tabs Section */}
        <div className="mb-16">
          <div className="flex justify-center mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("benefits")}
              className={`px-6 py-3 font-medium text-lg ${
                activeTab === "benefits"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Lợi ích
            </button>
            <button
              onClick={() => setActiveTab("how-it-works")}
              className={`px-6 py-3 font-medium text-lg ${
                activeTab === "how-it-works"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Cách thức hoạt động
            </button>
            <button
              onClick={() => setActiveTab("policies")}
              className={`px-6 py-3 font-medium text-lg ${
                activeTab === "policies"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Chính sách
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="pt-6"
            >
              {activeTab === "benefits" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {benefits.map((benefit, index) => (
                    <FeatureCard
                      key={index}
                      icon={benefit.icon}
                      title={benefit.title}
                      description={benefit.description}
                    />
                  ))}
                </div>
              )}

              {activeTab === "how-it-works" && (
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        4 bước đơn giản để bắt đầu bán hàng
                      </h3>

                      <div className="space-y-6">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                            1
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-800">
                              Đăng ký tài khoản người bán
                            </h4>
                            <p className="text-gray-600 mt-1">
                              Hoàn tất đăng ký và thanh toán gói thành viên
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                            2
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-800">
                              Thiết lập cửa hàng
                            </h4>
                            <p className="text-gray-600 mt-1">
                              Tạo cửa hàng với thông tin và hình ảnh đại diện
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                            3
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-800">
                              Đăng sản phẩm
                            </h4>
                            <p className="text-gray-600 mt-1">
                              Thêm sản phẩm với hình ảnh và mô tả chi tiết
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                            4
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-800">
                              Bắt đầu bán hàng
                            </h4>
                            <p className="text-gray-600 mt-1">
                              Quản lý đơn hàng và kết nối với người mua
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 md:h-96" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "policies" && (
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Chính sách người bán
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        Sản phẩm được phép bán
                      </h4>
                      <ul className="space-y-2">
                        {sellerPackageDetails.whatYouCanSell.map(
                          (item, index) => (
                            <li key={index} className="flex items-start">
                              <div className="bg-green-100 rounded-full p-1 mr-2 mt-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              </div>
                              <span className="text-gray-600">{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                        <FaTimesCircle className="text-red-500 mr-2" />
                        Sản phẩm bị cấm
                      </h4>
                      <ul className="space-y-2">
                        {sellerPackageDetails.prohibitedItems.map(
                          (item, index) => (
                            <li key={index} className="flex items-start">
                              <div className="bg-red-100 rounded-full p-1 mr-2 mt-1">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                              </div>
                              <span className="text-gray-600">{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                      <FaMoneyBillWave className="text-yellow-500 mr-2" />
                      Chính sách thanh toán & phí
                    </h4>
                    <p className="text-gray-600 bg-yellow-50 p-4 rounded-lg">
                      {sellerPackageDetails.profitPolicy}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pricing Section */}
        <div id="pricing-section" className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Lựa chọn gói thành viên
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Gói Cơ Bản"
              price="Miễn phí"
              duration="Dùng thử 14 ngày"
              features={[
                "Đăng tối đa 5 sản phẩm",
                "Tiếp cận cơ bản người mua",
                "Công cụ quản lý đơn giản",
                "Hỗ trợ qua email",
              ]}
              ctaText="Bắt đầu dùng thử"
              action={() => toast.info("Tính năng đang phát triển")}
            />

            <PricingCard
              title="Gói Pro"
              price={sellerPackageDetails.priceFormatted}
              duration="Vĩnh viễn"
              features={[
                "Đăng bán không giới hạn sản phẩm",
                "Tiếp cận toàn bộ cộng đồng người mua",
                "Công cụ quản lý nâng cao",
                "Hỗ trợ 24/7 qua chat",
                "Phí giao dịch chỉ 5%",
              ]}
              ctaText="Mua gói ngay"
              isPopular={true}
              action={handlePurchasePackage}
            />

            <PricingCard
              title="Gói Doanh Nghiệp"
              price="Liên hệ"
              duration="Tùy chỉnh"
              features={[
                "Tất cả tính năng gói Pro",
                "Quảng cáo ưu tiên sản phẩm",
                "Hỗ trợ chuyên gia riêng",
                "Báo cáo doanh thu chi tiết",
                "Tích hợp API nâng cao",
              ]}
              ctaText="Liên hệ tư vấn"
              action={() => navigate("/contact")}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Câu hỏi thường gặp
          </h2>

          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <button className="flex justify-between items-center w-full text-left font-medium text-gray-800">
                <span>Thời gian xử lý đơn hàng như thế nào?</span>
                <FaArrowRight className="text-green-600 transform rotate-90" />
              </button>
              <p className="mt-2 text-gray-600">
                Sau khi thanh toán thành công, tài khoản của bạn sẽ được nâng
                cấp ngay lập tức. Bạn có thể bắt đầu đăng sản phẩm và bán hàng
                trong vòng 5-10 phút.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <button className="flex justify-between items-center w-full text-left font-medium text-gray-800">
                <span>Tôi có thể hủy gói sau khi mua không?</span>
                <FaArrowRight className="text-green-600 transform rotate-90" />
              </button>
              <p className="mt-2 text-gray-600">
                Gói bán hàng là gói trọn đời một lần thanh toán, không có phí
                định kỳ. Do đó, chúng tôi không hỗ trợ hoàn tiền sau khi giao
                dịch thành công.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <button className="flex justify-between items-center w-full text-left font-medium text-gray-800">
                <span>Retrend thu phí như thế nào?</span>
                <FaArrowRight className="text-green-600 transform rotate-90" />
              </button>
              <p className="mt-2 text-gray-600">
                Chúng tôi chỉ thu phí 5% trên mỗi giao dịch thành công. Không có
                phí ẩn, phí đăng sản phẩm hay phí duy trì hàng tháng.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/faq"
              className="inline-flex items-center text-green-600 font-medium hover:underline"
            >
              Xem tất cả câu hỏi <FaExternalLinkAlt className="ml-2 text-sm" />
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-center text-white mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Sẵn sàng trở thành người bán?
          </h2>
          <p className="max-w-2xl mx-auto mb-6 text-green-100">
            Tham gia cộng đồng hơn 5,000 người bán đang kiếm thu nhập từ việc
            bán hàng secondhand trên Retrend
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold shadow-lg"
              onClick={handlePurchasePackage}
            >
              <FaShoppingCart className="inline mr-2" />
              Đăng ký gói Pro ngay
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border border-white text-white px-8 py-3 rounded-lg font-bold"
              onClick={() => navigate("/contact")}
            >
              <FaHeadset className="inline mr-2" />
              Liên hệ tư vấn
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
