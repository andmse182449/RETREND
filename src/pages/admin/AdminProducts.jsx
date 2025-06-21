// src/pages/admin/AdminProducts.js
import React, { useState, useEffect, useCallback, useMemo } from "react"; // Added useMemoư
import {
  Tag,
  DollarSign,
  PlusCircle,
  Trash2,
  Search,
  Package,
  Edit,
  MoreHorizontal,
  Image,
  XCircle,
  Save,
  FileEdit,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { uploadImageToCloudinary } from "../../services/ImageUploadService";
import { Toaster, toast } from "react-hot-toast";
import { FaBoxOpen, FaCube, FaCamera, FaAlignLeft, FaDollarSign, FaSave, FaSpinner , FaImage} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

import {
  getAllAvailableProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminChangeProductStatus,
  assignProductsToBlindbox,
  getAllProductsForAssignBlindbox,
  getBlindboxName,
  getProductsByBlindboxName,
  // adminDeleteProduct, // TODO: Implement this in service
} from "../../services/ProductService"; // Adjust path

const getCurrentAdminUsername = () => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      return JSON.parse(user).username || "admin-default";
    } catch {
      return "admin-default";
    }
  }
  return "admin-default";
};

const formatPrice = (price) => {
  if (typeof price !== "number" || isNaN(price)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const getProductStatusInfo = (status) => {
  switch (status?.toLowerCase()) {
    case "available":
      return { text: "Đang bán", color: "text-blue-600", bg: "bg-blue-100" };
    case "pending":
      return { text: "Chờ duyệt", color: "text-amber-600", bg: "bg-amber-100" };
    case "sold":
      return { text: "Đã bán", color: "text-red-500", bg: "bg-red-100" };
    case "archived":
      return { text: "Lưu trữ", color: "text-gray-500", bg: "bg-gray-100" };
    case "denied":
      return {
        text: "Bị từ chối",
        color: "text-orange-600",
        bg: "bg-orange-100",
      };
    default:
      return {
        text: status || "Không rõ",
        color: "text-gray-700",
        bg: "bg-gray-200",
      };
  }
};

// --- Product Form Modal Component ---
function ProductModal({ product, isOpen, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    description: "",
  });
  
  const [images, setImages] = useState(Array(5).fill(null));
  const [imagePreviews, setImagePreviews] = useState(Array(5).fill(null));
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          productName: product.name || "",
          price: product.price?.toString() || "",
          description: product.description || "",
        });
        
        // Initialize images and previews from existing product
        const newImages = Array(5).fill(null);
        const newPreviews = Array(5).fill(null);
        
        if (product.images) {
          product.images.slice(0, 5).forEach((url, index) => {
            newImages[index] = url;
            newPreviews[index] = url;
          });
        }
        
        setImages(newImages);
        setImagePreviews(newPreviews);
      } else {
        setFormData({
          productName: "",
          price: "",
          description: "",
        });
        setImages(Array(5).fill(null));
        setImagePreviews(Array(5).fill(null));
      }
      setFormError(null);
    }
  }, [product, isOpen]);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPreviews = [...imagePreviews];
      newPreviews[index] = e.target.result;
      setImagePreviews(newPreviews);
    };
    reader.readAsDataURL(file);
    
    // Update images array
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    newImages[index] = null;
    newPreviews[index] = null;
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    const { productName, price, description } = formData;
    const priceValue = parseFloat(price);
    const nonEmptyImages = images.filter(img => img !== null);
    
    if (!productName.trim()) {
      setFormError("Product name is required.");
      return;
    }
    if (isNaN(priceValue)) {
      setFormError("Valid price is required.");
      return;
    }
    if (priceValue <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }
    if (!description.trim()) {
      setFormError("Description is required.");
      return;
    }
    if (nonEmptyImages.length === 0) {
      setFormError("At least one image is required.");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload new images to Cloudinary
      const uploadedImageUrls = [];
      
      for (const image of nonEmptyImages) {
        if (typeof image === 'string') {
          // Already a URL (from existing product)
          uploadedImageUrls.push(image);
        } else if (image instanceof File) {
          // New image to upload
          const uploadResponse = await uploadImageToCloudinary(image);
          uploadedImageUrls.push(uploadResponse.url);
        }
      }
      
      // Prepare data for API
      const apiPayload = {
        name: productName.trim(),
        price: priceValue,
        description: description.trim(),
        imageUrl: uploadedImageUrls.join(","),
      };
      
      if (product) {
        onSave({ ...apiPayload, productId: product.id });
      } else {
        onSave(apiPayload);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      setFormError(`Image upload failed: ${err.message || "Please try again"}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-auto border border-gray-200"
      >
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>
        
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm flex items-start gap-2">
            <XCircle className="flex-shrink-0 mt-0.5" size={16} />
            <span>{formError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center">
                <FaImage className="mr-2 text-purple-600" size={16} />
                Product Images <span className="text-red-500">*</span>
                <span className="ml-auto text-xs text-gray-500">
                  (Max 5 images, first image is the cover)
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
                          Image {i + 1}
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {images.filter(Boolean).length === 0 && (
              <p className="text-xs text-red-500 mt-2">
                Please upload at least one image.
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
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="productName"
                name="productName"
                type="text"
                value={formData.productName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/70 backdrop-blur-sm"
                placeholder="e.g. Vintage Silk Shirt"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                <div className="flex items-center">
                  <FileEdit className="mr-2 text-purple-600" size={16} />
                  Description <span className="text-red-500">*</span>
                </div>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/70 backdrop-blur-sm resize-none"
                placeholder="Describe the product condition, materials, size, or story..."
                required
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                <div className="flex items-center">
                  <DollarSign className="mr-2 text-purple-600" size={16} />
                  Price (VND) <span className="text-red-500">*</span>
                </div>
              </label>
              <div className="relative">
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-16 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 bg-white/70 backdrop-blur-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="e.g. 250000"
                  min="0"
                  required
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-medium">
                  VND
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isUploading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {(isLoading || isUploading) ? (
              <FaSpinner className="animate-spin mr-3" />
            ) : (
              <Save className="mr-3" size={18} />
            )}
            {isUploading ? "Uploading images..." : 
             isLoading ? "Saving..." : 
             product ? "Update Product" : "Add Product"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// --- Box Form Modal Component (Refactored) ---
function BoxModal({ isOpen, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({ name: "", productIds: [] });
  const [formError, setFormError] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      setFormData({ name: "", productIds: [] });
      setAvailableProducts([]);
      setLoadingProducts(true);
      // Lấy tên blindbox và danh sách sản phẩm assignable
      Promise.all([getBlindboxName(), getAllProductsForAssignBlindbox()])
        .then(([blindboxName, products]) => {
          setFormData((prev) => ({ ...prev, name: blindboxName || "" }));
          setAvailableProducts(products || []);
        })
        .finally(() => setLoadingProducts(false));
    }
  }, [isOpen]);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProductCheckbox = (productId) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
    setFormError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Box name is required.");
      return;
    }
    if (formData.productIds.length === 0) {
      setFormError("Box must contain at least one product.");
      return;
    }
    onSave({ ...formData });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-auto border border-gray-200 flex flex-col"
      >
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            Create New Mystery Box
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm flex items-start gap-2">
            <XCircle className="flex-shrink-0 mt-0.5" size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-grow flex flex-col gap-5">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Box Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="admin-input pl-9"
                placeholder="Enter box name"
                required
              />
              <FaBoxOpen
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto">
            <h3 className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-1.5">
              <FaCube className="text-indigo-500" size={14} />
              Select Products for Box
            </h3>

            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-sm">Loading products...</span>
              </div>
            ) : availableProducts.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <Package size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 custom-scrollbar-thin max-h-[300px] overflow-y-auto p-1">
                {availableProducts.map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-lg border p-3 transition-all cursor-pointer flex items-start gap-3 ${
                      formData.productIds.includes(p.id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    onClick={() => handleProductCheckbox(p.id)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={formData.productIds.includes(p.id)}
                        onChange={() => handleProductCheckbox(p.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatPrice(p.priceVND || p.price)}
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded border overflow-hidden">
                      <img
                        src={p.images?.[0] || "https://via.placeholder.com/40"}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 text-sm font-medium shadow-md disabled:opacity-70"
            >
              {isLoading ? (
                <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} className="text-white" />
              )}
              {isLoading ? "Creating..." : "Create Box"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
// --- Main AdminProducts Component (Mystery Box UI Refactor) ---
export default function AdminProducts() {
  const [allProducts, setAllProducts] = useState([]);
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingBoxes, setIsLoadingBoxes] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProductForModal, setCurrentProductForModal] = useState(null);
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [currentBoxForModal, setCurrentBoxForModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBoxName, setSelectedBoxName] = useState(null);
  const [productsInBox, setProductsInBox] = useState([]);
  const [loadingProductsInBox, setLoadingProductsInBox] = useState(false);
  const [latestBlindboxName, setLatestBlindboxName] = useState("");
  const [productsOfLatestBox, setProductsOfLatestBox] = useState([]);
  const [loadingLatestBox, setLoadingLatestBox] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    // setError(null); // Reset error specific to products if desired
    try {
      const productsData = await getAllAvailableProducts();
      setAllProducts(productsData || []);
    } catch (err) {
      console.error("AdminProducts: Failed to load products", err);
      setError((prevError) =>
        prevError
          ? `${prevError}\nFailed to load products.`
          : "Failed to load products."
      );
      setAllProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Fetch boxes (mock or real API if available)
  useEffect(() => {
    const fetchMysteryBoxes = async () => {
      setIsLoadingBoxes(true);
      try {
        // TODO: Replace with real API if available
        // XÓA mock data bên dưới:
        // setMysteryBoxes([
        //   { id: 1, name: "Small Vintage Box" },
        //   { id: 2, name: "Medium Premium Box" },
        // ]);
        // Nếu có API thực tế, gọi ở đây, ví dụ:
        // const boxes = await getAllBlindboxes();
        // setMysteryBoxes(boxes);
        setMysteryBoxes([]); // Nếu chưa có API, để rỗng
      } catch (err) {
        setMysteryBoxes([]);
      } finally {
        setIsLoadingBoxes(false);
      }
    };
    fetchMysteryBoxes();
  }, []);

  // Khi click vào 1 box, lấy danh sách sản phẩm
  const handleSelectBox = async (boxName) => {
    setSelectedBoxName(boxName);
    setLoadingProductsInBox(true);
    const products = await getProductsByBlindboxName(boxName);
    setProductsInBox(products);
    setLoadingProductsInBox(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Khi vào tab "boxes", tự động lấy tên blindbox mới nhất và danh sách sản phẩm của nó
  useEffect(() => {
    if (activeTab === "boxes") {
      const fetchLatestBoxAndProducts = async () => {
        setLoadingLatestBox(true);
        try {
          const blindboxName = await getBlindboxName();
          setLatestBlindboxName(blindboxName || "");
          if (blindboxName) {
            const products = await getProductsByBlindboxName(blindboxName);
            setProductsOfLatestBox(products);
          } else {
            setProductsOfLatestBox([]);
          }
        } catch (err) {
          setLatestBlindboxName("");
          setProductsOfLatestBox([]);
        } finally {
          setLoadingLatestBox(false);
        }
      };
      fetchLatestBoxAndProducts();
    }
  }, [activeTab]);

  const handleAddProductClick = () => {
    setCurrentProductForModal(null);
    setIsProductModalOpen(true);
  };
  const handleEditProductClick = (product) => {
    setCurrentProductForModal(product);
    setIsProductModalOpen(true);
  };

const handleSaveProduct = async (productFormData) => {
    setIsSubmitting(true);
    const adminUsername = getCurrentAdminUsername();
    
    try {
      if (productFormData.productId) {
        await adminUpdateProduct(productFormData);
        toast.success("Product updated successfully!");
      } else {
        await adminCreateProduct({
          ...productFormData,
          username: adminUsername,
        });
        toast.success("Product created successfully!");
      }
      await fetchProducts();
      setIsProductModalOpen(false);
      setCurrentProductForModal(null);
    } catch (err) {
      toast.error(`Error saving product: ${err.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteProduct = async (productId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      const isProductInBox = mysteryBoxes.some((box) =>
        box.productIds.includes(productId)
      );
      if (isProductInBox) {
        alert(
          "Cannot delete: Product is part of a mystery box. Remove it from boxes first."
        );
        return;
      }
      setIsLoadingProducts(true);
      try {
        // await adminDeleteProduct(productId); // TODO: Implement in service
        console.log(`Mock Deleting product ${productId}`); // Placeholder
        alert(
          `Mock: Product ${productId} deleted. Implement API call in service.`
        );
        await fetchProducts();
      } catch (err) {
        alert(`Error deleting product: ${err.message}`);
      } finally {
        setIsLoadingProducts(false);
      }
    }
  };

  const handleChangeProductStatus = async (productId, newStatus) => {
    /* ... (keep as is) ... */
    if (
      !window.confirm(
        `Change status of product ID ${productId} to "${newStatus}"?`
      )
    )
      return;
    setIsLoadingProducts(true); // Indicate loading on the product list
    try {
      await adminChangeProductStatus(productId, newStatus);
      // alert(`Product ${productId} status changed to ${newStatus}.`); // Optional success
      await fetchProducts(); // Re-fetch to show updated status
    } catch (err) {
      console.error(`Failed to change status for product ${productId}:`, err);
      alert(`Error changing status: ${err.message}`);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Tạo box mới

  const handleCreateBoxClick = () => {
    setIsBoxModalOpen(true);
  };

  const handleSaveBox = async (boxFormData) => {
    setIsSubmitting(true);
    try {
      // Gọi API assign với blindboxName (không dùng id)
      await assignProductsToBlindbox(boxFormData.name, boxFormData.productIds);
      alert("New Mystery Box created and products assigned.");
      setIsBoxModalOpen(false);
      // Có thể gọi lại fetchMysteryBoxes() nếu muốn cập nhật danh sách box
    } catch (err) {
      alert(`Error saving Mystery Box: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = useMemo(
    () =>
      allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [allProducts, searchTerm]
  );
  const filteredBoxes = useMemo(
    () =>
      mysteryBoxes.filter((box) =>
        box.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [mysteryBoxes, searchTerm]
  );

  const renderProductManagement = () => (
    <div className="mt-6 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-grow w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={handleAddProductClick}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 text-sm shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle size={18} /> Add New Product
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="admin-th">Product</th>
              <th className="admin-th">Price</th>
              <th className="admin-th">Status</th>
              <th className="admin-th text-center">Images</th>
              <th className="admin-th">Created</th>
              <th className="admin-th text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoadingProducts ? (
              <tr>
                <td colSpan="6" className="text-center py-16">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500">Loading products...</span>
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10">
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    <Package size={32} className="text-gray-400" />
                    <p>No products found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const statusInfo = getProductStatusInfo(product.status);
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="admin-td">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg overflow-hidden border shadow-sm">
                          <img
                            src={
                              product.images?.[0] ||
                              "https://via.placeholder.com/40"
                            }
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="admin-td font-medium text-sm text-gray-800">
                      {formatPrice(product.priceVND || product.price)}
                    </td>
                    <td className="admin-td">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${statusInfo.bg.replace(
                            "bg-",
                            "bg-"
                          )}`}
                        ></span>
                        <select
                          value={product.status || ""}
                          onChange={(e) =>
                            handleChangeProductStatus(
                              product.id,
                              e.target.value
                            )
                          }
                          className={`text-xs font-medium py-1 px-2 rounded border shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${statusInfo.bg} ${statusInfo.color}`}
                        >
                          <option value="Available">Available</option>
                          <option value="Pending">Pending</option>
                          <option value="Sold">Sold</option>
                          <option value="Archived">Archived</option>
                          <option value="Denied">Denied</option>
                        </select>
                      </div>
                    </td>
                    <td className="admin-td text-center">
                      <div className="inline-flex items-center justify-center bg-gray-100 rounded-full w-7 h-7">
                        <span className="text-xs font-medium text-gray-700">
                          {product.images?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="admin-td text-xs text-gray-500">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </td>
                    <td className="admin-td text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditProductClick(product)}
                          className="admin-action-button text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="admin-action-button text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <Link
                          to={`/products/${product.id}`}
                          target="_blank"
                          className="admin-action-button text-gray-500 hover:bg-gray-100"
                          title="View on site"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
        <span>
          Showing {filteredProducts.length} of {allProducts.length} products
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
            Active
          </span>
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
            All
          </span>
        </div>
      </div>
    </div>
  );

  // Enhanced mystery box management UI
  const renderMysteryBoxManagement = () => (
    <div className="mt-6 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Mystery Box Management
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage mystery boxes
            </p>
          </div>
          <button
            onClick={handleCreateBoxClick}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 text-sm shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <FaBoxOpen size={16} /> Create New Box
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-indigo-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaBoxOpen className="text-indigo-500" size={18} />
                Current Mystery Box
              </h4>
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            </div>

            {loadingLatestBox ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <span className="text-gray-500 text-sm">
                  Loading box details...
                </span>
              </div>
            ) : latestBlindboxName ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <h5 className="font-medium text-gray-700 mb-2">Box Name</h5>
                  <div className="text-lg font-bold text-indigo-700">
                    {latestBlindboxName}
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <h5 className="font-medium text-gray-700 mb-2">
                    Products in Box
                  </h5>
                  {productsOfLatestBox.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No products in this box
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar-thin p-1">
                      {productsOfLatestBox.map((p, idx) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 border rounded-md overflow-hidden">
                            <img
                              src={
                                p.images?.[0] ||
                                "https://via.placeholder.com/40"
                              }
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {p.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatPrice(p.priceVND || p.price)}
                            </div>
                          </div>
                          <span className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-white rounded-lg border-2 border-dashed border-gray-300">
                <FaBoxOpen className="mx-auto text-gray-400 mb-3" size={32} />
                <p className="text-gray-500 mb-4">No active mystery box</p>
                <button
                  onClick={handleCreateBoxClick}
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  <PlusCircle size={16} /> Create your first box
                </button>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FaCube className="text-gray-500" size={18} />
              Quick Statistics
            </h4>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="text-2xl font-bold text-gray-800">
                  {allProducts.length}
                </div>
                <div className="text-sm text-gray-500 mt-1">Total Products</div>
              </div>
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="text-2xl font-bold text-gray-800">
                  {allProducts.filter((p) => p.status === "Available").length}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Active Products
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h5 className="font-medium text-gray-700 mb-3">
                Recent Activity
              </h5>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <PlusCircle className="text-blue-600" size={16} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      You added{" "}
                      <span className="font-medium">Vintage Camera</span> to
                      products
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FaBoxOpen className="text-indigo-600" size={14} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      Created{" "}
                      <span className="font-medium">Premium Mystery Box</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            background: "#fff",
            color: "#333",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "16px",
            fontSize: "14px",
          },
        }}
      />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <LayoutDashboard size={28} className="text-indigo-600" />
            {activeTab === "products" ? "Quản Lý Sản Phẩm" : "Quản Lý Túi Mù"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm bg-gray-100 rounded-lg px-3 py-1.5">
            <span className="text-gray-600">Admin:</span>
            <span className="font-medium text-gray-800">
              {getCurrentAdminUsername()}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px ${
              activeTab === "products"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Package size={16} /> Products
          </button>
          <button
            onClick={() => setActiveTab("boxes")}
            className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px ${
              activeTab === "boxes"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FaBoxOpen size={16} /> Mystery Boxes
          </button>
        </div>
      </div>

      {activeTab === "products" && renderProductManagement()}
      {activeTab === "boxes" && renderMysteryBoxManagement()}

      <AnimatePresence>
        {isBoxModalOpen && (
          <BoxModal
            isOpen={isBoxModalOpen}
            onClose={() => setIsBoxModalOpen(false)}
            onSave={handleSaveBox}
            isLoading={isSubmitting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProductModalOpen && (
          <ProductModal
            product={currentProductForModal}
            isOpen={isProductModalOpen}
            onClose={() => {
              setIsProductModalOpen(false);
              setCurrentProductForModal(null);
            }}
            onSave={handleSaveProduct}
            isLoading={isSubmitting}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        .admin-input {
          @apply w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
        }
        .admin-th {
          @apply px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
        }
        .admin-td {
          @apply px-4 py-3 whitespace-nowrap text-sm;
        }
        .admin-action-button {
          @apply p-2 transition rounded-lg hover:bg-gray-100;
        }
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: #c5c5c5;
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}
