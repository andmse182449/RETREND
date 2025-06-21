// src/pages/ProfilePage.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaBox,
  FaLink,
  FaChevronRight,
  FaBoxOpen,
  FaClipboardList, // Added FaClipboardList for orders
  FaRedo, // For retry button
} from "react-icons/fa";

// API Services
import { getProductsByUsername } from "../../services/ProductService"; // Adjust path
import { getOrdersByUserId } from "../../services/OrderService"; // <<< NEW IMPORT

// --- Mock User Data (can be phased out or used as fallback) ---
const simulateFetchUserData = async () => {
  /* ... (keep your existing mock or replace with actual API call) ... */
  await new Promise((resolve) => setTimeout(resolve, 200));
  const storedUserLite = localStorage.getItem("user"); // This should contain the userId
  if (storedUserLite) {
    try {
      const userLite = JSON.parse(storedUserLite);
      return {
        id: userLite.userId || userLite.id || `user-${Date.now()}`,
        username: userLite.username || "testuser",
        fullName: userLite.username || "Test User",
        email: userLite.email || "test.user@example.com",
        phone: userLite.phone || "098-765-4321",
        address: userLite.address || "456 Test Ave, Test City",
        dateOfBirth: userLite.dateOfBirth || "",
        gender: userLite.gender || "",
        height: userLite.height || "",
        weight: userLite.weight || "",
        city: userLite.city || "",
        district: userLite.district || "",
        ward: userLite.ward || "",
        role: userLite.role || "customer",
        points: userLite.points || 0,
      };
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
      return null;
    }
  }
  return null;
};

