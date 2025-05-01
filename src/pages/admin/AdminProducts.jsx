import React, { useState, useEffect } from "react";
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
  LayoutDashboard
} from "lucide-react"; // Added more icons
import { FaBoxOpen ,FaCube  } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock Data ---
// Update product structure: add images array, remove category & stock
const initialProducts = [
  {
    id: 1,
    name: "Classic Beige Shirt",
    price: 49.99,
    // Removed category and stock
    images: [
      "https://via.placeholder.com/150/D3D3D3/000000?text=Shirt+Img+1", // Multiple placeholders
      "https://via.placeholder.com/150/A9A9A9/000000?text=Shirt+Img+2",
      "https://via.placeholder.com/150/808080/000000?text=Shirt+Img+3",
    ],
  },
  {
    id: 2,
    name: "Comfy Grey Tee",
    price: 29.99,
    images: [
      "https://via.placeholder.com/150/F5F5DC/000000?text=Tee+Img+1",
      "https://via.placeholder.com/150/C0C0C0/000000?text=Tee+Img+2",
    ],
  },
  {
    id: 3,
    name: "Navy Blue Polo",
    price: 39.99,
    images: ["https://via.placeholder.com/150/B0C4DE/000000?text=Polo+Img+1"],
  },
  {
    // Add some more variety
    id: 4,
    name: "Olive Green Sweatshirt",
    price: 65.0,
    images: [
      "https://via.placeholder.com/150/8FBC8F/000000?text=Sweat+Img+1",
      "https://via.placeholder.com/150/6B8E23/000000?text=Sweat+Img+2",
    ],
  },
  {
    id: 5,
    name: "Black Hoodie",
    price: 75.0,
    images: [
      "https://via.placeholder.com/150/000000/FFFFFF?text=Hoodie+Img+1",
      "https://via.placeholder.com/150/36454F/FFFFFF?text=Hoodie+Img+2",
      "https://via.placeholder.com/150/1E1E1E/FFFFFF?text=Hoodie+Img+3",
    ],
  },
];

// Mock Mystery Box Data
const initialMysteryBoxes = [
  { id: 101, name: "Small Vintage Box", productIds: [1, 3] }, // Box contains product 1 and 3
  { id: 102, name: "Medium Premium Box", productIds: [2, 4, 5] }, // Box contains product 2, 4, and 5
];
// -------------------

