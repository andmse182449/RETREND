// src/pages/FeedbackPage.js
import React, { useState, useEffect, useCallback } from "react";
import {
  FaPaperPlane,
  FaStar,
  FaRegStar,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaComments,
  FaUser,
  FaUserShield
} from "react-icons/fa";
import feedbackApiService from "../../services/FeedbackApiService"; // Adjust path

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
};

// Star Rating Input Component
const StarRatingInput = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label 
            key={index} 
            className="cursor-pointer"
            onMouseEnter={() => setHoverRating(ratingValue)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => setRating(String(ratingValue))}
              className="hidden"
            />
            <FaStar
              className={`text-2xl transition-transform duration-150 ${
                ratingValue <= (hoverRating || rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              } ${ratingValue === (hoverRating || rating) ? "scale-110" : ""}`}
            />
          </label>
        );
      })}
    </div>
  );
};

// Star Rating Display Component
const StarRatingDisplay = ({ rating }) => {
  const numRating = parseInt(rating, 10);
  if (isNaN(numRating)) {
    return <span className="text-sm text-gray-600">{rating}</span>;
  }
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          className={`${
            i < numRating ? "text-yellow-400" : "text-gray-300"
          } text-sm`}
        />
      ))}
    </div>
  );
};

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [newFeedbackContent, setNewFeedbackContent] = useState("");
  const [newFeedbackRating, setNewFeedbackRating] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Fetch All Feedback
  const fetchAllFeedback = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const data = await feedbackApiService.getAllFeedback();
      setFeedbackList(data || []);
    } catch (err) {
      setListError(err.message || "Không thể tải danh sách phản hồi.");
      console.error("Error fetching feedback list:", err);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchAllFeedback();
  }, [fetchAllFeedback]);

  // Handle New Feedback Submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedbackContent.trim()) {
      setSubmitError("Vui lòng nhập nội dung phản hồi.");
      return;
    }
    if (!newFeedbackRating) {
      setSubmitError("Vui lòng đánh giá bằng cách chọn số sao.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess("");
    try {
      const feedbackData = {
        content: newFeedbackContent,
        rating: String(newFeedbackRating),
      };
      const createdFeedback = await feedbackApiService.submitFeedback(
        feedbackData
      );
      setSubmitSuccess(
        `Cảm ơn bạn đã gửi phản hồi! ${
          createdFeedback.response
            ? "Phản hồi từ quản trị viên: " + createdFeedback.response
            : ""
        }`
      );
      setNewFeedbackContent("");
      setNewFeedbackRating("");
      fetchAllFeedback();
    } catch (err) {
      setSubmitError(err.message || "Gửi phản hồi thất bại. Vui lòng thử lại.");
      console.error("Error submitting feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
            Phản Hồi & Đánh Giá
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Chia sẻ trải nghiệm của bạn để chúng tôi có thể cải thiện dịch vụ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Feedback Section */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 p-3 rounded-xl mr-4">
                <FaComments className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Gửi Phản Hồi Của Bạn
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Ý kiến của bạn rất quan trọng với chúng tôi
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <div>
                <label
                  htmlFor="feedbackContent"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Nội dung phản hồi <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedbackContent"
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Chia sẻ cảm nghĩ, góp ý hoặc vấn đề bạn gặp phải..."
                  value={newFeedbackContent}
                  onChange={(e) => setNewFeedbackContent(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Đánh giá của bạn <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <StarRatingInput 
                    rating={newFeedbackRating} 
                    setRating={setNewFeedbackRating} 
                  />
                  {newFeedbackRating && (
                    <span className="text-sm font-medium text-slate-700">
                      {newFeedbackRating} sao
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                {submitError && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-4">
                    <FaExclamationCircle className="mr-2 shrink-0" /> {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm mb-4">
                    <FaCheckCircle className="mr-2 shrink-0" /> {submitSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-5 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaPaperPlane className="mr-2" />
                  )}
                  {isSubmitting ? "Đang gửi..." : "Gửi Phản Hồi"}
                </button>
              </div>
            </form>
          </div>

          {/* Feedback List */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center">
                <div className="bg-indigo-50 p-3 rounded-xl mr-4">
                  <FaUser className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Phản Hồi Gần Đây
                </h2>
              </div>
              <button 
                onClick={fetchAllFeedback}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Làm mới
              </button>
            </div>

            {isLoadingList && (
              <div className="text-center py-8 text-slate-500">
                <FaSpinner className="animate-spin text-3xl mx-auto mb-3 text-blue-500" />
                Đang tải danh sách phản hồi...
              </div>
            )}
            
            {!isLoadingList && listError && (
              <div className="text-center py-8 text-red-500 bg-red-50 p-4 rounded-xl">
                <FaExclamationCircle className="text-3xl mx-auto mb-2" />
                {listError}
                <button
                  onClick={fetchAllFeedback}
                  className="mt-4 mx-auto text-sm bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}
            
            {!isLoadingList && !listError && feedbackList.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaComments className="text-2xl text-slate-400" />
                </div>
                <p className="text-slate-500 italic">
                  Chưa có phản hồi nào. Hãy là người đầu tiên đóng góp ý kiến!
                </p>
              </div>
            )}

            {!isLoadingList && !listError && feedbackList.length > 0 && (
              <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {feedbackList
                  .slice()
                  .reverse()
                  .map((fb) => (
                    <div
                      key={fb.feedbackId}
                      className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center">
                            <FaUser className="text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <span className="font-medium text-slate-900">Khách hàng</span>
                            <span className="text-xs text-slate-400">
                              {formatDate(fb.dateSubmitted)}
                            </span>
                          </div>
                          <div className="mt-2">
                            <StarRatingDisplay rating={fb.rating} />
                          </div>
                          <p className="mt-3 text-slate-700">
                            {fb.content}
                          </p>
                          
                          {fb.response && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <div className="flex">
                                <div className="flex-shrink-0 mr-3">
                                  <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center">
                                    <FaUserShield className="text-green-600 text-sm" />
                                  </div>
                                </div>
                                <div>
                                  <div className="font-medium text-green-700">Quản trị viên</div>
                                  <p className="mt-1 text-sm text-slate-700">
                                    {fb.response}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}