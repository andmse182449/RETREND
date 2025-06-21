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
  FaUserShield,
  FaHeart,
  FaThumbsUp,
  FaQuoteLeft,
  FaFilter,
  FaChevronDown,
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

// Animated Star Rating Input Component
const StarRatingInput = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label
            key={index}
            className="cursor-pointer group"
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
            <div className="relative">
              <FaStar
                className={`text-3xl transition-all duration-300 transform ${
                  ratingValue <= (hoverRating || rating)
                    ? "text-yellow-400 scale-110 drop-shadow-lg"
                    : "text-gray-300 group-hover:text-yellow-200"
                } ${
                  ratingValue === (hoverRating || rating) ? "animate-pulse" : ""
                }`}
              />
              {ratingValue <= (hoverRating || rating) && (
                <div className="absolute inset-0 text-3xl text-yellow-400 animate-ping opacity-75">
                  <FaStar />
                </div>
              )}
            </div>
          </label>
        );
      })}
      <div className="ml-3 flex flex-col">
        <span className="text-sm font-medium text-slate-700">
          {hoverRating || rating
            ? `${hoverRating || rating} sao`
            : "Chọn đánh giá"}
        </span>
        <span className="text-xs text-slate-500">
          {(hoverRating || rating) >= 4
            ? "Tuyệt vời!"
            : (hoverRating || rating) >= 3
            ? "Khá tốt"
            : (hoverRating || rating) >= 2
            ? "Bình thường"
            : (hoverRating || rating) >= 1
            ? "Cần cải thiện"
            : ""}
        </span>
      </div>
    </div>
  );
};

