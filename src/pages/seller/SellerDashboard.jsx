import React, { useState } from "react";
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch } from "react-icons/fa";

const SellerDashboard = () => {
  // Mock data for seller's products
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Recycled Denim Jacket",
      price: 899000,
      stock: 15,
      status: "active",
      sales: 24,
      image: "https://via.placeholder.com/100",
      created: "2025-03-15"
    },
    {
      id: 2,
      name: "Eco-friendly T-shirt",
      price: 299000,
      stock: 32,
      status: "active",
      sales: 47,
      image: "https://via.placeholder.com/100",
      created: "2025-03-10"
    },
    {
      id: 3,
      name: "Sustainable Bamboo Socks",
      price: 99000,
      stock: 58,
      status: "active",
      sales: 106,
      image: "https://via.placeholder.com/100",
      created: "2025-02-28"
    },
    {
      id: 4,
      name: "Upcycled Canvas Tote Bag",
      price: 199000,
      stock: 0,
      status: "out_of_stock",
      sales: 63,
      image: "https://via.placeholder.com/100",
      created: "2025-02-20"
    },
    {
      id: 5,
      name: "Vegan Leather Wallet",
      price: 459000,
      stock: 7,
      status: "active",
      sales: 18,
      image: "https://via.placeholder.com/100",
      created: "2025-04-05"
    }
  ]);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Format price for display (Vietnamese Dong format)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(price);
  };

  // Filter products based on status and search query
  const filteredProducts = products.filter(product => {
    const matchesStatus = 
      activeTab === "all" || 
      (activeTab === "active" && product.status === "active") ||
      (activeTab === "out_of_stock" && product.status === "out_of_stock");
    
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Handle product deletion
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center">
          <FaPlus className="mr-2" /> Add New Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === 'all' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === 'active' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === 'out_of_stock' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('out_of_stock')}
          >
            Out of Stock
          </button>
        </div>
        
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Stock</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Sales</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">ID: {product.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 font-medium">{formatPrice(product.price)}</td>
                <td className="px-4 py-4">{product.stock}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status === 'active' ? 'Active' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-4 py-4">{product.sales}</td>
                <td className="px-4 py-4">{product.created}</td>
                <td className="px-4 py-4">
                  <div className="flex space-x-2">
                    <button className="text-amber-500 hover:text-amber-700" title="View">
                      <FaEye />
                    </button>
                    <button className="text-blue-500 hover:text-blue-700" title="Edit">
                      <FaEdit />
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700" 
                      title="Delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-gray-500">Showing {filteredProducts.length} of {products.length} products</p>
        <div className="flex space-x-1">
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Previous</button>
          <button className="px-3 py-1 rounded bg-amber-500 text-white hover:bg-amber-600">1</button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">2</button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">3</button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;