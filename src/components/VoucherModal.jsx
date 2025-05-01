// src/components/VoucherModal.js
// Note: The necessary icon imports are placed *inside* this file.
import { FaClipboard, FaTimes } from "react-icons/fa";
import React, { useState } from "react";

const VoucherModal = ({ isOpen, onClose, vouchers }) => {
  // Modal manages its own pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Only render the modal structure if isOpen is true
  if (!isOpen) return null;

  // Pagination logic
  const itemsPerPage = 3; // Number of vouchers per page displayed in modal
  const totalPages = Math.ceil(vouchers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVouchers = vouchers.slice(startIndex, startIndex + itemsPerPage);

  // Handle copying voucher code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => alert(`Mã ${code} đã được sao chép!`)) // Provide success feedback (e.g., using a simple alert)
      .catch((err) => console.error("Failed to copy code:", err)); // Log any errors
  };

  return (
    // Main modal container: Fixed positioning, backdrop, centered content, very high z-index
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      {/* The modal content panel */}
      {/* Added role and aria-modal for accessibility */}
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg relative"
      >
        {" "}
        {/* Added relative for positioning close button/potential overflow */}
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Available Vouchers
          </h2>
          {/* Close Button */}
          <button
            onClick={onClose} // Use the onClose prop passed from the parent
            className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close voucher modal" // Accessible label
          >
            <FaTimes size={20} /> {/* Using the imported FaTimes icon */}
          </button>
        </div>
        {/* Modal Body - Vouchers List */}
        {/* Added max-height for scrolling and custom scrollbar utility class */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
          {" "}
          {/* Example max height (adjust as needed) */}
          {/* Check if there are any vouchers at all before mapping */}
          {vouchers && Array.isArray(vouchers) && vouchers.length > 0 ? (
            // Map over the vouchers currently on this page for display
            currentVouchers.map((voucher, index) => (
              <div
                key={index}
                className="border border-amber-300 rounded-lg p-4 bg-yellow-50 shadow-sm"
              >
                {" "}
                {/* Styled individual voucher card */}
                <h4 className="font-bold text-gray-900 mb-2">
                  {voucher.title}
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside pl-4 marker:text-amber-600">
                  {" "}
                  {/* List styling */}
                  <li>{voucher.condition}</li>
                  <li>
                    Mã:{" "}
                    <span className="font-mono font-semibold text-gray-900">
                      {voucher.code}
                    </span>
                  </li>{" "}
                  {/* Highlight code */}
                  {/* Ensure 'expiry' key is used consistently from data */}
                  <li>HSD: {voucher.expiry}</li>
                </ul>
                {/* Copy Code Button */}
                <button
                  onClick={() => handleCopyCode(voucher.code)}
                  className="mt-4 inline-flex items-center justify-center bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm w-full"
                  aria-label={`Copy voucher code ${voucher.code}`} // Accessible label
                >
                  {/* Use the imported FaClipboard icon */}
                  <FaClipboard className="mr-2" /> Sao chép mã
                </button>
              </div>
            ))
          ) : (
            // Message if no vouchers are available AT ALL
            <p className="text-gray-600 text-center italic py-4">
              No vouchers available.
            </p>
          )}
          {/* Message specific to pagination if the current page has no vouchers, but there are vouchers overall */}
          {vouchers &&
            Array.isArray(vouchers) &&
            vouchers.length > 0 &&
            currentVouchers.length === 0 && (
              <p className="text-gray-600 text-center italic py-4">
                No vouchers found on this page.
              </p> // More specific message
            )}
        </div>{" "}
        {/* End scrollable body */}
        {/* Modal Footer - Pagination Controls */}
        {/* Only render pagination controls if there's more than one page of vouchers */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 text-sm text-gray-700">
            {" "}
            {/* Styled footer */}
            {/* Previous Page Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} // Go to previous page, min page is 1
              disabled={currentPage === 1} // Disable button if on the first page
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              Previous
            </button>
            {/* Page Indicator */}
            <span>
              Page {currentPage} of {totalPages}
            </span>
            {/* Next Page Button */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              } // Go to next page, max page is totalPages
              disabled={currentPage === totalPages} // Disable button if on the last page
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </div>{" "}
      {/* End modal content panel */}
    </div> // End modal overlay container
  );
};

export default VoucherModal;
