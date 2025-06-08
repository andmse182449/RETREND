import React, { useState, useEffect } from "react"; // Removed useEffect if not directly used for other purposes
import { useNavigate } from "react-router-dom"; // For navigation after success
import {
  FaCamera,
  FaCheck,
  FaDollarSign,
  FaImage,
  FaAlignLeft,
  FaSave,
  FaSpinner,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // For modal animations

import { sellerCreateProduct } from "../../services/ProductService"; // Corrected import name
import { uploadImageToCloudinary } from "../../services/ImageUploadService"; // NEW IMPORT
import MembershipPromptModal from "../../components/MembershipPromptModal"; // NEW IMPORT
import PostSuccessModal from "../../components/PostSuccessModal"; // NEW IMPORT

export default function SellNow() {
  const navigate = useNavigate(); // For navigation

  const initialFormState = { productName: "", description: "", price: "" };
  const [formState, setFormState] = useState(initialFormState);
  const [images, setImages] = useState(Array(5).fill(null)); // Array to hold File objects for 5 slots
  const [imagePreviews, setImagePreviews] = useState(Array(5).fill(null)); // For preview URLs

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
              // Check custom flag from imageUploadService
              setMembershipModalMessage(
                uploadError.message || "Vui lòng nâng cấp tài khoản để tải ảnh."
              );
              setShowMembershipModal(true);
              setIsLoading(false);
              return;
            }
            // If image upload fails for other reasons, re-throw to be caught by main catch
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
      // Form reset is now handled by modal actions
    } catch (error) {
      // Catches errors from image upload OR sellerCreateProduct
      console.error("Lỗi trong quá trình đăng sản phẩm:", error);
      // Check if the error is the specific "out of posts" error from sellerCreateProduct
      // error.data might contain { message: "...", errorCode: 16 }
      // error.status would be 400
      if (error.data && error.data.errorCode === 16 && error.status === 400) {
        setMembershipModalMessage(
          error.message ||
            "Bạn đã hết lượt đăng sản phẩm. Vui lòng mua thêm gói dịch vụ."
        );
        setShowMembershipModal(true);
      } else if (error.isMembershipError) {
        // This was already handled for image upload, but good to have as a fallback
        setMembershipModalMessage(
          error.message || "Có vẻ như có vấn đề với quyền đăng bài của bạn."
        );
        setShowMembershipModal(true);
      } else {
        // For other errors
        setFormError(
          error.message ||
            "Đã có lỗi xảy ra khi đăng sản phẩm. Vui lòng thử lại."
        );
      }
    } finally {
      //isLoading will be set to false by modal close handlers or if no modal shown
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
    setShowMembershipModal(false); // Ensure this is also closed
    setIsLoading(false); // Ensure loading is stopped
    setFormError(null);
    setLastCreatedProductId(null);
  };

  // --- Animated Background Style ---
  // Using inline style for simplicity, can be moved to CSS/Tailwind config
  const animatedBackgroundStyle = {
    background: `linear-gradient(-45deg, #EEF7F2, #D9E8E0, #C2D9CE, #AAD9C1)`, // Soft green tones
    backgroundSize: `400% 400%`,
    animation: `gradientBG 20s ease infinite`,
  };

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-all duration-500"
      style={animatedBackgroundStyle}
    >
      <style jsx global>{`
        @keyframes gradientBG {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8 transform transition-all hover:scale-[1.01] duration-300">
          <div className="text-center mb-8">
            <FaCamera className="mx-auto h-12 w-12 text-green-600 mb-3" />
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Đăng Bán Sản Phẩm
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Chia sẻ món đồ của bạn với cộng đồng Retrend!
            </p>
          </div>

          {formError && !showMembershipModal && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm text-center">
              {formError}
            </div>
          )}

          {/* Image Upload Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaImage className="mr-2 text-green-600" /> Hình ảnh{" "}
                <span className="text-red-500 ml-1">*</span>
                <span className="ml-auto text-xs text-gray-500">
                  (Tối đa 5, ảnh đầu tiên là ảnh bìa)
                </span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-green-500 transition-colors group bg-gray-50"
                  >
                    {imagePreviews[i] ? (
                      <>
                        <img
                          src={imagePreviews[i]}
                          alt={`Preview ${i + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          aria-label="Remove image"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-2 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => handleImageChange(e, i)}
                          disabled={images.filter(Boolean).length >= 5}
                        />
                        <FaCamera className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors pointer-events-none" />
                        <span className="mt-1 text-[10px] text-gray-500 group-hover:text-green-500 pointer-events-none leading-tight">
                          Ảnh {i + 1}
                        </span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
              {images.filter(Boolean).length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Vui lòng tải lên ít nhất 1 ảnh.
                </p>
              )}
            </div>
            {/* Product Name */}
            <div>
              <label
                htmlFor="productName"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Tên sản phẩm <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="productName"
                name="productName"
                type="text"
                value={formState.productName}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none shadow-sm text-sm"
                placeholder="VD: Áo Sơ Mi Lụa Vintage Hoa Nhí"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-1 flex items-center"
              >
                <FaAlignLeft className="mr-2 text-green-600" /> Mô tả chi tiết{" "}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none shadow-sm text-sm"
                placeholder="Mô tả tình trạng, chất liệu, kích thước (nếu có), hoặc câu chuyện về sản phẩm..."
                required
              ></textarea>
            </div>

            {/* Selling Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-semibold text-gray-700 mb-1 flex items-center"
              >
                <FaDollarSign className="mr-2 text-green-600" /> Giá bán (VNĐ){" "}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={formState.price}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-12 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none shadow-sm text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // Hide number spinners
                  placeholder="VD: 250000"
                  min="0"
                  required
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                  VNĐ
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 shadow-md hover:shadow-lg flex items-center justify-center text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSave className="mr-2" />
              )}
              {isLoading ? "Đang xử lý..." : "Đăng Bán Ngay"}
            </button>
          </form>
        </div>

        {/* Selling Tips Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 transform transition-all hover:scale-[1.01] duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Mẹo Đăng Bán Hiệu Quả
          </h3>
          <ul className="space-y-2.5 text-sm text-gray-700">
            {[
              "Sử dụng ánh sáng tự nhiên để chụp ảnh rõ nét, thể hiện đúng màu sắc.",
              "Chụp nhiều góc độ: mặt trước, mặt sau, chi tiết đặc biệt, và nhãn mác.",
              "Mô tả trung thực về tình trạng sản phẩm, bao gồm cả các khuyết điểm nhỏ (nếu có).",
              "Cung cấp thông tin về kích thước, chất liệu rõ ràng.",
              "Đặt một mức giá hợp lý, bạn có thể tham khảo các sản phẩm tương tự.",
            ].map((tip, i) => (
              <li key={i} className="flex items-start">
                <FaCheck className="w-4 h-4 text-green-500 mr-2.5 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Modals */}
      <AnimatePresence>
        {showMembershipModal && (
          <MembershipPromptModal
            isOpen={showMembershipModal}
            onClose={() => {
              setShowMembershipModal(false);
              setIsLoading(false); /* Clear other states if needed */
            }}
            onBuyMembership={() => navigate("/seller-register")} // Example action
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
      <style jsx global>{`
        .form-input-sellnow {
          @apply w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none shadow-sm text-sm;
        }
      `}</style>
    </div>
  );
}
