// src/context/CartContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
// Import any icons used in the context logic itself if any (none in this case)
// import { FaIcon } from 'react-icons/fa';


// --- Persistence Logic (Moved Here) ---
const loadCartItems = () => {
  try {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Ensure parsed data is an array; filter out any invalid items if necessary
        return Array.isArray(parsedCart) ? parsedCart.filter(item => item && typeof item.id !== 'undefined' && typeof item.quantity === 'number' && typeof item.price === 'number') : [];
    }
     return []; // Return empty array if nothing found
  } catch (error) {
    console.error("Could not load cart from localStorage:", error);
    return []; // Return empty array on parsing error
  }
};

const saveCartItems = (items) => {
  try {
     if (Array.isArray(items)) {
        localStorage.setItem("cartItems", JSON.stringify(items));
     }
  } catch (error) {
    console.error("Could not save cart to localStorage:", error);
  }
};

// Sample data used ONLY if localStorage is initially empty or invalid
// Quantities are set to 1 to reflect the secondhand constraint
const sampleCartItems = [
  {
    id: 1,
    name: "Classic Beige Shirt",
    image: "https://via.placeholder.com/80/D3D3D3/000000?text=Shirt",
    price: 499000,
    quantity: 1, // Should be 1 for unique item
  },
  {
    id: 2,
    name: "Black Hoodie",
    image: "https://via.placeholder.com/80/000000/FFFFFF?text=Hoodie",
    price: 750000,
    quantity: 1, // Should be 1 for unique item
  },
  {
    id: 3,
    name: "Olive Cargo Pants",
    image: "https://via.placeholder.com/80/8FBC8F/000000?text=Pants",
    price: 399000,
    quantity: 1, // Should be 1 for unique item
  },
];
// --- End Persistence Logic ---


// Create the Context
const CartContext = createContext(undefined); // Initialize with undefined


// Custom hook to consume the context - This is what components will import and use
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    // Throw an error if the hook is used outside the provider - this is the error you saw
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};