// --- Product Form Modal Component ---
function ProductModal({ product, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    images: [], // Store images as an array
    imageUrlsInput: "", // Separate state for textarea input (comma-separated URLs)
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (product) {
      // Editing existing product
      setFormData({
        name: product.name,
        price: product.price,
        images: product.images || [],
        imageUrlsInput: (product.images || []).join(", "), // Join array for textarea
      });
    } else {
      // Adding new product
      setFormData({ name: "", price: "", images: [], imageUrlsInput: "" });
    }
    setFormError(null); // Clear error on open
  }, [product, isOpen]); // Reset form when product or isOpen changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormError(null); // Clear error on change
  };

  const handleImageUrlsInputChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, imageUrlsInput: value });
    setFormError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, price, imageUrlsInput } = formData;
    const priceValue = parseFloat(price);

    // Validate input
    if (!name.trim()) {
      setFormError("Product name is required.");
      return;
    }
    if (isNaN(priceValue) || priceValue <= 0) {
      setFormError("Valid price is required.");
      return;
    }

    const imageArray = imageUrlsInput
      .split(",") // Split by comma
      .map((url) => url.trim()) // Trim whitespace
      .filter((url) => url); // Remove empty strings

    if (imageArray.length === 0) {
      setFormError("At least one image URL is required.");
      return;
    }

    onSave({
      ...product, // Include existing product properties if editing
      name: name.trim(),
      price: priceValue,
      images: imageArray,
    });

    onClose(); // Close modal after saving
  };

  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing
      >
        <h2 className="text-xl font-bold mb-4">
          {product ? "Edit Product" : "Add New Product"}
        </h2>

        {formError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="productName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Name
            </label>
            <input
              id="productName"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="productPrice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price ($)
            </label>
            <input
              id="productPrice"
              type="number"
              step="0.01" // Allow decimals
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="imageUrls"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Image URLs (Comma-separated)
            </label>
            <textarea
              id="imageUrls"
              name="imageUrlsInput"
              value={formData.imageUrlsInput}
              onChange={handleImageUrlsInputChange}
              rows="4"
              placeholder="Paste image URLs here, separated by commas"
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            ></textarea>
            {formData.images.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {formData.images.map((imgSrc, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 rounded overflow-hidden"
                  >
                    <img
                      src={imgSrc}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button" // Important: Use type="button" to prevent form submission
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center gap-2"
            >
              <Save size={18} />
              {product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// --- Box Form Modal Component ---
// Needs access to the full list of products to select from
function BoxModal({ box, isOpen, onClose, onSave, availableProducts }) {
  const [formData, setFormData] = useState({
    name: "",
    productIds: [],
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (box) {
      // Editing existing box
      setFormData({
        name: box.name,
        productIds: box.productIds || [],
      });
    } else {
      // Adding new box
      setFormData({ name: "", productIds: [] });
    }
    setFormError(null);
  }, [box, isOpen]); // Reset form when box or isOpen changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormError(null);
  };

  // Handler for selecting/deselecting products for the box
  const handleProductSelection = (productId, isSelected) => {
    setFormData((prevData) => {
      const currentIds = prevData.productIds;
      if (isSelected && !currentIds.includes(productId)) {
        return { ...prevData, productIds: [...currentIds, productId] };
      } else if (!isSelected && currentIds.includes(productId)) {
        return {
          ...prevData,
          productIds: currentIds.filter((id) => id !== productId),
        };
      }
      return prevData; // No change
    });
    setFormError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, productIds } = formData;

    // Validate input
    if (!name.trim()) {
      setFormError("Box name is required.");
      return;
    }
    if (productIds.length === 0) {
      setFormError("A mystery box must contain at least one product.");
      return;
    }

    onSave({
      ...box, // Include existing box properties if editing
      name: name.trim(),
      productIds: productIds, // productIds are already managed in state
    });

    onClose(); // Close modal after saving
  };

  if (!isOpen) return null;

  // Find actual product objects for selected IDs (for displaying in the list)
  const selectedProducts = formData.productIds
    .map((id) => availableProducts.find((p) => p.id === id))
    .filter((p) => p); // Remove any nulls if product IDs are invalid/missing

  // Filter out products already selected from the available list
  const unselectedProducts = availableProducts.filter(
    (p) => !formData.productIds.includes(p.id)
  );

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" // Wider modal, allow scrolling
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          {box ? "Edit Mystery Box" : "Create New Mystery Box"}
        </h2>

        {formError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="boxName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Box Name
            </label>
            <input
              id="boxName"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {" "}
            {/* Split product selection into 2 columns */}
            {/* Column 1: Products in this box */}
            <div>
              <h3 className="text-base font-semibold mb-3 text-gray-700">
                Products in Box ({selectedProducts.length})
              </h3>
              <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto p-2 space-y-2">
                {" "}
                {/* Scrollable list */}
                {selectedProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No products selected yet.
                  </p>
                ) : (
                  selectedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-gray-100 rounded p-2"
                    >
                      <span className="text-sm text-gray-800 flex items-center gap-2">
                        <FaCube size={16} />
                        {p.name} (ID: {p.id})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleProductSelection(p.id, false)} // Deselect
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Remove ${p.name}`}
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Column 2: Available Products */}
            <div>
              <h3 className="text-base font-semibold mb-3 text-gray-700">
                Available Products ({unselectedProducts.length})
              </h3>
              <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto p-2 space-y-2">
                {" "}
                {/* Scrollable list */}
                {availableProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No products available to add.
                  </p>
                ) : (
                  unselectedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between hover:bg-gray-50 rounded p-2 cursor-pointer"
                      onClick={() => handleProductSelection(p.id, true)}
                    >
                      {" "}
                      {/* Select on click */}
                      <span className="text-sm text-gray-800 flex items-center gap-2">
                        <FaCube size={16} />
                        {p.name} (ID: {p.id})
                      </span>
                      {/* No button needed, whole row is clickable */}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>{" "}
          {/* End grid */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center gap-2"
            >
              <Save size={18} />
              {box ? "Save Box" : "Create Box"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// --- Main AdminProducts Component ---
export default function AdminProducts() {
  const [products, setProducts] = useState(initialProducts); // List of all products
  const [mysteryBoxes, setMysteryBoxes] = useState(initialMysteryBoxes); // List of all mystery boxes
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'boxes'

  // State for Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProductForModal, setCurrentProductForModal] = useState(null); // Null for add, product object for edit

  // State for Box Modal
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [currentBoxForModal, setCurrentBoxForModal] = useState(null); // Null for add, box object for edit

  // --- Product Management Handlers ---
  const handleAddProductClick = () => {
    setCurrentProductForModal(null); // Open modal in "Add" mode
    setIsProductModalOpen(true);
  };

  const handleEditProductClick = (product) => {
    setCurrentProductForModal(product); // Open modal in "Edit" mode with product data
    setIsProductModalOpen(true);
  };

  // This handler receives the validated data from ProductModal
  const handleSaveProduct = (productData) => {
    if (productData.id) {
      // Update existing product
      setProducts(
        products.map((p) => (p.id === productData.id ? productData : p))
      );

      // Also need to update any boxes that contain this product if its details changed
      // (Though the BoxModal doesn't currently display product details directly, just IDs)
      // This is a complexity edge case for this simple example.
    } else {
      // Add new product
      const newId =
        products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      const newProduct = { ...productData, id: newId };
      setProducts([...products, newProduct]);
    }
    // Close modal and reset current product state handled inside Modal onSubmit
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      // Check if the product is in any mystery box before deleting
      const isProductInBox = mysteryBoxes.some((box) =>
        box.productIds.includes(id)
      );

      if (isProductInBox) {
        alert(
          "Cannot delete product as it is included in one or more mystery boxes. Please remove it from the boxes first."
        );
        return;
      }

      setProducts(products.filter((p) => p.id !== id));
    }
  };

  // --- Mystery Box Management Handlers ---
  const handleCreateBoxClick = () => {
    setCurrentBoxForModal(null); // Open modal in "Create" mode
    setIsBoxModalOpen(true);
  };

  const handleEditBoxClick = (box) => {
    setCurrentBoxForModal(box); // Open modal in "Edit" mode with box data
    setIsBoxModalOpen(true);
  };

  // This handler receives the validated data from BoxModal
  const handleSaveBox = (boxData) => {
    if (boxData.id) {
      // Update existing box
      setMysteryBoxes(
        mysteryBoxes.map((b) => (b.id === boxData.id ? boxData : b))
      );
    } else {
      // Create new box
      const newId =
        mysteryBoxes.length > 0
          ? Math.max(...mysteryBoxes.map((b) => b.id)) + 1
          : 1;
      const newBox = { ...boxData, id: newId };
      setMysteryBoxes([...mysteryBoxes, newBox]);
    }
    // Close modal and reset current box state handled inside Modal onSubmit
  };

  const handleDeleteBox = (id) => {
    if (window.confirm("Are you sure you want to delete this mystery box?")) {
      setMysteryBoxes(mysteryBoxes.filter((b) => b.id !== id));
    }
  };

  // Filter products based on search term (only for product tab)
  // Filter boxes based on search term (only for box tab)
  const filteredProducts =
    activeTab === "products"
      ? products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
          // Category filter removed
        )
      : []; // Only calculate if product tab is active

  const filteredBoxes =
    activeTab === "boxes"
      ? mysteryBoxes.filter(
          (box) => box.name.toLowerCase().includes(searchTerm.toLowerCase())
          // Could potentially search within product names in the box, but keeps it simple for now
        )
      : []; // Only calculate if box tab is active

  // --- Render Functions for Tabs ---

  const renderProductManagement = () => (
    <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
      {" "}
      {/* Added margin top for spacing below tabs */}
      {/* Product Toolbar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name..." // Updated placeholder
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Removed unnecessary filter buttons */}
          {/* Add Product Button */}
          <button
            onClick={handleAddProductClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Add New Product
          </button>
        </div>
      </div>
      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {/* Removed category and stock headers */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              {/* Changed images header */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Images Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500">
                  No products found matching your search.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                        {/* Show the first image if available */}
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Image
                            size={24}
                            className="text-gray-400 w-full h-full flex items-center justify-center"
                          /> // Placeholder icon
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {product.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Removed Category column */}
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    ${product.price?.toFixed(2) || "N/A"}
                  </td>{" "}
                  {/* Use safe access */}
                  {/* Removed Stock column, replaced with Image Count */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {product.images?.length || 0} images
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {/* Edit Button - opens Product Modal */}
                      <button
                        onClick={() => handleEditProductClick(product)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition"
                        aria-label={`Edit product ${product.name}`}
                      >
                        <Edit size={18} />
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition"
                        aria-label={`Delete product ${product.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                      {/* Removed MoreHorizontal */}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Placeholder */}
      {/* Total count shows only current filtered list size */}
      <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
        Showing {filteredProducts.length} product(s){" "}
        {products.length > filteredProducts.length
          ? `(filtered from ${products.length})`
          : ""}
        .
        {/* Removed actual pagination buttons as full pagination is complex and depends on backend */}
      </div>
    </div>
  );

  const renderMysteryBoxManagement = () => (
    <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
      {" "}
      {/* Added margin top */}
      {/* Mystery Box Toolbar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search boxes by name..."
              value={searchTerm} // Use the same search term state
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Add Box Button */}
          <button
            onClick={handleCreateBoxClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2"
          >
            <FaBoxOpen size={18} /> {/* Using FaBoxOpen icon */}
            Create New Box
          </button>
        </div>
      </div>
      {/* Mystery Box Table/List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Box Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Included Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBoxes.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-10 text-gray-500">
                  No mystery boxes found matching your search.
                </td>
              </tr>
            ) : (
              filteredBoxes.map((box) => {
                // Find the actual product details for the IDs in the box
                const includedProducts = box.productIds
                  .map((id) => products.find((p) => p.id === id)) // products is the full list of products
                  .filter((p) => p); // Filter out any undefined/null if IDs don't match products

                return (
                  <tr key={box.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {box.name}
                      </div>
                      <div className="text-sm text-gray-500">ID: {box.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      {includedProducts.length === 0 ? (
                        <span className="text-sm text-gray-500 italic">
                          No products added.
                        </span>
                      ) : (
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {/* List the names of products in the box */}
                          {includedProducts.map((p) => (
                            <li key={p.id} className="flex items-center">
                              <FaCube size={12} className="mr-1 flex-shrink-0" />
                              {p.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {/* Edit Button - opens Box Modal */}
                        <button
                          onClick={() => handleEditBoxClick(box)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition"
                          aria-label={`Edit mystery box ${box.name}`}
                        >
                          <Edit size={18} />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteBox(box.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition"
                          aria-label={`Delete mystery box ${box.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Placeholder */}
      {/* Total count shows only current filtered list size */}
      <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
        Showing {filteredBoxes.length} box(es){" "}
        {mysteryBoxes.length > filteredBoxes.length
          ? `(filtered from ${mysteryBoxes.length})`
          : ""}
        .
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Main Page Title */}
      <div className="flex justify-between items-center mb-6">
        {" "}
        {/* Adjusted bottom margin */}
        <div>
          {/* Dynamically change main title based on active tab */}
          <h1 className="text-3xl font-bold text-gray-800">
            {activeTab === "products"
              ? "Product Management"
              : "Mystery Box Management"}
          </h1>
          <p className="text-gray-500 mt-1">
            {activeTab === "products"
              ? "Manage individual products and images."
              : "Create and configure mystery box contents."}
          </p>
        </div>
        {/* No add user button */}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        {" "}
        {/* Added bottom margin */}
        <button
          onClick={() => setActiveTab("products")}
          className={`py-2 px-4 -mb-px border-b-2 text-sm font-medium focus:outline-none ${
            activeTab === "products"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Package size={16} className="inline mr-1" /> Products
        </button>
        <button
          onClick={() => setActiveTab("boxes")}
          className={`ml-4 py-2 px-4 -mb-px border-b-2 text-sm font-medium focus:outline-none ${
            activeTab === "boxes"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <FaBoxOpen size={16} className="inline mr-1" /> Mystery Boxes
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === "products" && renderProductManagement()}
      {activeTab === "boxes" && renderMysteryBoxManagement()}

      {/* Product Add/Edit Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <ProductModal
            product={currentProductForModal} // Null for add, object for edit
            isOpen={isProductModalOpen}
            onClose={() => setIsProductModalOpen(false)}
            onSave={handleSaveProduct}
          />
        )}
      </AnimatePresence>

      {/* Box Add/Edit Modal */}
      <AnimatePresence>
        {isBoxModalOpen && (
          <BoxModal
            box={currentBoxForModal} // Null for create, object for edit
            isOpen={isBoxModalOpen}
            onClose={() => setIsBoxModalOpen(false)}
            onSave={handleSaveBox}
            availableProducts={products} // Pass the list of products to the box modal
          />
        )}
      </AnimatePresence>
    </div>
  );
}
