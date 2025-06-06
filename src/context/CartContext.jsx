// src/context/CartContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem("cartItems");
      if (localData) {
        const parsedItems = JSON.parse(localData);
        return parsedItems.map((item) => ({
          ...item,
          id: item.id,
          name: item.name || "Unnamed Product",
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity, 10) || 1,
          image: item.image || "https://via.placeholder.com/80",
        }));
      }
      return [];
    } catch (error) {
      console.error(
        "CartContext: Error parsing cartItems from localStorage",
        error
      );
      return [];
    }
  });

  const [selectedItems, setSelectedItems] = useState({});
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false);

  const openCartPanel = () => setIsCartPanelOpen(true);
  const closeCartPanel = () => setIsCartPanelOpen(false);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addItemToCart = (productToAdd) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === productToAdd.id
      );
      if (existingItem) {
        return prevItems;
      }
      return [
        ...prevItems,
        {
          ...productToAdd,
          price: parseFloat(productToAdd.price) || 0,
          quantity: 1,
        },
      ];
    });
    // openCartPanel(); // Kept removed as per your request
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

  const updateQuantity = (productId, newQuantityInput) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: 1 } : item
      )
    );
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
    if (!cartItems || !Array.isArray(cartItems) || !selectedItems) return []; // Added Array.isArray check
    return cartItems.filter(
      (item) => item && typeof item.id !== "undefined" && selectedItems[item.id]
    );
  };

  const totalCartItemCount = useMemo(() => {
    // Wrapped in useMemo for consistency
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    return cartItems.length;
  }, [cartItems]);

  const subtotalOfSelectedItems = useMemo(() => {
    // Ensure getSelectedCartItems returns an array before calling reduce
    const currentSelectedItems = getSelectedCartItems();
    if (!Array.isArray(currentSelectedItems)) return 0; // Guard

    return currentSelectedItems.reduce((total, item) => {
      const price = parseFloat(item.price);
      const quantity = 1;
      if (isNaN(price)) return total;
      return total + price * quantity;
    }, 0);
  }, [cartItems, selectedItems]); // getSelectedCartItems is not stable, so depend on its own dependencies

  // --- SUBTOTAL OF ALL ITEMS (for CustomerLayout cart panel) ---
  const subtotalOfAllItems = useMemo(() => {
    if (!cartItems || !Array.isArray(cartItems)) {
      return 0;
    }
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price);
      const quantity = 1; // Assuming quantity is always 1 for each item entry
      if (isNaN(price)) {
        console.warn(
          `CartContext: Item ID ${
            item?.id || "unknown"
          } has invalid price for subtotalOfAllItems: ${item?.price}`
        );
        return total;
      }
      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  const selectedItemsCount = useMemo(() => {
    const currentSelectedItems = getSelectedCartItems();
    if (!Array.isArray(currentSelectedItems)) return 0; // Guard
    return currentSelectedItems.length;
  }, [cartItems, selectedItems]); // Same dependencies as subtotalOfSelectedItems

  const formatPrice = (price) => {
    if (price == null || isNaN(parseFloat(price))) return "N/A";
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(parseFloat(price));
    } catch (e) {
      return `${price} VND`;
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedItems({});
  };

  const value = {
    cartItems,
    addItemToCart,
    removeItem,
    updateQuantity,
    totalCartItemCount,
    subtotal: subtotalOfSelectedItems,
    subtotalOfAllItems,
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
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
