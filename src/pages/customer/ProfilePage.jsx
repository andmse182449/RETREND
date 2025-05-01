import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,         // Used for user icon in profile fields, buyer info
  FaEnvelope,     // Used for email icon
  FaPhone,        // Used for phone icon
  FaMapMarkerAlt, // Used for address icon, buyer location
  FaEdit,         // Used for edit button icon
  FaBox,          // Used for selling items heading icon
  FaLink,         // Used for link to public product details
  FaChevronRight, // Used for sidebar link arrows
  // FaDollarSign // Used for points (if needed in profile details) - ensure imported if used
} from "react-icons/fa"; // Make sure all necessary icons are imported


// --- Simulated Data (for testing UI without a backend) ---
// Includes simulated API delay for more realistic loading behavior
// (Keep this section as is or replace with actual API calls later)
const simulateFetchUserData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay

  const storedUserLite = localStorage.getItem("user");

  if (storedUserLite) {
    try {
        const userLite = JSON.parse(storedUserLite);
         // Return mock data, potentially overriding with available localStorage data
         // Include expanded personal info fields
        return {
          id: userLite.id || 123,
          fullName: userLite.fullName || "Test User",
          email: userLite.email || "test.user@example.com",
          phone: userLite.phone || "098-765-4321",
          address: userLite.address || "456 Test Ave, Test City, TX 54321",
          points: userLite.points || 50.75,
          role: userLite.role || "customer",
           // --- Added Personal Info Fields based on image ---
           dateOfBirth: userLite.dateOfBirth || '', // Using empty string for input initial state
           gender: userLite.gender || '',
           height: userLite.height || '', // Stored as number/string
           weight: userLite.weight || '', // Stored as number/string
           city: userLite.city || '',
           district: userLite.district || '',
           ward: userLite.ward || '',
           // -------------------------------------------
        };
    } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        localStorage.removeItem("user"); // Clear potentially bad data
        return null; // Treat as no user found
    }
  }
  return null; // Return null if no user in localStorage
};

const simulateFetchUserSellingItems = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

  const storedUserLite = localStorage.getItem("user");

  if (storedUserLite) {
       // Return mock items associated with this user (mock userID 123)
      return [
        {
          productID: 101, userID: 123, name: "Graphic Tee", description: "Soft cotton tee with abstract design.", price: 499000, imageURL: "https://via.placeholder.com/150/FAF0E6/333333?text=Tee", createDate: new Date("2023-11-01T09:15:00Z"), size: "L", color: "White", status: "Listed", condition: "Excellent"
        },
        {
          productID: 102, userID: 123, name: "Slim Fit Jeans", description: "Comfortable dark blue jeans, worn once.", price: 750000, imageURL: "https://via.placeholder.com/150/D2B48C/333333?text=Jeans", createDate: new Date("2023-10-28T11:00:00Z"), size: "32x32", color: "Dark Blue", status: "Sold", condition: "Very Good", buyer: { name: "Customer One", location: "Miami, FL" }
        },
        {
          productID: 103, userID: 123, name: "Summer Scarf", description: "Lightweight floral scarf.", price: 150000, imageURL: "https://via.placeholder.com/150/F0E68C/333333?text=Scarf", createDate: new Date("2023-10-29T16:00:00Z"), size: "One Size", color: "Floral", status: "Pending", condition: "Like New"
        },
         {
          productID: 104, userID: 123, name: "Leather Wallet", description: "Genuine leather wallet.", price: 300000, imageURL: "https://via.placeholder.com/150/BC8F8F/333333?text=Wallet", createDate: new Date('2023-11-15T14:30:00Z'), size: "One Size", color: "Brown", status: "Listed", condition: "Excellent"
        },
       {
         productID: 105, userID: 123, name: "Vintage Watch", description: "Classic automatic watch.", price: 2500000, imageURL: "https://via.placeholder.com/150/D8BFD8/333333?text=Watch", createDate: new Date('2023-11-10T08:00:00Z'), size: "One Size", color: "Silver", status: "Sold", condition: "Very Good", buyer: { name: "Customer Two", location: "Los Angeles, CA" }
       },
       {
         productID: 106, userID: 123, name: "Striped Button-Up", description: "Cotton striped casual shirt.", price: 400000, imageURL: "https://via.placeholder.com/150/ADD8E6/333333?text=Shirt", createDate: new Date('2023-12-01T10:00:00Z'), size: "M", color: "Blue/White", status: "Archived", condition: "Good"
       },
      ];
  }
  return []; // Return empty array if no user in localStorage
};
// ---------------------------------------------