// --- Helper for price formatting ---
const formatPrice = (price) => {
  if (typeof price !== "number" || isNaN(price)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

// --- Status Info Helpers ---
const getProductStatusInfo = (status) => {
  /* ... (keep as is) ... */
  switch (status?.toLowerCase()) {
    case "available":
      return { text: "Đang bán", color: "text-blue-600", bg: "bg-blue-100" };
    case "pending":
      return { text: "Chờ duyệt", color: "text-amber-600", bg: "bg-amber-100" };
    case "sold":
      return { text: "Đã bán", color: "text-red-500", bg: "bg-red-100" }; // Changed sold to red
    case "archived":
      return { text: "Lưu trữ", color: "text-gray-500", bg: "bg-gray-100" };
    case "denied":
      return {
        text: "Bị từ chối",
        color: "text-orange-600",
        bg: "bg-orange-100",
      }; // Changed denied color
    default:
      return {
        text: status || "Không rõ",
        color: "text-gray-700",
        bg: "bg-gray-200",
      };
  }
};
const getOrderStatusInfo = (status) => {
  // You'll need to define these based on your order statuses
  switch (status?.toLowerCase()) {
    case "pending":
      return { text: "Chờ xử lý", color: "text-amber-600", bg: "bg-amber-100" };
    case "awaiting payment":
      return {
        text: "Chờ thanh toán",
        color: "text-orange-500",
        bg: "bg-orange-100",
      };
    case "processing":
      return { text: "Đang xử lý", color: "text-blue-600", bg: "bg-blue-100" };
    case "shipped":
      return {
        text: "Đã giao hàng",
        color: "text-indigo-600",
        bg: "bg-indigo-100",
      };
    case "delivered":
      return {
        text: "Hoàn thành",
        color: "text-green-600",
        bg: "bg-green-100",
      };
    case "cancelled":
      return { text: "Đã hủy", color: "text-red-500", bg: "bg-red-100" };
    case "refunded":
      return {
        text: "Đã hoàn tiền",
        color: "text-purple-600",
        bg: "bg-purple-100",
      };
    default:
      return {
        text: status || "Không rõ",
        color: "text-gray-700",
        bg: "bg-gray-200",
      };
  }
};

const profileNavOptions = [
  { key: "account", label: "Tài khoản của tôi" },
  { key: "myListings", label: "Sản phẩm đang bán" },
  { key: "orders", label: "Đơn hàng đã mua" },
];

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [sellingItems, setSellingItems] = useState([]);
  const [purchasedOrders, setPurchasedOrders] = useState([]); // <<< NEW STATE FOR ORDERS
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingSellingItems, setIsLoadingSellingItems] = useState(false);
  const [isLoadingPurchasedOrders, setIsLoadingPurchasedOrders] =
    useState(false); // <<< NEW LOADING STATE
  const [error, setError] = useState(null); // General error for the page
  const [activeView, setActiveView] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    /* ... initial empty form ... */
  });

  const navigate = useNavigate();

  // --- Effect to load user data and then their associated data (selling items, purchased orders) ---
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingProfile(true);
      setError(null);
      let fetchedUser = null;

      try {
        fetchedUser = await simulateFetchUserData(); // Or your actual user data API call

        if (!fetchedUser || !fetchedUser.id || !fetchedUser.username) {
          // Check for ID and username
          setUser(null);
          setSellingItems([]);
          setPurchasedOrders([]);
          setError("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
          setIsLoadingProfile(false);
          return;
        }

        setUser(fetchedUser);
        setFormData({
          /* ... populate formData from fetchedUser ... */
          fullName: fetchedUser.fullName || "",
          email: fetchedUser.email || "",
          phone: fetchedUser.phone || "",
          address: fetchedUser.address || "",
          dateOfBirth: fetchedUser.dateOfBirth || "",
          gender: fetchedUser.gender || "",
          height: fetchedUser.height || "",
          weight: fetchedUser.weight || "",
          city: fetchedUser.city || "",
          district: fetchedUser.district || "",
          ward: fetchedUser.ward || "",
        });
        setIsLoadingProfile(false);

        // Fetch selling items
        setIsLoadingSellingItems(true);
        const itemsData = await getProductsByUsername(fetchedUser.username);
        setSellingItems(itemsData || []);
        setIsLoadingSellingItems(false);

        // Fetch purchased orders using userId
        setIsLoadingPurchasedOrders(true);
        const ordersData = await getOrdersByUserId(fetchedUser.id); // Use fetchedUser.id
        setPurchasedOrders(ordersData || []);
        setIsLoadingPurchasedOrders(false);
      } catch (err) {
        console.error("Error loading profile data:", err);
        setError(err.message || "Lỗi tải dữ liệu. Vui lòng thử lại.");
        setUser(null);
        setSellingItems([]);
        setPurchasedOrders([]);
        setIsLoadingProfile(false);
        setIsLoadingSellingItems(false);
        setIsLoadingPurchasedOrders(false);
      }
    };

    loadInitialData();
  }, []); // Runs once on mount

  // ... (Edit Profile Handlers: handleEditToggle, handleInputChange, handleSave, handleCancelEdit - keep as is) ...
  const handleEditToggle = () => {
    /* ... */
  };
  const handleInputChange = (e) => {
    /* ... */
  };
  const handleSave = () => {
    /* ... */
  };
  const handleCancelEdit = () => {
    /* ... */
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // --- Render Functions for Views ---
  const renderAccountView = () => (
    /* ... (keep your existing JSX, ensure formData is used for inputs) ... */ <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">
            Thông tin tài khoản
          </h3>
          {!isEditing && user && (
            <button
              onClick={handleEditToggle}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <FaEdit size={13} className="mr-1.5" /> Chỉnh sửa
            </button>
          )}
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <FaUser size={16} className="text-gray-500" />
            <p>
              <strong>Họ và tên:</strong>{" "}
              {isEditing ? (
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input-profile"
                />
              ) : (
                user?.fullName || "Chưa cập nhật"
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FaEnvelope size={16} className="text-gray-500" />
            <p>
              <strong>Email:</strong>{" "}
              {isEditing ? (
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input-profile"
                />
              ) : (
                user?.email || "Chưa cập nhật"
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FaPhone size={16} className="text-gray-500" />
            <p>
              <strong>Điện thoại:</strong>{" "}
              {isEditing ? (
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input-profile"
                />
              ) : (
                user?.phone || "Chưa cập nhật"
              )}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <FaMapMarkerAlt size={16} className="text-gray-500 mt-1" />
            <p>
              <strong>Địa chỉ chung:</strong>{" "}
              {isEditing ? (
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input-profile"
                />
              ) : (
                user?.address || "Chưa cập nhật"
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h3>
        {error && isEditing && (
          <div className="text-red-500 text-xs text-center py-1">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5">
              Ngày sinh
            </label>
            {isEditing ? (
              <input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="form-input-profile"
              />
            ) : (
              <p className="profile-text-display">
                {user?.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
                  : "Chưa cập nhật"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5">
              Giới tính
            </label>
            {isEditing ? (
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form-input-profile"
              >
                <option value="">Chọn</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            ) : (
              <p className="profile-text-display">
                {user?.gender || "Chưa cập nhật"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5">
              Chiều cao (cm)
            </label>
            {isEditing ? (
              <input
                name="height"
                type="number"
                value={formData.height}
                onChange={handleInputChange}
                className="form-input-profile"
                placeholder="VD: 170"
              />
            ) : (
              <p className="profile-text-display">
                {user?.height ? `${user.height} cm` : "Chưa cập nhật"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5">
              Cân nặng (kg)
            </label>
            {isEditing ? (
              <input
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleInputChange}
                className="form-input-profile"
                placeholder="VD: 65"
              />
            ) : (
              <p className="profile-text-display">
                {user?.weight ? `${user.weight} kg` : "Chưa cập nhật"}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-0.5">
              Tỉnh/Thành phố
            </label>
            {isEditing ? (
              <input
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="form-input-profile"
              />
            ) : (
              <p className="profile-text-display">
                {user?.city || "Chưa cập nhật"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5">
              Quận/Huyện
            </label>
            {isEditing ? (
              <input
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="form-input-profile"
              />
            ) : (
              <p className="profile-text-display">
                {user?.district || "Chưa cập nhật"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5">
              Phường/Xã
            </label>
            {isEditing ? (
              <input
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                className="form-input-profile"
              />
            ) : (
              <p className="profile-text-display">
                {user?.ward || "Chưa cập nhật"}
              </p>
            )}
          </div>
        </div>
        {isEditing && (
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              Lưu thay đổi
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderUserSellingItems = () => (
    /* ... (keep your existing JSX, it uses `sellingItems` state) ... */ <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaBox size={22} className="text-gray-700" /> Sản phẩm đang bán (
          {sellingItems.length})
        </h2>
        <Link
          to="/sell"
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          + Đăng sản phẩm mới
        </Link>
      </div>
      {isLoadingSellingItems && (
        <p className="text-center text-gray-500 py-4">Đang tải sản phẩm...</p>
      )}
      {!isLoadingSellingItems && error && sellingItems.length === 0 && (
        <p className="text-center text-red-500 py-4">
          {error.includes("sản phẩm") ? error : "Lỗi tải sản phẩm đang bán."}
        </p>
      )}
      {!isLoadingSellingItems && !error && sellingItems.length === 0 && (
        <div className="text-center text-gray-600 py-10 bg-white rounded-lg shadow border p-6">
          <FaBoxOpen size={40} className="mx-auto mb-3 text-gray-400" />
          <p className="font-medium">Bạn chưa đăng bán sản phẩm nào.</p>
          <p className="text-sm">
            Hãy bắt đầu chia sẻ những món đồ tuyệt vời của bạn!
          </p>
        </div>
      )}
      {!isLoadingSellingItems && sellingItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {sellingItems.map((item) => {
            const statusInfo = getProductStatusInfo(item.status);
            return (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white flex gap-4 hover:shadow-md transition-shadow"
              >
                <Link to={`/products/${item.id}`} className="shrink-0">
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/100x100?text=No+Image"
                    }
                    alt={item.name}
                    className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-md border"
                  />
                </Link>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <Link
                      to={`/products/${item.id}`}
                      className="hover:text-blue-600"
                    >
                      <h3
                        className="text-md font-semibold text-gray-800 truncate"
                        title={item.name}
                      >
                        {item.name || "Sản phẩm không tên"}
                      </h3>
                    </Link>
                    <Link
                      to={`/manage-product/${item.id}/edit`}
                      className="text-xs text-blue-500 hover:underline ml-2 shrink-0"
                    >
                      Sửa
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600 font-bold mt-1">
                    {formatPrice(item.priceVND || item.price)}
                  </p>
                  <p
                    className="text-xs text-gray-500 truncate"
                    title={item.description}
                  >
                    {item.description?.substring(0, 60) || "Không có mô tả."}
                    {item.description && item.description.length > 60
                      ? "..."
                      : ""}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-0.5 font-medium rounded-full ${statusInfo.bg} ${statusInfo.color}`}
                    >
                      {statusInfo.text}
                    </span>
                    <span className="text-gray-400">
                      Đăng ngày:{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // --- NEW: Render Purchased Orders View ---
  const renderOrdersView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaClipboardList size={22} className="text-gray-700" /> Đơn hàng đã mua
        ({purchasedOrders.length})
      </h2>
      {/* TODO: Add tabs for different order statuses if needed: "Chờ xác nhận", "Đang giao", "Đã giao", "Đã hủy" */}
      {isLoadingPurchasedOrders && (
        <p className="text-center text-gray-500 py-4">
          Đang tải lịch sử đơn hàng...
        </p>
      )}
      {!isLoadingPurchasedOrders && error && purchasedOrders.length === 0 && (
        <p className="text-center text-red-500 py-4">
          {error.includes("đơn hàng") ? error : "Lỗi tải lịch sử đơn hàng."}
        </p>
      )}
      {!isLoadingPurchasedOrders && !error && purchasedOrders.length === 0 && (
        <div className="text-center text-gray-600 py-10 bg-white rounded-lg shadow border p-6">
          <FaBoxOpen size={40} className="mx-auto mb-3 text-gray-400" />
          <p className="font-medium">Bạn chưa có đơn hàng nào.</p>
          <Link
            to="/products"
            className="mt-4 inline-block text-blue-600 hover:underline text-sm"
          >
            Bắt đầu mua sắm ngay!
          </Link>
        </div>
      )}
      {!isLoadingPurchasedOrders && purchasedOrders.length > 0 && (
        <div className="space-y-4">
          {purchasedOrders.map((order) => {
            const statusInfo = getOrderStatusInfo(order.status);
            return (
              <div
                key={order.id}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 pb-2 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">
                      Mã đơn:{" "}
                      <span className="font-medium text-gray-700">
                        #{order.id}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Ngày đặt:{" "}
                      <span className="font-medium text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`mt-2 sm:mt-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}
                  >
                    {statusInfo.text}
                  </span>
                </div>
                {/* TODO: Display order items here. You'll need another API call: /v1.0/order-items/order/{order.id} */}
                {/* For now, just showing total and address */}
                <div className="text-sm space-y-1">
                  <p className="text-gray-700">
                    <strong>Địa chỉ giao:</strong> {order.shippingAddress}
                  </p>
                  <p className="text-gray-700">
                    <strong>Tổng tiền:</strong>{" "}
                    <span className="font-bold text-blue-600">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <strong>Thanh toán:</strong>{" "}
                    {order.methodPayment === "online"
                      ? "Trực tuyến"
                      : "Khi nhận hàng"}
                  </p>
                </div>
                <div className="mt-3 text-right">
                  <Link
                    to={`/order-details/${order.id}`} // Assuming you have an order detail page route
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Xem chi tiết đơn hàng{" "}
                    <FaChevronRight className="inline w-2.5 h-2.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // --- Main Return for ProfilePage ---
  if (isLoadingProfile && !user) {
    /* ... loading user ... */ return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!user && !isLoadingProfile) {
    /* ... not logged in ... */ return (
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center my-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Bạn chưa đăng nhập
        </h2>
        <p className="text-gray-600 mb-6">
          Vui lòng đăng nhập để xem thông tin cá nhân và quản lý sản phẩm của
          bạn.
        </p>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          Đến trang Đăng nhập
        </Link>
      </div>
    );
  }
  if (error && !user) {
    /* ... error loading user ... */ return (
      <div className="max-w-lg mx-auto bg-red-50 border-red-300 border rounded-lg shadow-md p-8 text-center my-10">
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-start">
      {/* Left Sidebar */}
      <div className="md:col-span-1 bg-white p-5 rounded-xl shadow-xl h-fit sticky top-24 space-y-4 md:space-y-2">
        {user && (
          /* ... user info in sidebar ... */ <div className="mb-6 pb-4 border-b border-gray-200 text-center md:text-left">
            <div className="text-lg font-semibold text-gray-800 truncate">
              {user.fullName || user.username || "Xin chào!"}
            </div>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        )}
        {profileNavOptions.map((option) => (
          /* ... sidebar navigation buttons ... */ <button
            key={option.key}
            onClick={() => setActiveView(option.key)}
            className={`flex justify-between items-center w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
              activeView === option.key
                ? "bg-blue-500 text-white font-medium shadow-sm"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span>{option.label}</span>
            <FaChevronRight
              size={12}
              className={`transition-transform ${
                activeView === option.key ? "text-white" : "text-gray-400"
              }`}
            />
          </button>
        ))}
        <div className="pt-4 border-t border-gray-200 mt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-md font-medium text-sm transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="md:col-span-1 min-h-[calc(100vh-10rem)]">
        {activeView === "account" && renderAccountView()}
        {activeView === "myListings" && renderUserSellingItems()}
        {activeView === "orders" && renderOrdersView()}
      </div>
      <style jsx global>{`
        .form-input-profile {
          @apply w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm;
        }
        .profile-text-display {
          @apply text-sm text-gray-800 font-medium bg-gray-50 px-2.5 py-2 rounded-md border border-gray-200 min-h-[38px] flex items-center;
        }
      `}</style>
    </div>
  );
}
