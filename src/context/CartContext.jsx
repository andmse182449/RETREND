// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem("cartItems");
      if (localData) {
        const parsedItems = JSON.parse(localData);
        // CRITICAL: Ensure all items from localStorage have a quantity
        return parsedItems.map((item) => ({
          ...item,
          id: item.id, // Ensure ID is present and correct
          price: parseFloat(item.price) || 0, // Ensure price is a number
          quantity: parseInt(item.quantity, 10) || 1, // Ensure quantity is a number, default 1
        }));
      }
      return [];
    } catch (error) {
      console.error("Error parsing cartItems from localStorage", error);
      return [];
    }
  });

  const [selectedItems, setSelectedItems] = useState({});
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false);

  const openCartPanel = () => setIsCartPanelOpen(true);
  const closeCartPanel = () => setIsCartPanelOpen(false);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    // Optional: Decide if selectedItems should reset when cartItems change.
    // If you want to keep selections, you might need more complex logic here.
    // For simplicity now, let's not reset it here, CartPage can handle initial selection.
    // setSelectedItems({});
  }, [cartItems]);

  const addItemToCart = (productToAdd) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === productToAdd.id
      );
      if (existingItem) {
        // For secondhand, if item exists, don't add again or change quantity
        return prevItems;
      }
      // Ensure added product has necessary fields
      return [
        ...prevItems,
        {
          ...productToAdd,
          id: productToAdd.id, // Ensure ID from product
          price: parseFloat(productToAdd.price) || 0, // Ensure price is a number
          quantity: 1, // Always quantity 1 for new secondhand item
        },
      ];
    });
    openCartPanel();
  };

  const removeItem = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
    setSelectedItems((prevSelected) => {
      const newSelected = { ...prevSelected };
      delete newSelected[productId];
      return newSelected;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    // For secondhand, quantity is always 1. This function effectively only allows
    // setting quantity back to 1 if it somehow changed, or removing if newQuantity <= 0.
    const quantity = Math.max(1, parseInt(newQuantity, 10) || 1); // Force to 1 or more
    if (quantity <= 0) {
      removeItem(productId); // Or just set to 1
    } else {
      setCartItems((prevItems) =>
        prevItems.map(
          (item) => (item.id === productId ? { ...item, quantity: 1 } : item) // Force quantity 1
        )
      );
    }
  };

  const toggleItemSelected = (productId) => {
    if (typeof productId === "undefined") return;
    setSelectedItems((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const selectAllItems = () => {
    const newSelected = {};
    cartItems.forEach((item) => {
      if (item && typeof item.id !== "undefined") newSelected[item.id] = true;
    });
    setSelectedItems(newSelected);
  };

  const deselectAllItems = () => {
    setSelectedItems({});
  };

  const getSelectedCartItems = () => {
    if (!cartItems || !selectedItems) return [];
    return cartItems.filter(
      (item) => item && typeof item.id !== "undefined" && selectedItems[item.id]
    );
  };

  // --- TOTAL ITEM COUNT (BADGE) ---
  // This should count unique items if quantity is always 1 per unique item.
  // Or sum of quantities if one product ID can have multiple quantities (not for your secondhand model).
  // For secondhand, totalCartItemCount is effectively cartItems.length
  const totalCartItemCount = cartItems.length;

  // If you were to sum quantities (not for secondhand with qty 1 per item):
  // const totalCartItemCount = cartItems.reduce((count, item) => count + (parseInt(item.quantity, 10) || 0), 0);

  // --- SUBTOTAL (of selected items) ---
  const subtotalOfSelectedItems = getSelectedCartItems().reduce(
    (total, item) => {
      const price = parseFloat(item.price);
      console.log("Calculating subtotal for item:", item);
      if ((price)) {
        console.warn(`Invalid price for item ${item.id}:`, item.price);
        return total; // Skip invalid prices
      }
      // quantity is 1 for selected items from getSelectedCartItems (as they are from cartItems with qty 1)
      const quantity = 1;
      if ((price)) return total;
      return total + price * quantity;
    },
    0
  );

  const selectedItemsCount = getSelectedCartItems().length;

  const formatPrice = (price) => {
    if (price == null || isNaN(parseFloat(price))) return "N/A";
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(parseFloat(price));
    } catch (e) {
      return `${price} VND`;
    }
  };

  // Function to clear cart (useful after order)
  const clearCart = () => {
    setCartItems([]);
    setSelectedItems({});
    // localStorage.removeItem('cartItems'); // Handled by useEffect on cartItems
  };

  const value = {
    cartItems,
    addItemToCart,
    removeItem,
    updateQuantity,
    totalCartItemCount, // This is for the badge
    subtotal: subtotalOfSelectedItems, // For checkout summary of selected
    formatPrice,
    isCartPanelOpen,
    openCartPanel,
    closeCartPanel,
    selectedItems,
    toggleItemSelected,
    selectAllItems,
    deselectAllItems,
    getSelectedCartItems,
    selectedItemsCount,
    clearCart, // Expose clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
