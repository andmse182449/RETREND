// src/context/CartContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure styles are imported

import orderItemsApiService from "../services/OrderItemsApiService"; // For creating/deleting order items
import { getProductById } from "../services/ProductService"; // For fetching product details

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const getCurrentUsernameForCart = () => {
  const userString = localStorage.getItem("user");
  if (userString) {
    try {
      const userData = JSON.parse(userString);
      return userData.username || null;
    } catch {
      return null;
    }
  }
  return null;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // Will be populated from backend
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [cartError, setCartError] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const openCartPanel = useCallback(() => setIsCartPanelOpen(true), []);
  const closeCartPanel = useCallback(() => setIsCartPanelOpen(false), []);

  const refreshCartFromApi = async (username) => {
    if (!username) {
      console.warn("CartContext: Cannot refresh cart without username");
      return;
    }

    setIsLoading(true);
    try {
      const apiCartItems = await orderItemsApiService.getOrderItemsByUsername(
        username
      );

      // Transform API cart items to your local cart format if needed
      const formattedCartItems = apiCartItems.map((item) => ({
        id: item.productId,
        orderItemsId: item.orderItemsId,
        username: item.username,
        // Add other product details as needed
        // You might need to fetch product details separately or include them in the API response
      }));

      setCartItems(formattedCartItems);
      console.log("Cart refreshed from API:", formattedCartItems);
    } catch (error) {
      console.error("CartContext: Failed to refresh cart from API:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadCartFromBackend = useCallback(
    async (showLoadingIndicator = true) => {
      const username = getCurrentUsernameForCart();
      if (!username) {
        setCartItems([]);
        setIsLoadingCart(false);
        console.log("CartContext: No username, cart cleared for load.");
        return;
      }

      if (showLoadingIndicator) setIsLoadingCart(true);
      setCartError(null);
      try {
        console.log(
          `CartContext: Fetching order item stubs for username: ${username}`
        );
        const orderItemStubs =
          await orderItemsApiService.getOrderItemsByUsername(username);
        console.log(
          "CartContext: Received orderItemStubs:",
          JSON.stringify(orderItemStubs, null, 2)
        ); // LOG 1

        if (!orderItemStubs || orderItemStubs.length === 0) {
          setCartItems([]);
          setIsLoadingCart(false);
          console.log("CartContext: No order item stubs found for user.");
          return;
        }

        // For each stub, fetch full product details
        const productDetailPromises = orderItemStubs.map(async (stub) => {
          if (!stub || typeof stub.productId === "undefined") {
            console.warn(
              "CartContext: Invalid order item stub (missing productId):",
              stub
            );
            return null;
          }
          console.log(
            `CartContext: Fetching details for productId: ${stub.productId}`
          ); // LOG 2
          const productDetails = await getProductById(stub.productId); // Calls productService
          console.log(
            `CartContext: Received productDetails for ${stub.productId}:`,
            JSON.stringify(productDetails, null, 2)
          ); // LOG 3

          if (productDetails) {
            // productDetails is already transformed, includes id, name, priceVND, image etc.
            return {
              // Fields from the order item stub
              orderItemsId: stub.orderItemsId,
              // Fields from the fetched and transformed product details
              ...productDetails,
              // Explicitly ensure quantity, and override any productDetails.quantity if present
              quantity: 1,
              // username from stub is the cart owner, productDetails.seller is the product lister.
              // Decide which username to keep if they conflict or store both if needed.
              // For cart display, productDetails.seller is usually more relevant for "Sold by".
              // Let's assume productDetails (transformed) already has a 'seller' field.
            };
          }
          console.warn(
            `CartContext: Could not fetch product details for productId: ${stub.productId}`
          );
          return null; // Return null if product details couldn't be fetched
        });

        const enrichedItemsResults = await Promise.all(productDetailPromises);
        // Filter out any nulls (where product details fetch failed)
        const validEnrichedItems = enrichedItemsResults.filter(
          (item) => item !== null && item.id && typeof item.price === "number"
        );

        console.log(
          "CartContext: Final validEnrichedItems to be set as cartItems:",
          JSON.stringify(validEnrichedItems, null, 2)
        ); // LOG 4
        setCartItems(validEnrichedItems); // Set the enriched items

        // ... (setSelectedItems logic) ...
      } catch (error) {
        console.error("CartContext: Error in loadCartFromBackend:", error);
        setCartError(error.message || "Lỗi tải giỏ hàng từ máy chủ.");
        setCartItems([]);
      } finally {
        if (showLoadingIndicator) setIsLoadingCart(false);
      }
    },
    []
  ); // Keep empty if getCurrentUsernameForCart is stable and services are singletons
  const updateCartItems = (newCartItems) => {
    setCartItems(newCartItems);
  };
  // --- Initial Cart Load ---
  useEffect(() => {
    // console.log("CartContext: Initial mount, attempting to load cart from backend.");
    loadCartFromBackend();
    // TODO: Consider adding a listener for login/logout events to trigger loadCartFromBackend.
  }, [loadCartFromBackend]); // loadCartFromBackend is stable

  // --- Sync to localStorage (Optional, backend is source of truth) ---
  useEffect(() => {
    if (!isLoadingCart) {
      // Only save when not in the middle of initial/refresh load
      // console.log("CartContext: Persisting cartItems to localStorage", cartItems);
      localStorage.setItem(
        "cartItems",
        JSON.stringify(
          cartItems.map((item) => ({
            // Store only necessary data to avoid bloating localStorage
            id: item.id,
            orderItemsId: item.orderItemsId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
            // Omit other large fields like description if not needed for quick load
          }))
        )
      );
    }
  }, [cartItems, isLoadingCart]);

  // --- addItemToCart now creates backend order item then refreshes ---
  const addItemToCart = useCallback(
    async (productToAdd) => {
      const username = getCurrentUsernameForCart();
      if (!username) {
        toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
        // navigate('/login'); // Consider navigating to login
        return;
      }
      const existingItem = cartItems.find(
        (item) => item.id === productToAdd.id
      );
      if (existingItem) {
        toast.info(
          `${productToAdd.name || "Sản phẩm"} đã có trong giỏ hàng của bạn.`
        );
        // Optionally: if you want to ensure only ONE orderItem per product per user on backend,
        // you might not even make an API call here, or your backend createOrderItem should handle it.
        return;
      }
      // Optimistic check to prevent multiple rapid clicks for the same item
      const existingItemInLocalCart = cartItems.find(
        (item) => item.id === productToAdd.id
      );
      if (existingItemInLocalCart) {
        toast.info(`${productToAdd.name || "Sản phẩm"} đã có trong giỏ hàng.`);
        // openCartPanel(); // Optionally open panel
        return;
      }

      try {
        await loadCartFromBackend(false);
        // // productToAdd.id is the productId
        // const createdOrderItemBackendData =
        //   await orderItemsApiService.createOrderItem(username, productToAdd.id);

        // if (
        //   createdOrderItemBackendData &&
        //   createdOrderItemBackendData.orderItemsId
        // ) {
        //   toast.success(
        //     `${
        //       productToAdd.name || "Sản phẩm"
        //     } đã được thêm vào giỏ! Đang cập nhật...`
        //   );
        //   await loadCartFromBackend(false); // Refresh cart from backend without full loading indicator
        //   // The new item will appear with all details.
        // } else {
        //   throw new Error(
        //     "Phản hồi không hợp lệ từ máy chủ khi thêm sản phẩm."
        //   );
        // }
      } catch (error) {
        console.error(
          "CartContext: Error during addItemToCart (API call):",
          error
        );
        toast.error(
          `Lỗi thêm sản phẩm: ${error.message || "Vui lòng thử lại."}`
        );
      }
    },
    [cartItems, loadCartFromBackend]
  );

  // --- removeItem now deletes backend order item then refreshes ---
  const removeItem = useCallback(
    async (productIdToRemove) => {
      const itemToRemove = cartItems.find(
        (item) => item.id === productIdToRemove
      );
      if (!itemToRemove) {
        toast.error("Không tìm thấy sản phẩm trong giỏ để xóa.");
        return;
      }
      if (
        typeof itemToRemove.orderItemsId !== "number" ||
        itemToRemove.orderItemsId <= 0
      ) {
        toast.warn(
          "Sản phẩm này không có ID hợp lệ để xóa từ máy chủ, xóa tại đây."
        );
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== productIdToRemove)
        );
        return;
      }

      try {
        const deleteResponse = await orderItemsApiService.deleteOrderItem(
          itemToRemove.orderItemsId
        );
        if (deleteResponse && deleteResponse.success) {
          toast.success(
            `${
              itemToRemove.name || "Sản phẩm"
            } đã được xóa. Đang cập nhật giỏ hàng...`
          );
          await loadCartFromBackend(false); // Refresh cart from backend
        } else {
          throw new Error(
            deleteResponse?.messages || "Lỗi xóa sản phẩm từ máy chủ."
          );
        }
      } catch (error) {
        console.error(
          `CartContext: Failed to delete order item ${itemToRemove.orderItemsId}:`,
          error
        );
        toast.error(
          `Lỗi xóa sản phẩm: ${error.message || "Vui lòng thử lại."}`
        );
      }
    },
    [cartItems, loadCartFromBackend]
  );

  // updateQuantity: Quantity is fixed at 1 for secondhand model
  const updateQuantity = useCallback((productId) => {
    // For this model, quantity is always 1, so this function might not be actively used
    // If it were, it would just ensure the quantity is 1.
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: 1 } : item
      )
    );
    toast.info("Số lượng sản phẩm được đặt lại thành 1.");
  }, []);

  const toggleItemSelected = useCallback((productId) => {
    /* ... */ if (productId === undefined) return;
    setSelectedItems((prev) => ({ ...prev, [productId]: !prev[productId] }));
  }, []);
  const selectAllItems = useCallback(() => {
    /* ... */ const newSelected = {};
    cartItems.forEach((item) => {
      if (item?.id !== undefined) newSelected[item.id] = true;
    });
    setSelectedItems(newSelected);
  }, [cartItems]);
  const deselectAllItems = useCallback(() => {
    setSelectedItems({});
  }, []);
  const getSelectedCartItems = useCallback(
    () =>
      cartItems.filter(
        (item) => item?.id !== undefined && selectedItems[item.id]
      ),
    [cartItems, selectedItems]
  );

  const totalCartItemCount = useMemo(
    () => (Array.isArray(cartItems) ? cartItems.length : 0),
    [cartItems]
  );
  const subtotalOfSelectedItems = useMemo(
    () =>
      getSelectedCartItems().reduce(
        (total, item) => total + (parseFloat(item.price) || 0),
        0
      ),
    [getSelectedCartItems]
  );
  const subtotalOfAllItems = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + (parseFloat(item.price) || 0),
        0
      ),
    [cartItems]
  );
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
    const username = getCurrentUsernameForCart();
    if (!username) {
      toast.error("Lỗi: Người dùng không xác định.");
      return;
    }

    setIsLoadingCart(true); // Indicate activity
    try {
      // Instead of individual deletes, ideally backend has a "clear cart for user" endpoint
      // For now, iterating:
      const deletePromises = cartItems
        .filter(
          (item) =>
            item &&
            typeof item.orderItemsId === "number" &&
            item.orderItemsId > 0
        )
        .map((item) =>
          orderItemsApiService
            .deleteOrderItem(item.orderItemsId)
            .catch((err) => {
              console.error(
                `CartContext: Failed to delete order item ${item.orderItemsId} during clearCart.`,
                err
              );
              // Don't let one failure stop others, but maybe collect errors
            })
        );

      await Promise.all(deletePromises);
      setCartItems([]);
      setSelectedItems({});
      toast.info("Giỏ hàng đã được dọn sạch.");
    } catch (error) {
      console.error("CartContext: Error during clearCart process:", error);
      toast.error("Lỗi khi dọn sạch giỏ hàng.");
    } finally {
      setIsLoadingCart(false);
    }
  }, [cartItems]);

  const value = {
    cartItems,
    isLoading,
    isLoadingCart,
    cartError,
    addItemToCart,
    refreshCartFromApi,
    updateCartItems,
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
    refreshCart: loadCartFromBackend, // Expose for manual refresh
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