// Helper to get status text color (used in selling items view)
const getStatusColor = (status) => {
  switch (status) {
    case "Listed": return "text-blue-600";
    case "Pending": return "text-amber-600";
    case "Sold": return "text-green-600";
    case "Archived": return "text-gray-500";
    default: return "text-gray-700";
  }
};

// Helper to get status background color (used in selling items view)
const getStatusBgColor = (status) => {
  switch (status) {
    case "Listed": return "bg-blue-100";
    case "Pending": return "bg-amber-100";
    case "Sold": return "bg-green-100";
    case "Archived": return "bg-gray-100";
    default: return "bg-gray-100";
  }
};

// Helper for price formatting to VND
const formatPrice = (price) => {
  if (typeof price !== "number" || isNaN(price)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

// Example list of navigation options for the sidebar
// 'key' maps to the activeView state, 'label' is the text, 'component' is the function to render the content
const profileNavOptions = [
    { key: 'account', label: 'Tài khoản' }, // Account info + Personal info
    // Hidden options: Hạng hội viên, Số điểm đang có, SĐT tích điểm, Màu sắc yêu thích
    { key: 'myListings', label: 'Sản phẩm đang bán' }, // User's items for sale (Selling Items)
    { key: 'orders', label: 'Đơn hàng' }, // User's orders (items they bought) - To be implemented
    { key: 'addresses', label: 'Địa chỉ nhận hàng' }, // Shipping Address (part of account or separate view) - Combined into account for now based on image
    { key: 'rewards', label: 'Ưu đãi của tôi' }, // User's rewards/vouchers - To be implemented
    { key: 'contact', label: 'Câu hỏi của tôi' }, // Contact/Support History - Hidden
];


export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [sellingItems, setSellingItems] = useState([]); // State for items registered to sell
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the active view, matching the keys in profileNavOptions
  const [activeView, setActiveView] = useState("account"); // Default to 'account'

  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode for account info
  // Initialize formData with empty strings, will be populated with user data after fetch
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", address: "",
    dateOfBirth: "", gender: "", height: "", weight: "",
    city: "", district: "", ward: ""
  });

  const navigate = useNavigate(); // Hook for navigation


  // --- useEffect to load data and set initial form state ---
  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors

      const storedUserLite = localStorage.getItem("user");
      if (!storedUserLite) {
        // User is not logged in
        setUser(null);
        setSellingItems([]); // Ensure items are cleared
        setIsLoading(false); // Stop loading
        // Clear form data if not logged in
        setFormData({ fullName: "", email: "", phone: "", address: "", dateOfBirth: "", gender: "", height: "", weight: "", city: "", district: "", ward: "" });
        return; // Exit the function
      }

      try {
        // Simulate fetching full user details and their selling items
        const userData = await simulateFetchUserData();
        const itemsData = await simulateFetchUserSellingItems();

        // Check if user data was successfully fetched
        if (!userData) {
             setError("Failed to load user details. Please log in again.");
             setUser(null); // Clear user state
             setSellingItems([]); // Clear items
        } else {
            // Data fetched successfully
            setUser(userData); // Set the main user state
            setSellingItems(itemsData); // Set selling items state

            // Populate form data with fetched user data
            setFormData({
              fullName: userData.fullName || "",
              email: userData.email || "",
              phone: userData.phone || "",
              address: userData.address || "", // Old address field from prior structure
               // New personal info fields
              dateOfBirth: userData.dateOfBirth || "",
              gender: userData.gender || "",
              height: userData.height || "",
              weight: userData.weight || "",
              city: userData.city || "",
              district: userData.district || "",
              ward: userData.ward || "",
            });
        }

      } catch (err) {
        console.error("Error during data fetch:", err);
        setError("Failed to load profile data. Please try again.");
        setUser(null); // Clear user/items on error
        setSellingItems([]);
        setFormData({ fullName: "", email: "", phone: "", address: "", dateOfBirth: "", gender: "", height: "", weight: "", city: "", district: "", ward: "" }); // Clear form data on error
      } finally {
        setIsLoading(false); // Stop loading regardless of success or error
      }
    };

    loadProfileData(); // Call the async loading function

  }, []); // Empty dependency array: runs only once on mount


  // --- Handle Editing Profile Information ---
  const handleEditToggle = () => {
      // Only toggle to editing mode if user data is loaded and we're not already editing
      if (user && !isEditing) {
         setIsEditing(true);
         setError(null); // Clear errors when starting edit
      }
      // If isEditing is true, the "Edit/Save" button handles saving via handleSave onClick
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

     // Basic validation for height/weight to only allow numbers or empty string
     if ((name === 'height' || name === 'weight')) {
         if (value === '' || /^\d*\.?\d*$/.test(value)) { // Allow empty string or numbers (integer or decimal)
              setFormData({ ...formData, [name]: value });
         }
         // Otherwise, ignore invalid input for height/weight
     } else {
         // For other text/date/select fields, just update the state
         setFormData({ ...formData, [name]: value });
     }
  };

  const handleSave = () => {
     // Basic validation example
     if (!formData.fullName || !formData.email) {
         setError("Full Name and Email cannot be empty."); // Set a visible error
         return; // Stop save process if validation fails
     }
      setError(null); // Clear previous error if validation passes


     // Create updated user object by merging current user data with form data
     const updatedUser = {
      ...user, // Keep original data (like role, points, id if not in form)
      ...formData, // Override with values from the form
    };

    // --- Simulate Saving to Backend/LocalStorage ---
    // In a real app, you'd send `updatedUser` to your API: axios.put('/api/profile', updatedUser)
    // .then(...)
    // .catch(...)
    // For this mock, update the local state and localStorage
    setUser(updatedUser); // Update the main user state displayed
    localStorage.setItem("user", JSON.stringify(updatedUser)); // Update localStorage mock

    setIsEditing(false); // Exit editing mode upon successful save (mock)
     console.log("Profile changes saved (mock).");
     // Optional: Implement success message feedback (e.g., Toast saying "Changes saved!")
     // -----------------
  };

  const handleCancelEdit = () => {
     setIsEditing(false); // Exit editing mode
     // Reset formData back to the current user state upon cancelling
      if (user) { // Ensure user object exists
          setFormData({
              fullName: user.fullName || "", email: user.email || "", phone: user.phone || "", address: user.address || "",
              dateOfBirth: user.dateOfBirth || "", gender: user.gender || "", height: user.height || "", weight: user.weight || "",
              city: user.city || "", district: user.district || "", ward: user.ward || "",
          });
      }
       setError(null); // Clear any errors
  };
  // --- End Handle Editing Profile Information ---


  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user from localStorage (mock logout)
    // In a real app, you might also need to clear auth tokens on the client and potentially call a backend logout endpoint
    navigate("/login"); // Redirect to login page using navigate hook
     // Optional: Force full page reload if state reset across app is complex and necessary for a clean logout state
     // window.location.reload();
  };


  // --- Rendering Functions for different sidebar views ---

  // Renders the Account Overview + Personal Information section
  const renderAccountView = () => (
    <div className="space-y-6"> {/* Container for Account & Personal Info sections */}
      {/* Account Overview (Tài khoản section in image) - Always Visible */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
           <h3 className="text-xl font-bold text-gray-800">Tài khoản</h3> {/* "Account" heading */}

            {/* Basic Info Display - Always Visible */}
           <div className="space-y-3 text-base"> {/* Spacing between info items */}
               <div className="flex items-center gap-3">
                   <FaUser size={18} className="text-gray-600 flex-shrink-0"/> {/* Icon */}
                    <p>Họ và tên: <span className="font-medium">{user?.fullName || "Not provided"}</span></p> {/* Name */}
               </div>
               <div className="flex items-center gap-3">
                   <FaEnvelope size={18} className="text-gray-600 flex-shrink-0"/> {/* Icon */}
                    <p>Email: <span className="font-medium">{user?.email || "Not provided"}</span></p> {/* Email */}
               </div>
               <div className="flex items-center gap-3">
                   <FaPhone size={18} className="text-gray-600 flex-shrink-0"/> {/* Icon */}
                   <p>Số điện thoại: <span className="font-medium">{user?.phone || "Not provided"}</span></p> {/* Phone */}
               </div>
                {/* Points, Phone for Points, Membership (Hidden as requested) */}
               {/* Optional: Role display if relevant for user type */}
                {user?.role && user.role !== 'customer' && (
                    <div className="flex items-center gap-3">
                         <FaUser size={18} className="text-gray-600 flex-shrink-0"/> {/* Or different icon */}
                        <p>Vai trò: <span className="font-medium">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></p> {/* Display role */}
                    </div>
                )}
           </div>
             {/* Points Display (Hidden as requested) */}
            {/* Membership Rank (Hidden as requested) */}

             {/* Edit Profile Button for this block's info */}
             <div className="flex justify-end"> {/* Right-align button */}
                 <button
                    onClick={isEditing ? handleSave : handleEditToggle}
                     // Disable edit/save if user data is null or saving/loading
                    className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors font-semibold text-sm ${user && !isLoading ? (isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-700') : 'bg-gray-400 cursor-not-allowed'}`}
                     disabled={!user || isLoading} // Disable if user data not loaded or currently loading
                 >
                   <FaEdit size={14} /> {isEditing ? "Lưu thay đổi" : "Chỉnh sửa hồ sơ"} {/* "Save Changes" / "Edit Profile" */}
                </button>
             </div>

      </div>

       {/* Personal Information (Thông tin cá nhân section in image) */}
       {/* Use isEditing to show inputs, otherwise show paragraph text */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
             <h3 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h3> {/* "Personal Information" heading */}

            {/* Display error message at the top of this section if set */}
           {error && (
                <div className="text-red-600 text-center mb-4">{error}</div>
           )}

           {/* Date of Birth - Display/Edit */}
           <div>
             <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-600 mb-1"> Ngày sinh </label>
             {isEditing ? (
               <input id="dateOfBirth" name="dateOfBirth" type="date" // Use type="date"
                 value={formData.dateOfBirth} onChange={handleInputChange}
                 className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
             ) : (
               <p className="text-base text-gray-800 font-medium">{user?.dateOfBirth || "Not provided"}</p>
             )}
           </div>

           {/* Gender - Display/Edit */}
           <div>
             <label htmlFor="gender" className="block text-sm font-medium text-gray-600 mb-1"> Giới tính </label>
             {isEditing ? (
               <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange}
                 className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                   <option value="">Chọn Giới tính</option> {/* Placeholder */}
                   <option value="Male">Nam</option>
                   <option value="Female">Nữ</option>
                   <option value="Other">Khác</option> {/* Add other options as needed */}
               </select>
             ) : (
               <p className="text-base text-gray-800 font-medium">{user?.gender || "Not provided"}</p>
             )}
           </div>

            {/* Height - Display/Edit with unit */}
           <div>
             <label htmlFor="height" className="block text-sm font-medium text-gray-600 mb-1"> Chiều cao (cm) </label>
             {isEditing ? (
                 <div className="flex items-center gap-2">
                   <input id="height" name="height" type="number" value={formData.height} onChange={handleInputChange}
                     className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="e.g. 175" min="0" step="0.1" // Allow decimals for height
                   />
                   <span className="text-base text-gray-700">cm</span> {/* Unit */}
                 </div>
             ) : (
               <p className="text-base text-gray-800 font-medium">{user?.height ? `${user.height} cm` : "Not provided"}</p>
             )}
           </div>

            {/* Weight - Display/Edit with unit */}
           <div>
             <label htmlFor="weight" className="block text-sm font-medium text-gray-600 mb-1"> Cân nặng (kg) </label>
             {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input id="weight" name="weight" type="number" value={formData.weight} onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 65" min="0" step="0.1" // Allow decimals for weight
                    />
                    <span className="text-base text-gray-700">kg</span> {/* Unit */}
                  </div>
             ) : (
               <p className="text-base text-gray-800 font-medium">{user?.weight ? `${user.weight} kg` : "Not provided"}</p>
             )}
          </div>

           {/* Location (City/District/Ward) - Display/Edit */}
           {/* Placeholder inputs matching image, assumes data could be split or combined */}
           {/* This block might be complex with dropdowns in a real app */}
           <div className="space-y-2"> {/* Container for location fields */}
                <div> {/* City Field */}
                   <label htmlFor="city" className="block text-sm font-medium text-gray-600 mb-1"> Tỉnh/Thành phố </label>
                   {isEditing ? (
                        <input id="city" name="city" type="text" value={formData.city} onChange={handleInputChange}
                             className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="e.g. TP. Hồ Chí Minh"
                        />
                   ) : (
                         <p className="text-base text-gray-800 font-medium">{user?.city || "Not provided"}</p>
                   )}
                </div>
               {/* Add District and Ward inputs/displays here following the same pattern if needed */}
               {/* <div>... Quận/Huyện input/display ...</div> */}
               {/* <div>... Phường/Xã input/display ...</div> */}
           </div>


           {/* Cancel Button (Only show in editing mode for Personal Info) */}
          {isEditing && (
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleCancelEdit} // Use the dedicated cancel handler
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
              >
                Hủy {/* "Cancel" */}
              </button>
              {/* The Save Changes button is at the top, managing both blocks */}
            </div>
          )}
      </div>

      {/* Hide Hidden sections as requested */}
      {/* <div className="..."> Số điểm đang có ...</div> */}
      {/* <div className="..."> SĐT tích điểm ...</div> */}
      {/* <div className="..."> Màu sắc yêu thích ...</div> */}

    </div>
  );

  // Render the user's items listed for sale section ("Sản phẩm đang bán")
  // Content structure is largely based on previous implementation with some cleanup and VND formatting
  const renderUserSellingItems = () => (
    <div className="space-y-6"> {/* Reduced top padding as the section content area already has some */}
      {/* Section Header */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center md:justify-start gap-2"> {/* Flex alignment for icon */}
        <FaBox size={24} className="flex-shrink-0"/> Sản phẩm đang bán ({sellingItems.length}) {/* "Items for Sale" heading */}
      </h2>
      {/* List of Selling Items */}
      {sellingItems.length === 0 ? (
        // Message when the list is empty
        <p className="text-center text-gray-600 italic">
          Bạn chưa đăng bán sản phẩm nào. {/* "You have no items listed for sale yet." */}
        </p>
      ) : (
        // Grid/List of items
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sellingItems.map((item) => (
            <div
              key={item.productID}
              className="border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 bg-white transition-shadow hover:shadow-md"
            >
              {/* Item Image */}
              <img
                src={item.imageURL} // Using imageURL from the simulated data
                alt={item.name}
                className="w-full sm:w-28 h-40 sm:h-28 object-cover rounded-md mx-auto sm:mx-0 flex-shrink-0" // Responsive size
              />
              {/* Item Details and Actions */}
              <div className="flex-grow text-center sm:text-left space-y-1"> {/* Responsive text alignment, spacing */}

                {/* Item Name and View Details Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.name}
                  </h3>
                  {/* Link to public product details */}
                  <Link
                    to={`/products/${item.productID}`} // Assuming this route exists and renders the public product details
                    className="flex items-center text-blue-600 hover:underline text-sm mt-2 sm:mt-0 gap-1" // Styled as link, responsive margin
                  >
                    <FaLink size={14} className="flex-shrink-0" /> Xem chi tiết {/* "View Details" */}
                  </Link>
                </div>

                {/* Item Price - Use formatPrice helper */}
                 <div className="text-gray-800 font-bold text-xl">
                   {formatPrice(item.price)}
                 </div>

                 {/* Description Snippet */}
                <p className="text-gray-700 text-sm">
                  {/* Use optional chaining for safer access to description */}
                  {item.description?.substring(0, 80) || 'No description.'}{item.description && item.description.length > 80 ? "..." : ""}
                </p>

                {/* Status Badge */}
                <div className="flex items-center justify-center sm:justify-start mb-2">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBgColor(
                      item.status
                    )} ${getStatusColor(item.status)}`}
                  >
                    {item.status} {/* Display status text */}
                  </span>
                </div>

                {/* Condition Display */}
                 <div className="text-sm text-gray-600">
                     <span className="font-medium">Tình trạng:</span> {item.condition || 'N/A'} {/* Display condition */}
                 </div>

                 {/* Item Attributes */}
                <div className="text-sm text-gray-600 mt-2 space-y-0.5">
                  <p>
                    <span className="font-medium">Kích thước:</span>{" "} {/* "Size" */}
                    {item.size || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Màu sắc:</span>{" "} {/* "Color" */}
                    {item.color || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Đăng ngày:</span>{" "} {/* "Listed On" */}
                    {item.createDate ? item.createDate.toLocaleDateString() : 'N/A'} {/* Format and display date safely */}
                  </p>
                </div>

                {/* Buyer Info - ONLY show if status is 'Sold' */}
                {item.status === "Sold" && item.buyer && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-700 space-y-1 text-center sm:text-left">
                    <p className="font-semibold text-gray-800">Đã bán cho: {/* "Sold to:" */}</p>
                    <p className="flex items-center justify-center sm:justify-start gap-2">
                       <FaUser className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" /> {item.buyer.name || 'N/A'} {/* Use FaUser icon */}
                    </p>
                    {item.buyer.location && ( // Optionally show location if available
                      <p className="flex items-center justify-center sm:justify-start gap-2">
                         <FaMapMarkerAlt className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" /> {item.buyer.location} {/* Use FaMapMarkerAlt icon */}
                      </p>
                    )}
                  </div>
                )}

                {/* Edit/Delete/Manage buttons for the user's own listing (Future Feature) - Example below*/}
                {/* <div className="mt-4 space-x-3 text-center sm:text-left">
                         <Link to={`/account/listings/edit/${item.productID}`} className="text-blue-600 text-sm hover:underline font-medium">Edit</Link> // Example Edit Link
                         <button className="text-red-600 text-sm hover:underline font-medium">Delete</button> // Example Delete Button
                      </div> */}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Link to Add New Item */}
      <div className="mt-8 text-center">
        <Link
          to="/sell" // Link to the 'sell' page to list a new item
          className="inline-block bg-gradient-to-r from-blue-600 to-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
        >
          Đăng bán sản phẩm mới {/* "List a New Item" */}
        </Link>
      </div>
    </div>
  );

  // Render the Orders section (Placeholder for now)
  // This section is for orders the user has PLACED as a buyer.
  const renderOrdersView = () => (
      // Content structure based on the second image provided in chat
      <div className="space-y-6"> {/* Container for Orders view */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng {/* "Orders" */}</h2>

          {/* Tab Navigation for Orders (Đơn hàng, Trả hàng, Đổi hàng) - Placeholder structure based on image */}
          {/* Implement actual tab state and rendering if needed */}
          <div className="flex border-b border-gray-200 mb-6">
              <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-semibold">Đơn hàng</button> {/* Active Tab */}
              {/* Placeholder Tabs */}
              {/* <button className="px-4 py-2 text-gray-600 hover:text-blue-600">Trả hàng</button> */} {/* "Returns" */}
              {/* <button className="px-4 py-2 text-gray-600 hover:text-blue-600">Đổi hàng</button> */} {/* "Exchanges" */}
          </div>

           {/* Content for the active Order tab (Placeholder) */}
           <div className="text-center text-gray-600 py-8">
              {/* Placeholder Icon and Message */}
               {/* Assuming lucide-react Package icon is desired */}
              {/* <Package size={48} className="mx-auto mb-4 text-gray-400"/> */} {/* Lucide icon */}
               <div className="w-12 h-12 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center text-white text-2xl font-bold">📦</div> {/* Simple Box icon placeholder */}
               <p>Không có đơn hàng nào. {/* "No orders." */}</p>
               {/* Link to shop, etc. */}
               <Link to="/products" className="mt-4 inline-block text-blue-600 hover:underline">Browse Products</Link>
           </div>

          {/* Real Order List would go here if you fetched it */}
          {/* ... logic to fetch and display orders placed by this user ... */}

           {/* Order Filtering, Search, Date Pickers - Placeholder structure */}
           {/* This complexity from the image isn't fully built out but shown for reference */}
            {/*
            <div className="space-y-4">
                 <div className="relative">
                     <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                     <input type="text" placeholder="Tìm kiếm mã đơn hàng" className="pl-10 px-4 py-2 border rounded-md w-full" />
                 </div>
                 <div className="flex items-center gap-4">
                     <button className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm"> Bộ lọc <Filter size={16} /></button>
                     <input type="date" className="px-4 py-2 border rounded-md text-sm"/>
                      <span>→</span>
                     <input type="date" className="px-4 py-2 border rounded-md text-sm"/>
                      <button><CalendarDays size={16}/></button>
                 </div>
            </div>
            */}
      </div>
  );


    // Placeholder for other view rendering functions if needed
    const renderAddressesView = () => (
        <div className="space-y-6 pt-6">
             <h2 className="text-2xl font-bold text-gray-800 mb-6">Địa chỉ nhận hàng {/* "Shipping Address" */}</h2>
             <p>This section would show or allow editing shipping addresses.</p>
             {/* This info is partly included in renderAccountView currently */}
        </div>
    );

    const renderRewardsView = () => (
         <div className="space-y-6 pt-6">
             <h2 className="text-2xl font-bold text-gray-800 mb-6">Ưu đãi của tôi {/* "My Rewards" */}</h2>
             <p>This section would show the user's available vouchers and rewards.</p>
             {/* Could potentially integrate/link to the VoucherModal content */}
         </div>
    );

     const renderContactView = () => (
         <div className="space-y-6 pt-6">
             <h2 className="text-2xl font-bold text-gray-800 mb-6">Câu hỏi của tôi {/* "My Questions" */}</h2>
             <p>This section would show support tickets or questions asked by the user.</p>
         </div>
     );

     const renderMembershipView = () => (
         <div className="space-y-6 pt-6">
             <h2 className="text-2xl font-bold text-gray-800 mb-6">Hạng hội viên {/* "Membership Rank" */}</h2>
             <p>This section would show user's membership level and benefits.</p>
         </div>
     );
    // End Placeholder rendering functions


  // --- Loading and Error States ---
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center text-gray-700 my-8">
        <p>Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center text-red-600 my-8">
        <p>{error}</p>
        {/* Optional: Add a retry button */}
         {/* <button onClick={loadProfileData} className="mt-4 text-blue-600 hover:underline">Try Again</button> */}
      </div>
    );
  }

  // --- Not Logged In State ---
  if (!user && !isLoading && !error) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center text-gray-700 my-8">
        <p>
          You are not logged in. Please{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold"> login </Link>{" "}
          or{" "}
          <Link to="/register" className="text-green-600 hover:underline font-semibold"> register </Link>.
        </p>
      </div>
    );
  }

  // --- Main Profile Display (if user is loaded and not loading/error) ---
  // This block only renders if isLoading is false AND user is NOT null
  return (
    // Use grid layout for sidebar and main content
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8"> {/* Grid for sidebar (fixed width) and main content (flexible) */}

      {/* Left Sidebar Navigation */}
       {/* Added h-fit and sticky to keep sidebar visible on scroll */}
       <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit sticky top-24 space-y-6"> {/* Use h-fit and sticky top (adjust top value based on header height) */}
           {/* User Display Block (Matching Image) - Use main user data here */}
           {user && ( // Only show if user data is loaded
             <div className="mb-8 pb-6 border-b border-gray-200"> {/* Bottom margin and border */}
                <div className="text-center text-lg font-bold text-gray-900 mb-2">
                     {user.fullName?.toUpperCase() || user.email?.toUpperCase() || "USER"} {/* Display name or email, uppercase */}
                </div>
                 {/* Hidden stats based on requested omissions */}
                 {/* Số điểm đang có */}
                 {/* SĐT tích điểm */}
                 {/* Hạng hội viên */}
                 {/* Colors Yêu thích */}

                  {/* Optional NEW button? Needs definition of its action */}
                 {/* <button className="w-full px-4 py-2 bg-gray-200 rounded-md text-gray-800 font-semibold hover:bg-gray-300 transition">NEW</button> */}
             </div>
            )}


            {/* Navigation Links */}
            <div className="space-y-1"> {/* Reduced space */}
                 {profileNavOptions.map(option => (
                     // Skip rendering certain options as requested
                     ['rewards', 'contact'].includes(option.key) ? null : ( // Hide specific options by key
                         <button
                             key={option.key}
                             onClick={() => setActiveView(option.key)} // Set active view state on click
                             className={`flex justify-between items-center w-full text-left px-3 py-2 rounded-md transition-colors ${
                                 activeView === option.key // Active link styling
                                  ? 'bg-blue-50 text-blue-700 font-semibold'
                                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800' // Inactive link styling
                             }`}
                         >
                             <span>{option.label}</span>
                             <FaChevronRight size={12} className="flex-shrink-0" /> {/* Right arrow icon */}
                         </button>
                     )
                 ))}
            </div>

             {/* Logout Button (Positioned lower) */}
            <div className="pt-6 border-t border-gray-200 mt-auto"> {/* Added border top and mt-auto to push down if space allows */}
               <button
                 onClick={handleLogout}
                 className="flex items-center gap-2 w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
               >
                  <span className="font-semibold">Đăng xuất</span> {/* "Logout" text */}
               </button>
           </div>

       </div>

      {/* Right Content Area */}
       {/* The content rendered here changes based on `activeView` */}
       <div className="md:col-span-1"> {/* Takes the rest of the space */}
           {/* The individual rendering functions already add their own internal padding (pt-6) */}
           {/* Account view renders both Tài khoản and Thông tin cá nhân blocks */}
           {activeView === 'account' && renderAccountView()}
           {/* My Listings view renders the selling items list */}
           {activeView === 'myListings' && renderUserSellingItems()}
            {/* Orders view placeholder */}
           {activeView === 'orders' && renderOrdersView()}
            {/* Other view placeholders */}
            {activeView === 'addresses' && renderAddressesView()} {/* Or maybe addresses handled inside account view */}
            {activeView === 'rewards' && renderRewardsView()}
            {activeView === 'contact' && renderContactView()}
             {activeView === 'membership' && renderMembershipView()}

            {/* Fallback for unknown views - should not happen with correct setup */}
            { !profileNavOptions.map(o => o.key).includes(activeView) && (
                <div className="pt-6 text-center text-gray-600">
                     Content not found for view: {activeView}
                </div>
             )}
       </div>
    </div>
  );
}