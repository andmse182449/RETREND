import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import orderItemsApiService from "../services/OrderItemsApiService";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem("cartItems");
      return localData
        ? JSON.parse(localData).map((item) => ({
            ...item,
            id: item.id,
            orderItemsId: item.orderItemsId,
            name: item.name || "Unnamed Product",
            price: parseFloat(item.price) || 0,
            quantity: 1,
            image: item.image || "https://via.placeholder.com/80",
          }))
        : [];
    } catch (error) {
      console.error("Error parsing cartItems from localStorage", error);
      return [];
    }
  });

  const [selectedItems, setSelectedItems] = useState({});
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false);

  // Memoize panel functions to prevent unnecessary re-renders
  const openCartPanel = useCallback(() => setIsCartPanelOpen(true), []);
  const closeCartPanel = useCallback(() => setIsCartPanelOpen(false), []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    setSelectedItems((prev) => {
      const newSelected = {};
      cartItems.forEach((item) => {
        if (item?.id !== undefined && prev[item.id]) {
          newSelected[item.id] = true;
        }
      });
      return newSelected;
    });
  }, [cartItems]);

  const addItemToCart = (productToAdd) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === productToAdd.id
      );
      if (existingItem) {
        toast.info(`${productToAdd.name || "Sản phẩm"} đã có trong giỏ hàng.`);
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
  };
  const removeItem = useCallback(
    async (productIdToRemove) => {
      const itemToRemove = cartItems.find(
        (item) => item.id === productIdToRemove
      );

      if (!itemToRemove) {
        console.warn(`Item with productId ${productIdToRemove} not found`);
        return;
      }

      try {
        if (itemToRemove.orderItemsId > 0) {
          await orderItemsApiService.deleteOrderItem(itemToRemove.orderItemsId);
        }
        setCartItems((prev) =>
          prev.filter((item) => item.id !== productIdToRemove)
        );
        toast.success(
          `${itemToRemove.name || "Sản phẩm"} đã được xóa khỏi giỏ hàng!`
        );
      } catch (error) {
        console.error(`Failed to delete order item:`, error);
        toast.error(
          `Lỗi xóa sản phẩm: ${error.message || "Vui lòng thử lại."}`
        );
      }
    },
    [cartItems]
  );

  const updateQuantity = (productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: 1 } : item
      )
    );
  };

  const toggleItemSelected = (productId) => {
    if (productId === undefined) return;
    setSelectedItems((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const selectAllItems = useCallback(() => {
    const newSelected = {};
    cartItems.forEach((item) => {
      if (item?.id !== undefined) newSelected[item.id] = true;
    });
    setSelectedItems(newSelected);
  }, [cartItems]);

  const deselectAllItems = useCallback(() => {
    setSelectedItems({});
  }, []);

  const getSelectedCartItems = useCallback(() => {
    return cartItems.filter(
      (item) => item?.id !== undefined && selectedItems[item.id]
    );
  }, [cartItems, selectedItems]);

  const totalCartItemCount = useMemo(
    () => (Array.isArray(cartItems) ? cartItems.length : 0),
    [cartItems]
  );

  const subtotalOfSelectedItems = useMemo(() => {
    return getSelectedCartItems().reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + price;
    }, 0);
  }, [getSelectedCartItems]);

  const subtotalOfAllItems = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + price;
    }, 0);
  }, [cartItems]);

  const selectedItemsCount = useMemo(
    () => getSelectedCartItems().length,
    [getSelectedCartItems]
  );

  const formatPrice = useCallback((price) => {
    if (price == null || isNaN(parseFloat(price))) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await Promise.all(
        cartItems
          .filter((item) => item.orderItemsId)
          .map((item) =>
            orderItemsApiService.deleteOrderItem(item.orderItemsId)
          )
      );
      setCartItems([]);
      setSelectedItems({});
      toast.info("Giỏ hàng đã được xóa.");
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }, [cartItems]);

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
