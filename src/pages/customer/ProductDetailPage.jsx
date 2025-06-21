// src/pages/ProductDetailPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Share,
  Star,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RefreshCw,
  Calendar,
  User,
  MapPin,
  // Removed ThumbsUp, Plus, Minus, Award as they are not directly used or quantity is removed
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // If you use motion here

// Import API functions and CartContext
import {
  getProductById,
  getAllAvailableProducts,
} from "../../services/ProductService"; // Adjust path
import { useCart } from "../../context/CartContext"; // Adjust path

export default function ProductDetailPage() {
  const { id: productIdFromParams } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const { addItemToCart, formatPrice } = useCart();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(""); // Keep if size selection is still relevant
  const [inWishlist, setInWishlist] = useState(false); // Example state
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Fetch main product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productIdFromParams) return;
      setIsLoading(true);
      setError(null);
      try {
        const fetchedProduct = await getProductById(productIdFromParams);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          // Set default selected size if availableSizes exists and product has sizes
          if (
            fetchedProduct.availableSizes &&
            fetchedProduct.availableSizes.length > 0
          ) {
            setSelectedSize(fetchedProduct.availableSizes[0]);
          } else if (fetchedProduct.size && fetchedProduct.size !== "N/A") {
            // If API provides a single 'size' field and it's not placeholder
            setSelectedSize(fetchedProduct.size);
          }
        } else {
          setError("Product not found or failed to load details.");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(
          err.message || "An error occurred while fetching the product."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productIdFromParams]);

  // Fetch related products (simplified: fetch all, filter current, take a few)
  useEffect(() => {
    if (!product || !product.id) return; // Only fetch if main product is loaded

    const fetchRelated = async () => {
      try {
        const allProducts = await getAllAvailableProducts();
        const related = (allProducts || [])
          .filter((p) => p.id !== product.id) // Exclude current product
          .slice(0, 4); // Take first 4 as related
        setRelatedProducts(related);
      } catch (err) {
        console.error("Error fetching related products:", err);
      }
    };
    fetchRelated();
  }, [product]); // Re-fetch if the main product changes

  const handleAddToCart = () => {
    if (!product) return;
    // For secondhand, size might be fixed or only one option.
    // If size selection is still part of the product data and relevant:
    if (
      product.availableSizes &&
      product.availableSizes.length > 0 &&
      !selectedSize
    ) {
      alert("Vui lòng chọn kích thước.");
      return;
    }

    const itemToAdd = {
      ...product,
      // If size is selected and relevant for this product:
      // selectedSize: selectedSize,
      // cartContext's addItemToCart handles setting quantity to 1
    };
    addItemToCart(itemToAdd); // Use context function
    alert(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  const toggleWishlist = () => setInWishlist(!inWishlist);

  // Images to display (main image first, then others if available from product.images array)
  const displayImages = useMemo(() => {
    if (!product || !product.images || product.images.length === 0) {
      return product && product.image
        ? [product.image]
        : ["https://via.placeholder.com/600x600?text=No+Image"];
    }
    // Ensure the main `product.image` is first if it's distinct from the `images` array elements
    const allImages = [
      product.image,
      ...product.images.filter((img) => img !== product.image),
    ];
    return [...new Set(allImages)].filter(Boolean); // Unique, non-empty URLs
  }, [product]);

  const handleImageSelect = (index) => setSelectedImageIndex(index);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        {" "}
        {/* Adjusted height */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-md mx-auto shadow-md">
          <h2 className="text-xl font-semibold text-red-700">
            Lỗi tải sản phẩm
          </h2>
          <p className="mt-2 text-red-600">
            {error ||
              "Không tìm thấy sản phẩm bạn yêu cầu hoặc đã có lỗi xảy ra."}
          </p>
          <button
            className="inline-flex items-center mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Quay lại danh sách sản phẩm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <ol className="list-none p-0 inline-flex space-x-2">
          <li>
            <Link to="/" className="hover:text-blue-600 hover:underline">
              Trang chủ
            </Link>
          </li>
          <li>
            <span>/</span>
          </li>
          <li>
            <Link
              to="/products"
              className="hover:text-blue-600 hover:underline"
            >
              Sản phẩm
            </Link>
          </li>
          <li>
            <span>/</span>
          </li>
          <li className="text-gray-700 font-medium truncate max-w-[200px] md:max-w-xs">
            {product.name || "Chi tiết sản phẩm"}
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden shadow">
              {" "}
              {/* Ensured aspect ratio */}
              <img
                src={
                  displayImages[selectedImageIndex] ||
                  "https://via.placeholder.com/600x600?text=No+Image"
                }
                alt={product.name || "Product"}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all duration-150 ease-in-out
                                ${
                                  selectedImageIndex === index
                                    ? "border-blue-500 ring-2 ring-blue-300"
                                    : "border-gray-200 hover:border-blue-400"
                                }`}
                    onClick={() => handleImageSelect(index)}
                  >
                    <img
                      src={img}
                      alt={`${product.name || "Product"} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {product.name || "Tên sản phẩm"}
              </h1>
              <div className="flex items-center mt-2 space-x-3">
                {product.condition && product.condition !== "N/A" && (
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {product.condition}
                  </span>
                )}
                {product.createdAt && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 mr-1 opacity-70" />
                    <span>
                      Đăng ngày:{" "}
                      {new Date(product.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-blue-600">
                {formatPrice(product.priceVND)}
              </span>
              {typeof product.originalPriceVND === "number" &&
                product.originalPriceVND > (product.priceVND || 0) && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.originalPriceVND)}
                    </span>
                    <span className="text-sm text-red-500 font-medium bg-red-100 px-2 py-0.5 rounded-md">
                      Tiết kiệm{" "}
                      {formatPrice(
                        product.originalPriceVND - (product.priceVND || 0)
                      )}{" "}
                      ({" "}
                      {Math.round(
                        (1 -
                          (product.priceVND || 0) / product.originalPriceVND) *
                          100
                      )}
                      % )
                    </span>
                  </>
                )}
            </div>

            {/* Seller Info */}
            {product.seller && product.seller !== "N/A" && (
              <div className="py-4 border-t border-b border-gray-200">
                <p className="text-sm font-medium text-gray-800 mb-1">
                  Người bán:
                </p>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2 opacity-70" />
                  <span className="font-medium">{product.seller}</span>
                  {/* Add seller rating/location if available and desired */}
                  {product.location && product.location !== "N/A" && (
                    <span className="mx-2 text-gray-400">•</span>
                  )}
                  {product.location && product.location !== "N/A" && (
                    <>
                      <MapPin className="w-3.5 h-3.5 mr-1 opacity-70" />{" "}
                      {product.location}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Size Selection (Only if product has availableSizes) */}
            {product.availableSizes &&
              product.availableSizes.length > 0 &&
              product.availableSizes[0] !== "N/A" && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Kích thước:{" "}
                    <span className="text-gray-700 font-normal">
                      {selectedSize}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.availableSizes.map((size) => (
                      <button
                        key={size}
                        className={`px-3.5 py-1.5 border rounded-md text-xs font-medium transition-colors
                                  ${
                                    selectedSize === size
                                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                      : "border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                                  }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Quantity is removed - assuming 1 for secondhand */}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center text-sm shadow-md"
              >
                <ShoppingCart className="mr-2 w-4 h-4" /> Thêm vào giỏ hàng
              </button>
              <div className="flex gap-3">
                <button
                  onClick={toggleWishlist}
                  title={
                    inWishlist ? "Remove from Wishlist" : "Add to Wishlist"
                  }
                  className={`p-3 rounded-lg border transition-colors ${
                    inWishlist
                      ? "bg-red-50 border-red-300 text-red-500 hover:bg-red-100"
                      : "border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  title="Share this product"
                  onClick={() =>
                    alert("Share functionality to be implemented!")
                  }
                  className="p-3 rounded-lg border border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <Share className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200 text-xs text-gray-600">
              {product.shippingCost && product.shippingCost !== "N/A" && (
                <div className="flex items-center">
                  <Truck className="w-4 h-4 mr-2 opacity-70" />
                  <span>Vận chuyển: {product.shippingCost}</span>
                </div>
              )}
              {product.returnPolicy && (
                <div className="flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 opacity-70" />
                  <span>{product.returnPolicy}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Description Only */}
      <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-12">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            {/* Active Tab */}
            <button className="py-3 border-b-2 border-blue-600 font-semibold text-blue-600 text-sm">
              Mô tả sản phẩm
            </button>
            {/* Removed Details and Reviews tabs */}
          </div>
        </div>
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          {/* Use dangerouslySetInnerHTML if description contains HTML, otherwise just render as text */}
          {product.description ? (
            <p>{product.description}</p>
          ) : (
            <p>Không có mô tả cho sản phẩm này.</p>
          )}

          {/* Additional Item Details (Material, etc. if available and distinct from main description) */}
          {(product.material && product.material !== "N/A") ||
          (product.color && product.color !== "N/A") ||
          (product.size &&
            product.size !== "N/A" &&
            (!product.availableSizes ||
              product.availableSizes.length === 0)) ? (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-2">
                Thông tin thêm:
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {product.material && product.material !== "N/A" && (
                  <li>
                    <strong>Chất liệu:</strong> {product.material}
                  </li>
                )}
                {product.color && product.color !== "N/A" && (
                  <li>
                    <strong>Màu sắc:</strong> {product.color}
                  </li>
                )}
                {/* Only show this 'size' if not using availableSizes or if availableSizes is empty */}
                {product.size &&
                  product.size !== "N/A" &&
                  (!product.availableSizes ||
                    product.availableSizes.length === 0) && (
                    <li>
                      <strong>Kích thước:</strong> {product.size}
                    </li>
                  )}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Sản phẩm tương tự
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((relatedProd) => (
              <div
                key={relatedProd.id}
                className="bg-white rounded-lg shadow-md overflow-hidden group"
              >
                <Link to={`/products/${relatedProd.id}`} className="block">
                  <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                    <img
                      src={
                        relatedProd.image ||
                        "https://via.placeholder.com/300x375?text=No+Image"
                      }
                      alt={relatedProd.name || "Related Product"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {relatedProd.condition && (
                      <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded">
                        {relatedProd.condition}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-800 truncate group-hover:text-blue-600">
                      {relatedProd.name || "Related Product"}
                    </h3>
                    <div className="flex items-baseline mt-1">
                      <span className="text-md font-bold text-blue-600">
                        {formatPrice(relatedProd.priceVND)}
                      </span>
                      {/* Add original price if available and different */}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
