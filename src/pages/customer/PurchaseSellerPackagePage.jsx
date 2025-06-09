import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaCheck,
  FaShoppingCart,
  FaLeaf,
  FaStore,
  FaPercent,
  FaHeadset,
  FaUserFriends,
  FaChartLine,
  FaShieldAlt,
  FaArrowRight,
  FaExternalLinkAlt,
  FaStar,
  FaSpinner,
  FaCreditCard,
  FaLock,
  FaSyncAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import sellerPackageApiService  from "../../services/SellerPackageService";
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

const BecomeSellerPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

 const handlePurchase = async () => {
    if (!agreedToTerms) {
      setTermsError("Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bán hàng.");
      toast.warn("Vui lòng đồng ý với điều khoản để tiếp tục.");
      return;
    }
    setTermsError(""); // Clear error if agreed
    setIsProcessing(true);

    try {
      const userString = localStorage.getItem("user");
      let usernameToUse = "";

      if (userString) {
        try {
          const userData = JSON.parse(userString);
          usernameToUse = userData.username || ""; // Assuming username is stored in user object
        } catch (e) {
          console.error("BecomeSellerPage: Error parsing user data from localStorage:", e);
          toast.error("Lỗi: Không thể xác định thông tin người dùng.");
          setIsProcessing(false);
          return;
        }
      }

      if (!usernameToUse) {
        toast.error("Lỗi: Không tìm thấy tên người dùng. Vui lòng đăng nhập lại.");
        setIsProcessing(false);
        navigate("/login"); // Redirect to login if no username
        return;
      }

      // Call API to create seller package payment link using username in path
      // The SellerPackageService handles token and empty body for this specific API design
      console.log(`BecomeSellerPage: Calling createSellerPackagePayment for username: ${usernameToUse}`);
      const response = await sellerPackageApiService.createSellerPackagePayment(usernameToUse);
      // SellerPackageService._handleCreatePackageResponse expects { checkoutUrl, qrCode } directly

      if (response && response.checkoutUrl) {
        toast.info("Đang chuyển hướng đến cổng thanh toán...");
        window.location.href = response.checkoutUrl; // Redirect to payment gateway
        // setIsProcessing(false); // Page will navigate away
      } else {
        // This error would typically be caught and structured by _handleCreatePackageResponse
        console.error("BecomeSellerPage: Invalid response from createSellerPackagePayment", response);
        throw new Error(response?.message || "Không thể tạo liên kết thanh toán gói bán hàng.");
      }
    } catch (error) {
      console.error("BecomeSellerPage: Payment error:", error);
      toast.error(`Thanh toán thất bại: ${error.message || "Vui lòng thử lại."}`);
      // Ensure isMembershipError is not accidentally caught here from a different service
      // if (error.isMembershipError) { /* This logic was for image upload */ }
      setIsProcessing(false);
    } 
    // `finally` block is removed for setIsProcessing(false) because successful redirection means
    // the component might unmount. It's set to false in catch or before return in try.
  };

  const features = [
    {
      icon: <FaStore className="text-xl" />,
      title: "Cửa hàng cá nhân",
      description: "Tạo cửa hàng với thông tin và hình ảnh đại diện",
    },
    {
      icon: <FaPercent className="text-xl" />,
      title: "Phí giao dịch thấp",
      description: "Chỉ 5% phí giao dịch trên mỗi đơn hàng thành công",
    },
    {
      icon: <FaShieldAlt className="text-xl" />,
      title: "Bảo vệ người bán",
      description: "Chính sách bảo vệ người bán khỏi gian lận",
    },
    {
      icon: <FaHeadset className="text-xl" />,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn",
    },
    {
      icon: <FaSyncAlt className="text-xl" />,
      title: "10 Sản phẩm",
      description: "Đăng tối đa 10 sản phẩm trong gói này",
    },
    {
      icon: <FaLeaf className="text-xl" />,
      title: "Tiếp cận cộng đồng",
      description: "Kết nối với cộng đồng yêu thích thời trang bền vững",
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Thị Mai",
      role: "Người bán trên Retrend",
      content:
        "Sau khi đăng ký gói bán hàng, doanh thu của tôi tăng 150% chỉ trong 3 tháng. Cộng đồng Retrend thực sự quan tâm đến sản phẩm second-hand chất lượng.",
      rating: 5,
    },
    {
      name: "Trần Văn Nam",
      role: "Chủ cửa hàng thời trang vintage",
      content:
        "Phí giao dịch thấp và hệ thống quản lý đơn hàng dễ sử dụng giúp tôi tiết kiệm rất nhiều thời gian. Đầu tư ban đầu hoàn toàn xứng đáng!",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "Tại sao tôi cần trả phí để trở thành người bán?",
      answer:
        "Phí đăng ký giúp chúng tôi duy trì nền tảng chất lượng cao, kiểm duyệt người bán, và cung cấp các công cụ hỗ trợ bán hàng chuyên nghiệp.",
    },
    {
      question: "Tôi có được hoàn tiền nếu không hài lòng?",
      answer:
        "Chúng tôi có chính sách hoàn tiền trong vòng 30 ngày nếu bạn không hài lòng với dịch vụ.",
    },
    {
      question: "Phí giao dịch được tính như thế nào?",
      answer:
        "Retrend chỉ thu 5% trên mỗi giao dịch thành công. Không có phí ẩn, phí đăng sản phẩm hay phí duy trì hàng tháng.",
    },
    {
      question: "Điều gì xảy ra khi tôi đăng hết 10 sản phẩm?",
      answer:
        "Bạn có thể mua thêm gói đăng sản phẩm mới để tiếp tục đăng thêm sản phẩm. Các sản phẩm hiện tại vẫn được giữ nguyên trên hệ thống.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-2xl mb-6"
          >
            <FaStore className="mx-auto h-8 w-8 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Bắt Đầu Bán Hàng Trên{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-700">
              Retrend
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-0.5"
          >
            <div className="bg-white rounded-xl px-6 py-3">
              <p className="text-gray-900 font-medium">
                <span className="text-emerald-600 font-bold">50,000₫</span> -
                Thanh toán để đăng tối đa 10 sản phẩm
              </p>
            </div>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Features */}
              <div className="md:w-2/3 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Lợi ích khi trở thành Người bán trên Retrend
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-4">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="ml-3 text-gray-600">
                    <span className="font-medium text-gray-900">
                      Bảo mật tuyệt đối:
                    </span>{" "}
                    Thông tin thanh toán được mã hóa và bảo vệ bởi công nghệ
                    tiên tiến nhất
                  </p>
                </div>
              </div>

              {/* Payment Section */}
              <div className="md:w-1/3 bg-gradient-to-b from-emerald-500 to-teal-600 text-white p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">
                    Gói Bán Hàng Cơ Bản
                  </h3>
                  <p className="text-emerald-100">Đăng tối đa 10 sản phẩm</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-emerald-100">Tổng thanh toán</span>
                    <span className="text-2xl font-bold">50,000₫</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaCheck className="w-4 h-4 text-emerald-300 mr-2" />
                      <span className="text-emerald-100">
                        Đăng tối đa 10 sản phẩm
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaCheck className="w-4 h-4 text-emerald-300 mr-2" />
                      <span className="text-emerald-100">
                        Phí giao dịch chỉ 5%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaCheck className="w-4 h-4 text-emerald-300 mr-2" />
                      <span className="text-emerald-100">
                        Hỗ trợ ưu tiên 24/7
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaCheck className="w-4 h-4 text-emerald-300 mr-2" />
                      <span className="text-emerald-100">
                        Công cụ quản lý cơ bản
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (termsError) setTermsError(false);
                      }}
                      className="mt-1 mr-3 h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="terms" className="text-emerald-100 text-sm">
                      Tôi đồng ý với{" "}
                      <a href="#" className="underline font-medium">
                        Điều khoản dịch vụ
                      </a>{" "}
                      và{" "}
                      <a href="#" className="underline font-medium">
                        Chính sách bán hàng
                      </a>{" "}
                      của Retrend
                    </label>
                  </div>

                  {termsError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2 flex items-start text-yellow-300 text-sm"
                    >
                      <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
                      <span>
                        Vui lòng đồng ý với điều khoản trước khi thanh toán
                      </span>
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="w-full bg-white text-emerald-600 font-bold py-4 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="animate-spin mr-3" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="mr-3" />
                      Thanh toán ngay
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center text-emerald-200 text-sm">
                  <FaLock className="mr-2" />
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Người bán nói gì về chúng tôi
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Hơn 5,000 người bán đã chọn Retrend để bắt đầu kinh doanh thời trang
            bền vững
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Câu hỏi thường gặp
          </h2>
          <p className="text-gray-600 mb-8">
            Tìm câu trả lời cho những thắc mắc của bạn
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b border-gray-200 pb-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/faq"
              className="inline-flex items-center text-emerald-600 font-medium hover:underline"
            >
              Xem tất cả câu hỏi <FaExternalLinkAlt className="ml-2 text-sm" />
            </Link>
          </div>
        </div>
      </main>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu kinh doanh?
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-8">
            Tham gia cộng đồng người bán đang kiếm thu nhập ổn định từ việc bán
            hàng second-hand trên Retrend
          </p>
          <button
            onClick={handlePurchase}
            className="bg-white text-emerald-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center mx-auto"
          >
            <FaShoppingCart className="mr-2" />
            Đăng ký gói bán hàng ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default BecomeSellerPage;
