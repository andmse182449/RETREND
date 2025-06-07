// src/pages/admin/AdminProducts.js
import React, { useState, useEffect, useCallback, useMemo } from "react"; // Added useMemo
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
import { FaBoxOpen, FaCube } from "react-icons/fa";
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
    imageUrl: "",
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          productName: product.name || "",
          price: product.price?.toString() || "",
          description: product.description || "",
          imageUrl: product.images ? product.images.join(", ") : "",
        });
      } else {
        setFormData({
          productName: "",
          price: "",
          description: "",
          imageUrl: "",
        });
      }
      setFormError(null);
    }
  }, [product, isOpen]);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { productName, price, description, imageUrl } = formData;
    const priceValue = parseFloat(price);
    if (!productName.trim()) {
      setFormError("Product name is required.");
      return;
    }
    if (isNaN(priceValue) || priceValue <= 0) {
      setFormError("Valid price is required.");
      return;
    }
    if (!description.trim()) {
      setFormError("Description is required.");
      return;
    }
    if (!imageUrl.trim()) {
      setFormError("At least one image URL is required.");
      return;
    }

    const apiPayload = {
      name: productName.trim(),
      price: priceValue,
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    };
    if (product) {
      onSave({ ...apiPayload, productId: product.id });
    } else {
      onSave(apiPayload);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      {" "}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle size={24} />
          </button>
        </div>{" "}
        {formError && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm"
            role="alert"
          >
            {formError}
          </div>
        )}{" "}
        <form onSubmit={handleSubmit} className="space-y-4">
          {" "}
          <div>
            <label
              htmlFor="productNameModal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Name
            </label>
            <input
              id="productNameModal"
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              className="admin-input"
              required
            />
          </div>{" "}
          <div>
            <label
              htmlFor="productPriceModal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price (VND)
            </label>
            <input
              id="productPriceModal"
              type="number"
              step="1000"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="admin-input"
              required
            />
          </div>{" "}
          <div>
            <label
              htmlFor="descriptionModal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="descriptionModal"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="admin-input"
              required
            ></textarea>
          </div>{" "}
          <div>
            <label
              htmlFor="imageUrlModal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Image URLs (comma-separated)
            </label>
            <textarea
              id="imageUrlModal"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              rows="3"
              placeholder="https://example.com/image1.jpg, ..."
              className="admin-input"
              required
            ></textarea>
            {formData.imageUrl && (
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-24 overflow-y-auto">
                {formData.imageUrl
                  .split(",")
                  .map(
                    (url, index) =>
                      url.trim() && (
                        <img
                          key={index}
                          src={url.trim()}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-16 object-cover rounded border"
                        />
                      )
                  )}
              </div>
            )}
          </div>{" "}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isLoading
                ? product
                  ? "Saving..."
                  : "Adding..."
                : product
                ? "Save Changes"
                : "Add Product"}
            </button>
          </div>{" "}
        </form>{" "}
      </motion.div>{" "}
      <style jsx global>{`
        .admin-input {
          @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
        }
      `}</style>{" "}
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Create New Mystery Box</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle size={24} />
          </button>
        </div>
        {formError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm" role="alert">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="mb-4">
            <label htmlFor="boxNameModal" className="block text-sm font-medium text-gray-700 mb-1">
              Box Name
            </label>
            <input
              id="boxNameModal"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="admin-input"
              required
            />
          </div>
          <div className="mb-4 flex-grow overflow-y-auto">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">
              Select Products for Box
            </h3>
            {loadingProducts ? (
              <div className="text-gray-500 text-sm">Loading products...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableProducts.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 bg-gray-50 rounded p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.productIds.includes(p.id)}
                      onChange={() => handleProductCheckbox(p.id)}
                    />
                    <span className="text-gray-800">{p.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isLoading ? "Creating..." : "Create Box"}
            </button>
          </div>
        </form>
      </motion.div>
      <style jsx global>{`
        .admin-input {
          @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
        }
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
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
        // Editing
        await adminUpdateProduct(productFormData);
      } else {
        // Adding
        await adminCreateProduct({
          ...productFormData,
          username: adminUsername,
        });
      }
      await fetchProducts();
      setIsProductModalOpen(false);
      setCurrentProductForModal(null);
    } catch (err) {
      alert(`Error saving product: ${err.message || "Unknown error"}`); // Show error to user
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
    /* ... (JSX with product table, ensure it uses `filteredProducts`) ... */ <div className="mt-6 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
      {" "}
      <div className="p-5 md:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-grow w-full sm:max-w-xs md:max-w-sm">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <button
            onClick={handleAddProductClick}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 text-sm shadow-md transition-colors"
          >
            <PlusCircle size={18} /> Add New Product
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[768px]">
          {" "}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="admin-th">Product</th>
              <th className="admin-th">Price</th>
              <th className="admin-th">Status</th>
              <th className="admin-th text-center">Images</th>
              <th className="admin-th">Created At</th>
              <th className="admin-th text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoadingProducts ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  Loading products...
                </td>
              </tr>
            ) : error && filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-red-500">
                  {error.includes("products")
                    ? error
                    : "Error loading products."}
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  No products found.
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
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden border">
                          <img
                            src={
                              product.image || "https://via.placeholder.com/40"
                            }
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-3 min-w-0">
                          <div
                            className="font-medium text-gray-900 text-sm truncate"
                            title={product.name}
                          >
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
                      <select
                        value={product.status || ""}
                        onChange={(e) =>
                          handleChangeProductStatus(product.id, e.target.value)
                        }
                        className={`text-xs font-medium p-1 rounded border ${statusInfo.bg
                          .replace("bg-", "border-")
                          .replace("100", "300")} ${statusInfo.bg} ${
                          statusInfo.color
                        } focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500`}
                      >
                        <option value="Available">Available</option>
                        <option value="Pending">Pending</option>
                        <option value="Sold">Sold</option>
                        <option value="Archived">Archived</option>
                        <option value="Denied">Denied</option>
                      </select>
                    </td>
                    <td className="admin-td text-center">
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {product.images?.length || 0}
                      </span>
                    </td>
                    <td className="admin-td text-xs text-gray-500">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </td>
                    <td className="admin-td text-center">
                      <div className="flex items-center justify-center space-x-1 md:space-x-2">
                        <button
                          onClick={() => handleEditProductClick(product)}
                          className="admin-action-button text-blue-600 hover:bg-blue-100"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="admin-action-button text-red-500 hover:bg-red-100"
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
      <div className="px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
        Displaying {filteredProducts.length} of {allProducts.length} total
        products.
      </div>
    </div>
  );
  const renderMysteryBoxManagement = () => (
    /* ... (JSX with box table, ensure it uses `filteredBoxes` and `allProducts` for product names) ... */ <div className="mt-6 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 flex">
      <div className="w-1/2 border-r border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Box Name</h3>
        <div className="mb-6 text-blue-700 font-bold text-xl">
          {loadingLatestBox
            ? "Loading..."
            : latestBlindboxName || <span className="text-gray-400">No blindbox found</span>}
        </div>
        <div className="mb-4">
          <button
            onClick={handleCreateBoxClick}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 text-sm shadow-md transition-colors"
          >
            <FaBoxOpen size={18} /> Create New Box
          </button>
        </div>
        
      </div>
      <div className="w-1/2 p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Product in Box</h3>
        {loadingLatestBox ? (
          <div className="text-gray-500">Loading...</div>
        ) : productsOfLatestBox.length === 0 ? (
          <div className="text-gray-400 italic">No products in this box.</div>
        ) : (
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {productsOfLatestBox.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <LayoutDashboard size={28} className="text-blue-600" />
            {activeTab === "products"
              ? "Quản lý Sản phẩm"
              : "Quản lý Mystery Box"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === "products"
              ? "Xem, thêm, sửa, xóa và quản lý trạng thái sản phẩm."
              : "Tạo và cấu hình các hộp quà bí ẩn."}
          </p>
        </div>
      </div>
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("products")}
            className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium focus:outline-none ${
              activeTab === "products"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Package size={16} className="inline mr-1.5" /> Sản phẩm
          </button>
          <button
            onClick={() => setActiveTab("boxes")}
            className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium focus:outline-none ${
              activeTab === "boxes"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FaBoxOpen size={16} className="inline mr-1.5" /> Mystery Boxes
          </button>
        </nav>
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
          @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
        }
        .admin-th {
          @apply px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
        }
        .admin-td {
          @apply px-4 py-3 whitespace-nowrap text-sm;
        }
        .admin-action-button {
          @apply p-1.5 transition rounded-full;
        }
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
}
