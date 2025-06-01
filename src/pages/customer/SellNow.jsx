// src/pages/SellNow.js
import React, { useState, useEffect } from "react";
import {
  FaCamera,
  FaCheck,
  FaDollarSign,
  FaImage,
  FaAlignLeft,
  FaSave,
} from "react-icons/fa"; // Added more icons

export default function SellNow() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]); // Array to hold File objects or preview URLs
  const [imagePreviews, setImagePreviews] = useState([]);

  // Handle image selection and preview
  const handleImageChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      // Store the file object for submission
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);

      // Create a preview URL
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
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Basic validation
    if (
      !productName.trim() ||
      !description.trim() ||
      !price ||
      images.length === 0
    ) {
      alert("Vui lòng điền đầy đủ thông tin và tải lên ít nhất 1 ảnh.");
      return;
    }

    console.log("Submitting product:", {
      productName,
      description,
      price: parseFloat(price),
      images, // These are File objects
    });

    // --- TODO: API Submission Logic ---
    // 1. Upload images to a service like Cloudinary (get back URLs)
    //    This usually involves sending FormData for each image.
    //    Example:
    //    const uploadedImageUrls = [];
    //    for (const imageFile of images) {
    //      if (imageFile) {
    //          const formData = new FormData();
    //          formData.append('file', imageFile);
    //          formData.append('upload_preset', 'YOUR_CLOUDINARY_UPLOAD_PRESET');
    //          const res = await fetch(`https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, {
    //              method: 'POST',
    //              body: formData,
    //          });
    //          const data = await res.json();
    //          uploadedImageUrls.push(data.secure_url);
    //      }
    //    }
    //
    // 2. Create a payload for your backend API
    //    const productPayload = {
    //      productName,
    //      productDescription: description,
    //      price: parseFloat(price),
    //      imageUrl: uploadedImageUrls.join(','), // Comma-separated string of URLs
    //      username: "currentLoggedInUserUsername", // Get this from auth context/localStorage
    //      status: "Available" // or "Pending" for review
    //    };
    //
    // 3. Send productPayload to your backend endpoint (e.g., POST /v1.0/product/create)
    //    const token = localStorage.getItem('authToken');
    //    const response = await fetch(`${API_BASE_URL}/v1.0/product/create`, { // Adjust endpoint
    //        method: 'POST',
    //        headers: {
    //            'Content-Type': 'application/json',
    //            'Authorization': `Bearer ${token}`
    //        },
    //        body: JSON.stringify(productPayload)
    //    });
    //    if (response.ok) {
    //        alert("Sản phẩm đã được đăng bán thành công!");
    //        // Reset form or navigate away
    //        setProductName(''); setDescription(''); setPrice(''); setImages([]); setImagePreviews([]);
    //    } else {
    //        const errorData = await response.json().catch(()=>({message: "Lỗi không xác định"}));
    //        alert(`Lỗi đăng sản phẩm: ${errorData.message || response.statusText}`);
    //    }
    // --- END TODO ---

    alert("Chức năng đăng bán đang được phát triển!"); // Placeholder
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
        {/* Main Form Card */}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaImage className="mr-2 text-green-600" /> Hình ảnh sản phẩm{" "}
                <span className="text-red-500 ml-1">*</span>
                <span className="ml-auto text-xs text-gray-500">
                  (Tối đa 5 ảnh, ảnh đầu tiên là ảnh bìa)
                </span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-green-500 transition-colors group"
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
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) => handleImageChange(e, i)}
                          disabled={
                            imagePreviews.filter(Boolean).length >= 5 &&
                            !imagePreviews[i]
                          } // Disable if 5 images already and this slot is empty
                        />
                        <FaCamera className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors pointer-events-none" />
                        <span className="mt-1 text-xs text-gray-500 group-hover:text-green-500 pointer-events-none">
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
                className="block text-sm font-semibold text-gray-700 mb-1 flex items-center"
              >
                Tên sản phẩm <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none shadow-sm text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // Hide number spinners
                  placeholder="VD: 250000"
                  min="0"
                  required
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  VNĐ
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 shadow-md hover:shadow-lg flex items-center justify-center text-base"
            >
              <FaSave className="mr-2" /> Đăng Bán Ngay
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
    </div>
  );
}
