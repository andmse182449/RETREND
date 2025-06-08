// src/services/imageUploadService.js
import { API_BASE_URL } from "./config";

export async function uploadImageToCloudinary(imageFile, token) {
  const url = `${API_BASE_URL}/v1.0/cloudinary/upload_photo`; // Ensure this endpoint name is correct

  if (!imageFile || !(imageFile instanceof File)) {
    throw new Error("Invalid image file provided for upload.");
  }
  if (!token) {
    throw new Error("Authentication token is required for image upload.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  console.log(`Uploading image: ${imageFile.name} to ${url}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      // Handles 4xx (like 400, 401, 403) and 5xx errors
      let errorJson = null;
      let errorTextMessage = `Image upload failed: ${response.status} ${
        response.statusText || "(No status text)"
      }`;
      let isMembershipIssue = false;

      try {
        const backendErrorText = await response.text(); // Get raw response first
        if (backendErrorText) {
          if (
            response.headers.get("content-type")?.includes("application/json")
          ) {
            try {
              errorJson = JSON.parse(backendErrorText);
              // Use message from JSON if available
              errorTextMessage =
                errorJson.message ||
                errorJson.messages ||
                errorJson.error ||
                backendErrorText.substring(0, 200);
              // Check for specific membership error codes or messages from backend JSON
              if (
                errorJson.errorCode === "MEMBERSHIP_REQUIRED" || // Example error code
                (typeof errorTextMessage === "string" &&
                  errorTextMessage.toLowerCase().includes("membership"))
              ) {
                isMembershipIssue = true;
              }
            } catch (e) {
              // JSON parsing failed, use raw text
              errorTextMessage = backendErrorText.substring(0, 500);
              console.warn(
                "ImageUploadService: Error response was not valid JSON. Raw text:",
                backendErrorText
              );
            }
          } else {
            // Not JSON, use raw text
            errorTextMessage = backendErrorText.substring(0, 500);
          }
        }
      } catch (e) {
        console.error(
          "ImageUploadService: Could not read error response body.",
          e
        );
      }

      // Explicitly check status codes known to be related to membership for THIS endpoint
      if (response.status === 400 || response.status === 403) {
        // If 400/403 for this endpoint means membership
        // You might further refine this by checking errorJson.errorCode if backend provides it
        isMembershipIssue = true;
      }

      const err = new Error(
        isMembershipIssue
          ? "Vui lòng nâng cấp tài khoản để tải ảnh lên."
          : errorTextMessage
      );
      err.status = response.status;
      err.data = errorJson || { message: errorTextMessage }; // Attach parsed JSON error or text
      if (isMembershipIssue) {
        err.isMembershipError = true; // Custom flag for SellNow.jsx to catch
      }
      console.error(
        "ImageUploadService API Error:",
        err.status,
        err.message,
        err.data
      );
      throw err;
    }

    // If response.ok (2xx status)
    const data = await response.json();
    const imageUrl = data.secure_url || data.url || data.uri;
    if (!imageUrl) {
      console.error(
        "Cloudinary upload response from backend missing 'secure_url' or 'url':",
        data
      );
      throw new Error("Image uploaded, but URL not found in server response.");
    }
    return { url: imageUrl, public_id: data.public_id, ...data };
  } catch (error) {
    // Catches network errors or errors thrown above
    console.error("Critical error during image upload process:", error.message);
    // Ensure the isMembershipError flag propagates if it was set
    if (
      !error.isMembershipError &&
      error.message &&
      (error.message.toLowerCase().includes("membership") ||
        error.message.toLowerCase().includes("nâng cấp tài khoản"))
    ) {
      error.isMembershipError = true; // Try to catch it again if message implies it
      error.message = "Vui lòng nâng cấp tài khoản để sử dụng tính năng này.";
    }
    throw error;
  }
}
