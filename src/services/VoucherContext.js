// src/context/VoucherContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import voucherApiService from '../services/VoucherApiService'; // Adjust path
import { useCart } from './CartContext'; // Assuming formatPrice might be needed here too

const VoucherContext = createContext();

export const useVouchers = () => useContext(VoucherContext);

export const VoucherProvider = ({ children }) => {
  const [apiVouchers, setApiVouchers] = useState([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [voucherError, setVoucherError] = useState(null);
  const { formatPrice } = useCart(); // Get formatPrice if needed for voucher formatting

  // Memoize the fetch function to prevent re-creation on every render
  const fetchAndFormatVouchers = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log("VoucherContext: No auth token, clearing vouchers.");
      setApiVouchers([]);
      setIsLoadingVouchers(false); // Ensure loading is false
      return;
    }

    setIsLoadingVouchers(true);
    setVoucherError(null);
    try {
      const fetchedVouchersFromApi = await voucherApiService.getAvailableVouchers();
      const formattedVouchers = (fetchedVouchersFromApi || []).map(apiVoucher => {
        let title = `Giảm ${formatPrice(apiVoucher.discountAmount || 0)}`;
        // Add more sophisticated title logic here if discountAmount can be percentage
        // e.g., based on an apiVoucher.discountType field

        let condition = "Áp dụng cho mọi đơn hàng";
        if (apiVoucher.minOrderAmount != null && apiVoucher.minOrderAmount > 0) {
          condition = `Đơn hàng từ ${formatPrice(apiVoucher.minOrderAmount)}`;
        } else if (apiVoucher.minOrderAmount === 0) {
           condition = "Áp dụng cho mọi đơn hàng";
        }

        let expiry = "Vô thời hạn";
        if (apiVoucher.expiryDate) {
          try {
            expiry = new Date(apiVoucher.expiryDate).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          } catch (e) {
            expiry = "Không xác định";
          }
        }
        return {
          id: apiVoucher.voucherId,
          title: title,
          condition: condition,
          code: apiVoucher.code,
          expiry: expiry,
        };
      });
      setApiVouchers(formattedVouchers);
    } catch (error) {
      console.error("VoucherContext: Failed to fetch/process vouchers:", error);
      setVoucherError(error.message || "Could not load vouchers.");
      setApiVouchers([]);
      // Handle 401 if needed
    } finally {
      setIsLoadingVouchers(false);
    }
  }, [formatPrice]); // formatPrice is a dependency

  // Fetch vouchers when the provider mounts or when token availability might change
  // This effect will run once on mount if a token is present.
  // If you have a global auth state that signals login/logout, you can trigger refetch based on that.
  useEffect(() => {
    fetchAndFormatVouchers();
  }, [fetchAndFormatVouchers]); // Depend on the memoized fetch function

  // Value provided by the context
  const value = {
    vouchers: apiVouchers,
    isLoadingVouchers,
    voucherError,
    refetchVouchers: fetchAndFormatVouchers, // Expose a refetch function
  };

  return <VoucherContext.Provider value={value}>{children}</VoucherContext.Provider>;
};