import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

// Mock API service functions (replace with your actual API calls)
const mockApiService = {
  fetchShippingMethods: async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    // Load from localStorage or return mock data
    const storedMethods = localStorage.getItem('shippingMethods');
    if (storedMethods) {
      return JSON.parse(storedMethods);
    }
    return [
      { id: 1, name: 'Giao hàng Tiêu chuẩn', description: 'Thời gian giao: 3-5 ngày làm việc', fee: 0 },
      { id: 2, name: 'Giao hàng Nhanh', description: 'Thời gian giao: 1-2 ngày làm việc', fee: 30000 },
      { id: 3, name: 'Hỏa tốc nội thành', description: 'Giao trong vòng 2-4 giờ (TP.HCM)', fee: 50000 },
    ];
  },
  addShippingMethod: async (method) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newId = Date.now(); // Simple ID generation for mock
    console.log("Mock API: Adding method", { ...method, id: newId });
    return { ...method, id: newId };
  },
  updateShippingMethod: async (id, updatedMethod) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log("Mock API: Updating method", id, updatedMethod);
    return { ...updatedMethod, id };
  },
  deleteShippingMethod: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log("Mock API: Deleting method ID", id);
    return true; // Simulate success
  },
};

// Helper for formatting price
const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);
};


export default function ShippingMethodsTable() {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // Stores the method object being edited

  const [newMethod, setNewMethod] = useState({ name: '', description: '', fee: '' });
  const [editMethodData, setEditMethodData] = useState({ id: null, name: '', description: '', fee: '' });

  // Fetch initial data
  useEffect(() => {
    const loadMethods = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const methods = await mockApiService.fetchShippingMethods();
        setShippingMethods(methods);
      } catch (err) {
        setError("Failed to load shipping methods.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMethods();
  }, []);

  // --- Handlers for Add Form ---
  const handleNewMethodChange = (e) => {
    const { name, value } = e.target;
    setNewMethod(prev => ({ ...prev, [name]: name === 'fee' ? (value === '' ? '' : parseFloat(value)) : value }));
  };

  const handleAddNewMethod = async (e) => {
    e.preventDefault();
    if (!newMethod.name.trim() || newMethod.fee === '' || isNaN(parseFloat(newMethod.fee))) {
      alert("Vui lòng nhập tên và phí hợp lệ.");
      return;
    }
    setIsLoading(true);
    try {
      const addedMethod = await mockApiService.addShippingMethod({
        ...newMethod,
        fee: parseFloat(newMethod.fee)
      });
      setShippingMethods(prev => [...prev, addedMethod]);
      // Update localStorage if using it for mock
      localStorage.setItem('shippingMethods', JSON.stringify([...shippingMethods, addedMethod]));
      setNewMethod({ name: '', description: '', fee: '' }); // Reset form
      setIsAdding(false);
    } catch (err) {
      alert("Failed to add shipping method.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers for Edit ---
  const handleEditClick = (method) => {
    setIsEditing(method.id); // Set the ID of the method being edited
    setEditMethodData({ ...method, fee: method.fee.toString() }); // Convert fee to string for input
  };

  const handleEditMethodChange = (e) => {
    const { name, value } = e.target;
    setEditMethodData(prev => ({ ...prev, [name]: name === 'fee' ? (value === '' ? '' : parseFloat(value)) : value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editMethodData.name.trim() || editMethodData.fee === '' || isNaN(parseFloat(editMethodData.fee))) {
      alert("Vui lòng nhập tên và phí hợp lệ cho mục chỉnh sửa.");
      return;
    }
    setIsLoading(true);
    try {
      const updatedMethod = await mockApiService.updateShippingMethod(isEditing, {
        ...editMethodData,
        fee: parseFloat(editMethodData.fee)
      });
      setShippingMethods(prev => prev.map(m => (m.id === isEditing ? updatedMethod : m)));
      // Update localStorage
      const updatedMethodsForStorage = shippingMethods.map(m => (m.id === isEditing ? updatedMethod : m));
      localStorage.setItem('shippingMethods', JSON.stringify(updatedMethodsForStorage));
      setIsEditing(null); // Exit edit mode
    } catch (err) {
      alert("Failed to update shipping method.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
  };

  // --- Handler for Delete ---
  const handleDeleteMethod = async (methodId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phương thức vận chuyển này?")) {
      return;
    }
    setIsLoading(true);
    try {
      await mockApiService.deleteShippingMethod(methodId);
      const updatedMethods = shippingMethods.filter(m => m.id !== methodId);
      setShippingMethods(updatedMethods);
      // Update localStorage
      localStorage.setItem('shippingMethods', JSON.stringify(updatedMethods));
    } catch (err) {
      alert("Failed to delete shipping method.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && shippingMethods.length === 0) { // Show loading only on initial load
    return <div className="p-4 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Quản lý Phương thức Vận chuyển</h1>
          {!isAdding && !isEditing && (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
            >
              <FaPlus className="mr-2" /> Thêm mới
            </button>
          )}
        </div>

        {/* Add New Method Form */}
        {isAdding && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Thêm Phương thức Vận chuyển Mới</h2>
            <form onSubmit={handleAddNewMethod} className="space-y-4">
              <div>
                <label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-1">Tên phương thức</label>
                <input
                  type="text"
                  id="newName"
                  name="name"
                  value={newMethod.name}
                  onChange={handleNewMethodChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="VD: Giao hàng Tiết kiệm"
                  required
                />
              </div>
              <div>
                <label htmlFor="newDescription" className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  id="newDescription"
                  name="description"
                  value={newMethod.description}
                  onChange={handleNewMethodChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="VD: Giao hàng trong 3-5 ngày, áp dụng toàn quốc"
                ></textarea>
              </div>
              <div>
                <label htmlFor="newFee" className="block text-sm font-medium text-gray-700 mb-1">Phí vận chuyển (VNĐ)</label>
                <input
                  type="number"
                  id="newFee"
                  name="fee"
                  value={newMethod.fee}
                  onChange={handleNewMethodChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="VD: 30000"
                  min="0"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setNewMethod({ name: '', description: '', fee: '' }); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table of Shipping Methods */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tên Phương thức</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Mô tả</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Phí (VNĐ)</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shippingMethods.map((method) => (
                isEditing === method.id ? (
                  // Editing Row
                  <tr key={`edit-${method.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="text" name="name" value={editMethodData.name} onChange={handleEditMethodChange} className="form-input-table" />
                    </td>
                    <td className="px-6 py-4">
                      <textarea name="description" value={editMethodData.description} onChange={handleEditMethodChange} rows="2" className="form-input-table"></textarea>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="number" name="fee" value={editMethodData.fee} onChange={handleEditMethodChange} className="form-input-table w-28" min="0" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button onClick={handleSaveEdit} disabled={isLoading} className="text-green-600 hover:text-green-800 mr-3 p-1 disabled:opacity-50" title="Lưu"><FaSave size={16}/></button>
                      <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 p-1" title="Hủy"><FaTimes size={16}/></button>
                    </td>
                  </tr>
                ) : (
                  // Display Row
                  <tr key={method.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{method.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={method.description}>{method.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-800 font-medium">{formatPrice(method.fee)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button onClick={() => handleEditClick(method)} className="text-indigo-600 hover:text-indigo-900 mr-3 p-1" title="Sửa"><FaEdit size={16}/></button>
                      <button onClick={() => handleDeleteMethod(method.id)} disabled={isLoading} className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50" title="Xóa"><FaTrash size={16}/></button>
                    </td>
                  </tr>
                )
              ))}
              {shippingMethods.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                    Không có phương thức vận chuyển nào. Hãy thêm mới!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Helper styles for table inputs */}
      <style jsx global>{`
        .form-input-table {
          @apply w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500;
        }
      `}</style>
    </div>
  );
}