// Cart Provider Component - This component will wrap the parts of your app that need cart access
export const CartProvider = ({ children }) => {
  // --- Cart State and Logic (Moved Here) ---
  // Initialize cart state: Load from localStorage, if empty use sample data
  const [cartItems, setCartItems] = useState(() => {
    const stored = loadCartItems();
     // Use sample data only if localStorage data is empty or invalid (not an array or empty)
     // Also ensures quantities are 1 even if loaded data was inconsistent for demo
    return (stored && Array.isArray(stored) && stored.length > 0)
        ? stored.map(item => ({ ...item, quantity: 1 })) // Force quantity 1 for items loaded from storage
        : sampleCartItems.map(item => ({ ...item, quantity: 1 })); // Ensure sample items also start with quantity 1
  });


  // Effect to save cart items to localStorage whenever the cartItems state changes
  useEffect(() => {
    saveCartItems(cartItems);
  }, [cartItems]); // Dependency array: re-run effect when cartItems changes


  // Calculate derived values
  const totalItemsCount = cartItems.length; // For secondhand, total count is just the number of items
    // Total quantity is the same as total items count now.

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0), // Safely access price/quantity
    0 // Initial value for the sum
  );

  // Format price (Vietnamese Dong) - Utility function also provided by context
  const formatPrice = (price) => {
    if (typeof price !== "number" || isNaN(price)) {
         console.warn("formatPrice received non-numeric input:", price); // Log warning
         return "N/A";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0, // Display no decimal places
    }).format(price);
  };


  // --- Cart Item Management Handlers (Logic for secondhand unique items) ---

  // Add a NEW item to the cart (used by 'Add to Cart' buttons on product pages)
  // Ensures quantity is 1 and prevents adding duplicates based on ID.
  const addItemToCart = (productToAdd) => {
       setCartItems(prevItems => {
            // Prevent adding if item with this ID already exists
           const existingItem = prevItems.find(item => item.id === productToAdd.id);
            if (existingItem) {
               console.warn(`Item "${productToAdd.name}" (ID: ${productToAdd.id}) already in cart.`);
                // Optional: Implement notification here if needed (e.g., Toast saying "Item already in cart")
                return prevItems; // Return current state unchanged
            }

           // Basic validation for required properties on the product object
            if (!productToAdd || typeof productToAdd.id === 'undefined' || !productToAdd.name || typeof productToAdd.price !== 'number') {
                console.error("Attempted to add invalid/incomplete product data to cart:", productToAdd);
                // Optional: Implement an error notification here if needed
                return prevItems; // Don't add invalid data
            }

           // Create the new item with quantity 1
           const newItem = {
                id: productToAdd.id,
               name: productToAdd.name,
                image: productToAdd.image || null, // Allow image to be optional, provide null fallback
               price: productToAdd.price,
               quantity: 1, // Always set quantity to 1 for unique item
               // Consider copying other useful display properties like:
               // condition: productToAdd.condition,
               // seller: productToAdd.seller,
               // location: productToAdd.location,
               // ... etc.
           };

           console.log(`Adding item "${newItem.name}" (ID: ${newItem.id}) to cart.`);
           return [...prevItems, newItem]; // Add the new item to the end of the array
       });
  };

  // Update quantity (Simplified for secondhand: only handles removal via delta -1)
  // This handler is used by the +/- buttons in the cart UI.
  // Since quantity is always 1, delta +1 attempts are ignored by the UI button disabled state.
  // delta -1 attempt removes the item entirely.
  const updateQuantity = (id, delta) => {
       setCartItems(prevItems => {
           const itemIndex = prevItems.findIndex(item => item.id === id);

            // If item not found, or delta is positive (attempting to increase quantity > 1)
           if (itemIndex === -1 || delta > 0) {
               console.warn(`Item ${id} not found or increasing quantity for secondhand item is disallowed.`);
                return prevItems; // Return current state unchanged
           }

            // If delta is negative (attempting to decrease), remove the item entirely.
            // The logic already ensures newQuantity <= 0 below.
            // Calling removeItem directly might be clearer, but let's stick to updateQuantity with delta for consistency.
            // The result of delta -1 on quantity 1 IS intended removal.
             const item = prevItems[itemIndex];
             const newQuantity = (item.quantity || 0) + delta; // This should be 1 + (-1) = 0

            // If the new quantity is zero or less, filter out the item.
           if (newQuantity <= 0) {
               console.log(`Removing item ID ${id} from cart via quantity decrement.`);
               return prevItems.filter(item => item.id !== id); // Remove the item from the cart
           }

           // If we reach here, delta was -1, but quantity > 1 (inconsistent state).
           // Log warning and remove the item to enforce quantity 1 rule.
           console.warn(`Unexpected state: Decrementing quantity for item ID ${id}, but current quantity was > 1. Removing item.`);
           return prevItems.filter(item => item.id !== id); // Enforce quantity 1 rule by removal


      });
  };

  // Handle removing an item (used by the trash icon) - Simple filter
  const removeItem = (id) => {
       console.log(`Removing item ID ${id} from cart via trash icon.`);
    setCartItems(prevItems => {
        const newItems = prevItems.filter((item) => item.id !== id);
        // Optional: Confirm item was removed if prevItems length changed
        if (newItems.length < prevItems.length) {
             console.log(`Item ID ${id} successfully removed.`);
        } else {
             console.warn(`Item ID ${id} not found in cart for removal attempt.`);
        }
        return newItems;
    });
  };
  // --- End Cart Item Management Handlers ---


  // Value object provided by the context
  const contextValue = {
    cartItems,           // The array of items in the cart
    totalItemsCount,     // Number of unique items in the cart
    subtotal,            // Total price of items in the cart
    formatPrice,         // Utility function to format price (VND)
    addItemToCart,       // Function to add a new item (from product details, etc.)
    // updateQuantity,   // <-- Decide if you still need this exact function exposed or if `removeItem` is sufficient for UI
    removeItem,          // Function to remove an item entirely
    // Add other values/functions if needed, e.g., applyVoucher, clearCart
  };

  // --- End Cart State and Logic ---


  // Provide the context value to the components tree below this provider
  return (
    <CartContext.Provider value={contextValue}>
      {children} {/* This is where the components wrapped by CartProvider will render */}
    </CartContext.Provider>
  );
};

// Make sure react-icons/fa is installed if you used icons within the context file itself (we didn't, but good check)
// Make sure the CSS for `.no-scrollbar` is defined somewhere accessible globally if used.