import React, { useState, useEffect } from "react";
import { usePayOS } from "@payos/payos-checkout";
const ProductDisplay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const [payOSConfig, setPayOSConfig] = useState({
    RETURN_URL: `${window.location.origin}/payment-success-embedded`, // MODIFIED: Specific success URL for embedded
    ELEMENT_ID: "embedded-payment-container",
    CHECKOUT_URL: null,
    embedded: true,
    onSuccess: (event) => {
      console.log("Embedded Payment Success:", event);
      setIsOpen(false);
      setMessage(`Thanh toán thành công! Mã đơn: ${event.orderCode}`);
      // OPTIONAL: Redirect to a more formal success page after a delay or on user action
      // setTimeout(() => {
      //  window.location.href = `/payment-success?orderCode=${event.orderCode}&source=embedded`;
      // }, 3000);
    },
    // Add onExit and onCancel for better handling
    onExit: (event) => {
      console.log("Embedded Payment Exit:", event);
      setIsOpen(false);
      // Potentially set a message or handle differently if the user exits
      // setMessage("Thanh toán đã được hủy hoặc có lỗi xảy ra.");
    },
    onCancel: (event) => { 
      console.log("Embedded Payment Cancel:", event);
      setIsOpen(false);
      setMessage(`Thanh toán đã bị hủy. Mã đơn: ${event.orderCode}`);
    }
  });

  const { open, exit } = usePayOS(payOSConfig);

  const handleGetPaymentLink = async () => {
    setIsCreatingLink(true);
    if (isOpen) { // If already open, exit first
        exit();
        setIsOpen(false); // Ensure UI reflects that it's closed before reopening
    }
    const response = await fetch(
      "https://be-exe2-1.onrender.com/v1.0/orders/create",
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      console.log("Server doesn't response");
      setMessage("Không thể tạo link thanh toán. Vui lòng thử lại.");
      setIsCreatingLink(false);
      return;
    }

    const result = await response.json();
    setPayOSConfig((oldConfig) => ({
      ...oldConfig,
      CHECKOUT_URL: result.checkoutUrl,
    }));

    // The useEffect will handle opening
    setIsCreatingLink(false);
  };

  useEffect(() => {
    if (payOSConfig.CHECKOUT_URL != null && !isOpen) { // Only open if a new URL is set and it's not already considered open
      open();
      setIsOpen(true); // Set isOpen to true when PayOS modal is programmatically opened
    }
  }, [payOSConfig.CHECKOUT_URL, open, isOpen]); // Added isOpen to dependency

  const handleCloseEmbedded = () => {
    exit();
    setIsOpen(false);
    // Optionally clear the message or set a "closed by user" message
    // setMessage(""); 
  }

  return message ? (
    <Message message={message} />
  ) : (
    <div className="main-box"> {/* Ensure .main-box and .checkout styles are available */}
      <div>
        <div className="checkout">
          <div className="product">
            <p>
              <strong>Tên sản phẩm:</strong> Mì tôm Hảo Hảo ly
            </p>
            <p>
              <strong>Giá tiền:</strong> 2000 VNĐ
            </p>
            <p>
              <strong>Số lượng:</strong> 1
            </p>
          </div>
          <div className="flex">
            {!isOpen ? (
              <div>
                {isCreatingLink ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "10px",
                      fontWeight: "600",
                    }}
                  >
                    Đang tạo link...
                  </div>
                ) : (
                  <button
                    id="create-payment-link-btn"
                    onClick={(event) => {
                      event.preventDefault();
                      handleGetPaymentLink();
                    }}
                  >
                    Tạo Link thanh toán Embedded
                  </button>
                )}
              </div>
            ) : (
              <button
                style={{
                  backgroundColor: "gray",
                  color: "white",
                  width: "100%",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  fontSize: "14px",
                  marginTop: "5px",
                }}
                onClick={(event) => {
                  event.preventDefault();
                  handleCloseEmbedded();
                }}
              >
                Đóng Link
              </button>
            )}
          </div>
        </div>
        {isOpen && (
          <div style={{ maxWidth: "400px", padding: "2px", textAlign: "center", marginTop: "10px" }}>
            Sau khi thực hiện thanh toán thành công, vui lòng đợi từ 5 - 10s để
            hệ thống tự động cập nhật.
          </div>
        )}
        {/* Container cho PayOS UI nhúng */}
        <div
          id="embedded-payment-container"
          style={{
            height: isOpen ? "350px" : "0px", // Only show height when open
            overflow: "hidden", // Hide content when height is 0
            transition: "height 0.3s ease-in-out" // Smooth transition
          }}
        ></div>
      </div>
    </div>
  );
};

const Message = ({ message }) => (
  <div className="main-box">
    <div className="checkout">
      <div className="product" style={{ textAlign: "center", fontWeight: "500", padding: "20px" }}>
        <p>{message}</p>
      </div>
      {/* Consider what this button should do. Reload the checkout page? */}
      <button onClick={() => window.location.reload()} id="create-payment-link-btn">
        Thử lại thanh toán
      </button>
    </div>
  </div>
);

// This component will be imported into your main App.jsx
export default function EmbeddedCheckoutPage() {
  return <ProductDisplay />;
}