// Enhanced Star Rating Display Component
const StarRatingDisplay = ({ rating }) => {
  const numRating = parseInt(rating, 10);
  if (isNaN(numRating)) {
    return <span className="text-sm text-gray-600">{rating}</span>;
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-500";
    if (rating >= 3) return "text-yellow-500";
    if (rating >= 2) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${
              i < numRating ? getRatingColor(numRating) : "text-gray-300"
            } text-sm transition-colors duration-200`}
          />
        ))}
      </div>
      <span className={`text-sm font-medium ${getRatingColor(numRating)}`}>
        ({numRating}/5)
      </span>
    </div>
  );
};

// Feedback Statistics Component
const FeedbackStats = ({ feedbackList }) => {
  const totalFeedback = feedbackList.length;
  const avgRating =
    totalFeedback > 0
      ? (
          feedbackList.reduce((sum, fb) => sum + parseInt(fb.rating || 0), 0) /
          totalFeedback
        ).toFixed(1)
      : 0;

  const satisfactionRate =
    totalFeedback > 0
      ? Math.round(
          (feedbackList.filter((fb) => parseInt(fb.rating || 0) >= 4).length /
            totalFeedback) *
            100
        )
      : 0;

  // return (
  //   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 mb-8">
  //     <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
  //       <FaThumbsUp className="mr-2 text-blue-600" />
  //       Thống Kê Phản Hồi
  //     </h3>
  //     <div className="grid grid-cols-3 gap-4">
  //       <div className="text-center">
  //         <div className="text-3xl font-bold text-blue-600">
  //           {totalFeedback}
  //         </div>
  //         <div className="text-sm text-slate-600">Tổng phản hồi</div>
  //       </div>
  //       <div className="text-center">
  //         <div className="text-3xl font-bold text-yellow-500">{avgRating}</div>
  //         <div className="text-sm text-slate-600">Điểm trung bình</div>
  //       </div>
  //       <div className="text-center">
  //         <div className="text-3xl font-bold text-green-500">
  //           {satisfactionRate}%
  //         </div>
  //         <div className="text-sm text-slate-600">Hài lòng</div>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState(null);
  const [filterRating, setFilterRating] = useState("all");

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

  // Filter feedback based on rating
  const filteredFeedback = feedbackList.filter((fb) => {
    if (filterRating === "all") return true;
    return parseInt(fb.rating) === parseInt(filterRating); // Compares parsed values
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-10 blur-3xl"></div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                <FaHeart className="text-3xl text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Phản Hồi & Đánh Giá
            </h1>
            <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Chia sẻ trải nghiệm của bạn để chúng tôi có thể cải thiện dịch vụ
              tốt hơn mỗi ngày
            </p>
          </div>
        </div>

        {/* Statistics */}
        <FeedbackStats feedbackList={feedbackList} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Submit Feedback Section - Now spans 2 columns */}
          <div className="xl:col-span-2">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="relative">
                <div className="flex items-center mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl mr-4 shadow-lg">
                    <FaComments className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Gửi Phản Hồi Của Bạn
                    </h2>
                    <p className="text-slate-500 mt-1">
                      Ý kiến của bạn là động lực để chúng tôi phát triển
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitFeedback} className="space-y-8">
                  <div>
                    <label
                      htmlFor="feedbackContent"
                      className="block text-sm font-semibold text-slate-700 mb-3 flex items-center"
                    >
                      <FaQuoteLeft className="mr-2 text-slate-500" />
                      Nội dung phản hồi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="feedbackContent"
                        rows="5"
                        className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 resize-none"
                        placeholder="Hãy chia sẻ trải nghiệm, cảm nghĩ của bạn về dịch vụ. Mọi góp ý đều rất quý giá với chúng tôi..."
                        value={newFeedbackContent}
                        onChange={(e) => setNewFeedbackContent(e.target.value)}
                        required
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                        {newFeedbackContent.length}/500
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-4">
                      Đánh giá của bạn <span className="text-red-500">*</span>
                    </label>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <StarRatingInput
                        rating={newFeedbackRating}
                        setRating={setNewFeedbackRating}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    {submitError && (
                      <div className="flex items-center p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-xl text-sm mb-6 animate-fadeIn">
                        <FaExclamationCircle className="mr-3 text-lg flex-shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}
                    {submitSuccess && (
                      <div className="flex items-center p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-xl text-sm mb-6 animate-fadeIn">
                        <FaCheckCircle className="mr-3 text-lg flex-shrink-0" />
                        <span>{submitSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-70 disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin mr-3 text-lg" />
                          <span>Đang gửi phản hồi...</span>
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="mr-3 text-lg" />
                          <span>Gửi Phản Hồi</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Feedback List */}
          <div className="xl:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 h-fit">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl mr-3 shadow-lg">
                    <FaUser className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Phản Hồi Gần Đây
                    </h2>
                    <p className="text-xs text-slate-500">
                      {filteredFeedback.length} phản hồi
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">Tất cả</option>
                    <option value="5">5 sao</option>
                    <option value="4">4 sao</option>
                    <option value="3">3 sao</option>
                    <option value="2">2 sao</option>
                    <option value="1">1 sao</option>
                  </select>
                  <button
                    onClick={fetchAllFeedback}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    ↻
                  </button>
                </div>
              </div>

              {isLoadingList && (
                <div className="text-center py-12 text-slate-500">
                  <div className="relative">
                    <FaSpinner className="animate-spin text-4xl mx-auto mb-4 text-blue-500" />
                    <div className="absolute inset-0 text-4xl text-blue-200 animate-ping">
                      <FaSpinner className="mx-auto" />
                    </div>
                  </div>
                  <p className="text-sm">Đang tải phản hồi...</p>
                </div>
              )}

              {!isLoadingList && listError && (
                <div className="text-center py-12 text-red-500 bg-red-50 p-6 rounded-2xl border border-red-200">
                  <FaExclamationCircle className="text-4xl mx-auto mb-4" />
                  <p className="text-sm mb-4">{listError}</p>
                  <button
                    onClick={fetchAllFeedback}
                    className="text-sm bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {!isLoadingList &&
                !listError &&
                filteredFeedback.length === 0 && (
                  <div className="text-center py-16">
                    <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaComments className="text-3xl text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">
                      {feedbackList.length === 0
                        ? "Chưa có phản hồi nào. Hãy là người đầu tiên!"
                        : "Không có phản hồi nào với bộ lọc này."}
                    </p>
                  </div>
                )}

              {!isLoadingList && !listError && filteredFeedback.length > 0 && (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredFeedback
                    .slice()
                    .reverse()
                    .map((fb, index) => (
                      <div
                        key={fb.feedbackId}
                        className="p-4 border border-slate-200 rounded-2xl bg-gradient-to-br from-white to-slate-50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex">
                          <div className="flex-shrink-0 mr-3">
                            <div className="bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                              <FaUser className="text-sm" />
                            </div>
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-slate-900">
                                Khách hàng
                              </span>
                              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                {formatDate(fb.dateSubmitted)}
                              </span>
                            </div>
                            <div className="mb-3">
                              <StarRatingDisplay rating={fb.rating} />
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed mb-3">
                              {fb.content}
                            </p>

                            {fb.response && (
                              <div className="mt-4 pt-4 border-t border-slate-200 bg-green-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-2xl">
                                <div className="flex">
                                  <div className="flex-shrink-0 mr-3">
                                    <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                      <FaUserShield className="text-xs" />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-green-700 text-sm">
                                      Quản trị viên
                                    </div>
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
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #94a3b8, #64748b);
        }
      `}</style>
    </div>
  );
}
