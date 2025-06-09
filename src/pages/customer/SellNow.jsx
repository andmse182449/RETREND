import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCamera,
  FaCheck,
  FaDollarSign,
  FaImage,
  FaAlignLeft,
  FaSave,
  FaSpinner,
  FaStore,
  FaArrowRight,
  FaLightbulb,
  FaStar,
  FaUsers,
  FaTags,
  FaShoppingBag,
  FaGift,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import { sellerCreateProduct } from "../../services/ProductService";
import { uploadImageToCloudinary } from "../../services/ImageUploadService";
import MembershipPromptModal from "../../components/MembershipPromptModal";
import PostSuccessModal from "../../components/PostSuccessModal";

export default function SellNow() {
  const navigate = useNavigate();

  const initialFormState = { productName: "", description: "", price: "" };
  const [formState, setFormState] = useState(initialFormState);
  const [images, setImages] = useState(Array(5).fill(null));
  const [imagePreviews, setImagePreviews] = useState(Array(5).fill(null));

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [membershipModalMessage, setMembershipModalMessage] = useState("");
  const [showPostSuccessModal, setShowPostSuccessModal] = useState(false);
  const [lastCreatedProductId, setLastCreatedProductId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newImagePreviews = [...imagePreviews];
        newImagePreviews[index] = reader.result;
        setImagePreviews(newImagePreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (indexToRemove) => {
    const newImages = [...images];
    newImages[indexToRemove] = null;
    setImages(newImages);

    const newImagePreviews = [...imagePreviews];
    newImagePreviews[indexToRemove] = null;
    setImagePreviews(newImagePreviews);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const filledImages = images.filter(Boolean);
    if (
      !formState.productName.trim() ||
      !formState.description.trim() ||
      !formState.price ||
      filledImages.length === 0
    ) {
      setFormError("Vui lòng điền đầy đủ thông tin và tải lên ít nhất 1 ảnh.");
      return;
    }
    if (
      isNaN(parseFloat(formState.price)) ||
      parseFloat(formState.price) <= 0
    ) {
      setFormError("Giá sản phẩm phải là một số dương.");
      return;
    }

    setIsLoading(true);
    setFormError(null);
    setShowMembershipModal(false);
    setShowPostSuccessModal(false);

    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Bạn cần đăng nhập để thực hiện thao tác này.");
      }

      // Step 1: Upload Images
      let uploadedImageUrls = [];
      for (const imageFile of filledImages) {
        if (imageFile instanceof File) {
          try {
            const uploadResponse = await uploadImageToCloudinary(
              imageFile,
              authToken
            );
            uploadedImageUrls.push(uploadResponse.url);
          } catch (uploadError) {
            if (uploadError.isMembershipError) {
              setMembershipModalMessage(
                uploadError.message || "Vui lòng nâng cấp tài khoản để tải ảnh."
              );
              setShowMembershipModal(true);
              setIsLoading(false);
              return;
            }
            throw new Error(
              `Lỗi tải ảnh "${imageFile.name}": ${uploadError.message}`
            );
          }
        } else if (
          typeof imageFile === "string" &&
          imageFile.startsWith("http")
        ) {
          uploadedImageUrls.push(imageFile);
        }
      }
      if (uploadedImageUrls.length === 0 && filledImages.length > 0) {
        throw new Error("Không có ảnh nào được tải lên thành công.");
      }

      const storedUser = localStorage.getItem("user");
      let currentUsername = "default_seller";
      if (storedUser) {
        try {
          currentUsername = JSON.parse(storedUser).username || currentUsername;
        } catch (e) {
          /* ignore */
        }
      }

      const productDataForApi = {
        username: currentUsername,
        name: formState.productName,
        description: formState.description,
        price: parseFloat(formState.price),
        imageUrl: uploadedImageUrls.join(","),
      };

      // Step 2: Call sellerCreateProduct
      const createdProduct = await sellerCreateProduct(productDataForApi);

      console.log("Product created successfully:", createdProduct);
      setLastCreatedProductId(createdProduct?.id);
      setShowPostSuccessModal(true);
    } catch (error) {
      console.error("Lỗi trong quá trình đăng sản phẩm:", error);
      if (error.data && error.data.errorCode === 16 && error.status === 400) {
        setMembershipModalMessage(
          error.message ||
            "Bạn đã hết lượt đăng sản phẩm. Vui lòng mua thêm gói dịch vụ."
        );
        setShowMembershipModal(true);
      } else if (error.isMembershipError) {
        setMembershipModalMessage(
          error.message || "Có vẻ như có vấn đề với quyền đăng bài của bạn."
        );
        setShowMembershipModal(true);
      } else {
        setFormError(
          error.message ||
            "Đã có lỗi xảy ra khi đăng sản phẩm. Vui lòng thử lại."
        );
      }
    } finally {
      if (!showMembershipModal && !showPostSuccessModal) {
        setIsLoading(false);
      }
    }
  };

  // Handlers for PostSuccessModal
  const handleViewProduct = () => {
    if (lastCreatedProductId) {
      navigate(`/products/${lastCreatedProductId}`);
    }
    resetFormAndModals();
  };

  const handleListAnother = () => {
    resetFormAndModals();
  };

  const handleCloseMembershipModal = () => {
    setShowMembershipModal(false);
    setIsLoading(false);
  };

  const handleNavigateToMembershipPage = () => {
    setShowMembershipModal(false);
    setIsLoading(false);
    navigate("/membership");
  };

  const resetFormAndModals = () => {
    setFormState(initialFormState);
    setImages(Array(5).fill(null));
    setImagePreviews(Array(5).fill(null));
    setShowPostSuccessModal(false);
    setShowMembershipModal(false);
    setIsLoading(false);
    setFormError(null);
    setLastCreatedProductId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                <FaStore className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Bán Hàng Trên Retrend
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Biến những món đồ cũ thành thu nhập mới. Kết nối với hàng nghìn
                khách hàng tiềm năng ngay hôm nay!
              </p>
            </motion.div>

            {/* CTA Button for Seller Registration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <button
                onClick={() => navigate("/seller-register")}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
              >
                <FaGift className="mr-3 group-hover:rotate-12 transition-transform" />
                Đăng Ký Gói Bán Hàng
                <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {[
              { icon: FaUsers, number: "50K+", label: "Người dùng hoạt động" },
              { icon: FaShoppingBag, number: "10K+", label: "Sản phẩm đã bán" },
              { icon: FaStar, number: "4.8", label: "Đánh giá trung bình" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tips */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center mb-4">
                <FaLightbulb className="w-6 h-6 text-yellow-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Mẹo Bán Hàng Hiệu Quả
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Chụp ảnh với ánh sáng tự nhiên",
                  "Mô tả chi tiết và trung thực",
                  "Đặt giá cạnh tranh hợp lý",
                  "Phản hồi khách hàng nhanh chóng",
                  "Cung cấp thông tin kích thước rõ ràng",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start">
                    <FaCheck className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8"
            >
              <div className="text-center mb-8">
                <FaCamera className="mx-auto h-12 w-12 text-purple-600 mb-3" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Đăng Sản Phẩm Mới
                </h2>
                <p className="text-gray-600">
                  Chia sẻ món đồ của bạn với cộng đồng!
                </p>
              </div>

              {formError && !showMembershipModal && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <div className="flex items-center">
                      <FaImage className="mr-2 text-purple-600" />
                      Hình ảnh sản phẩm <span className="text-red-500">*</span>
                      <span className="ml-auto text-xs text-gray-500">
                        (Tối đa 5 ảnh, ảnh đầu tiên là ảnh bìa)
                      </span>
                    </div>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="relative group">
                        <div className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-purple-500 transition-all duration-300 bg-gray-50 hover:bg-purple-50">
                          {imagePreviews[i] ? (
                            <>
                              <img
                                src={imagePreviews[i]}
                                alt={`Preview ${i + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:bg-red-600"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-3">
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                onChange={(e) => handleImageChange(e, i)}
                                disabled={images.filter(Boolean).length >= 5}
                              />
                              <FaCamera className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors mb-1" />
                              <span className="text-xs text-gray-500 group-hover:text-purple-500 text-center leading-tight">
                                Ảnh {i + 1}
                              </span>
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {images.filter(Boolean).length === 0 && (
                    <p className="text-xs text-red-500 mt-2">
                      Vui lòng tải lên ít nhất 1 ảnh.
                    </p>
                  )}
                </div>

                {/* Product Info */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label
                      htmlFor="productName"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="productName"
                      name="productName"
                      type="text"
                      value={formState.productName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/70 backdrop-blur-sm"
                      placeholder="VD: Áo Sơ Mi Lụa Vintage Hoa Nhí"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      <div className="flex items-center">
                        <FaAlignLeft className="mr-2 text-purple-600" />
                        Mô tả chi tiết <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formState.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/70 backdrop-blur-sm resize-none"
                      placeholder="Mô tả tình trạng, chất liệu, kích thước, hoặc câu chuyện về sản phẩm..."
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      <div className="flex items-center">
                        <FaDollarSign className="mr-2 text-purple-600" />
                        Giá bán (VNĐ) <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        id="price"
                        name="price"
                        type="number"
                        value={formState.price}
                        onChange={handleInputChange}
                        className="w-full pl-4 pr-16 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/70 backdrop-blur-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="VD: 250000"
                        min="0"
                        required
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-medium">
                        VNĐ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin mr-3" />
                  ) : (
                    <FaSave className="mr-3" />
                  )}
                  {isLoading ? "Đang xử lý..." : "Đăng Bán Ngay"}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showMembershipModal && (
          <MembershipPromptModal
            isOpen={showMembershipModal}
            onClose={handleCloseMembershipModal}
            onBuyMembership={() => navigate("/seller-register")}
          />
        )}
        {showPostSuccessModal && lastCreatedProductId && (
          <PostSuccessModal
            isOpen={showPostSuccessModal}
            onClose={resetFormAndModals}
            onViewProduct={handleViewProduct}
            onListAnother={handleListAnother}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
