import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Share, 
  Star, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  RefreshCw,
  ThumbsUp,
  Plus,
  Minus,
  Calendar,
  Award,
  User,
  MapPin
} from 'lucide-react';

// This would normally come from your API or Redux store
// We're using the same data structure from your uploaded code
const featuredProducts = [
  {
    id: 1,
    name: "Vintage Leather Jacket",
    price: 89.99,
    originalPrice: 299.99,
    condition: "Excellent",
    image: "https://images.pexels.com/photos/9975322/pexels-photo-9975322.jpeg",
    seller: "Sarah J.",
    location: "New York",
    description: "A beautiful vintage leather jacket in excellent condition. Perfect for fall and winter seasons with a timeless design that never goes out of style. Features premium quality leather, comfortable fit, and excellent craftsmanship.",
    size: "Medium",
    material: "Genuine Leather",
    color: "Brown",
    sellerId: "seller123",
    sellerRating: 4.8,
    totalSales: 157,
    shippingCost: "Free",
    returnPolicy: "30-day returns",
    availableSizes: ["Small", "Medium", "Large", "XL"],
    itemConditionDetails: "Minor wear on cuffs, otherwise excellent condition",
    listedDate: "2023-04-12"
  },
  {
    id: 2,
    name: "Beige Casual Pants",
    price: 59.99,
    originalPrice: 149.99,
    condition: "Very Good",
    image: "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg",
    seller: "James K.",
    location: "Los Angeles",
    description: "Comfortable beige casual pants perfect for everyday wear. Minimalist design that goes with everything. Made with high-quality cotton blend for comfort and durability.",
    size: "32",
    material: "Cotton Blend",
    color: "Beige",
    sellerId: "seller456",
    sellerRating: 4.6,
    totalSales: 89,
    shippingCost: "$4.99",
    returnPolicy: "14-day returns",
    availableSizes: ["30", "32", "34", "36"],
    itemConditionDetails: "Slight fading from washing, no tears or stains",
    listedDate: "2023-04-15"
  },
  {
    id: 3,
    name: "Beige Sneakers",
    price: 89.99,
    originalPrice: 199.99,
    condition: "Like New",
    image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg",
    seller: "Linda M.",
    location: "Chicago",
    description: "Stylish beige sneakers with minimal wear. Comfortable for all-day use.",
    size: "9",
    material: "Canvas and Rubber",
    color: "Beige",
    sellerId: "seller789",
    sellerRating: 4.9,
    totalSales: 205,
    shippingCost: "$5.99",
    returnPolicy: "30-day returns",
    availableSizes: ["8", "9", "10", "11"],
    itemConditionDetails: "Worn only once, practically new",
    listedDate: "2023-04-20"
  },
  {
    id: 4,
    name: "Beige Trench Coat",
    price: 129.99,
    originalPrice: 259.99,
    condition: "Excellent",
    image: "https://images.pexels.com/photos/5886041/pexels-photo-5886041.jpeg",
    seller: "Mark R.",
    location: "San Francisco",
    description: "Classic beige trench coat, perfect for spring and fall. Timeless design.",
    size: "Large",
    material: "Cotton",
    color: "Beige",
    sellerId: "seller101",
    sellerRating: 4.7,
    totalSales: 132,
    shippingCost: "Free",
    returnPolicy: "14-day returns",
    availableSizes: ["Small", "Medium", "Large", "XL"],
    itemConditionDetails: "Very slight wear on buttons, otherwise excellent",
    listedDate: "2023-04-18"
  }
];

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const navigate = useNavigate();
  // Mock additional product images (in a real app, these would come from your API)
  const getAdditionalImages = (mainImage) => [
    mainImage,
    "/api/placeholder/400/600",
    "/api/placeholder/400/600",
    "/api/placeholder/400/600"
  ];

  useEffect(() => {
    // Simulating API fetch delay
    const timer = setTimeout(() => {
      const productId = parseInt(id);
      const foundProduct = featuredProducts.find(p => p.id === productId);
      setProduct(foundProduct);
      
      if (foundProduct && foundProduct.availableSizes) {
        setSelectedSize(foundProduct.availableSizes[0]);
      }
      
      // Set related products (excluding current product)
      setRelatedProducts(
        featuredProducts
          .filter(p => p.id !== productId)
          .slice(0, 4)
      );
      
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    
    // You would add your cart logic here
    console.log(`Added to cart: ${product.name}, Size: ${selectedSize}, Quantity: ${quantity}`);
    alert(`${product.name} added to your cart!`);
  };

  const toggleWishlist = () => {
    setInWishlist(!inWishlist);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-700">Product Not Found</h2>
          <p className="mt-2 text-yellow-600">
            The product you're looking for doesn't exist or may have been removed.
          </p>
          <button 
            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
            onClick={() =>  navigate("/products")} // Assuming you have a navigate function or useLink
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Products
          </button>
        </div>
      </div>
    );
  }

  const productImages = getAdditionalImages(product.image);

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="list-none flex">
          <li className="flex items-center">
            <button onClick={() => console.log("Navigate to home")} className="text-gray-500 hover:text-gray-700">Home</button>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="flex items-center">
            <button onClick={() => console.log("Navigate to products")} className="text-gray-500 hover:text-gray-700">Products</button>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={productImages[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  className={`aspect-square rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? "border-blue-500" : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center mt-2">
                <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                  {product.condition}
                </div>
                <div className="ml-4 flex items-center">
                  <Calendar className="text-gray-400 w-4 h-4 mr-1" />
                  <span className="text-sm text-gray-500">Listed on {product.listedDate}</span>
                </div>
              </div>
            </div>
            
            {/* Price */}
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              <span className="ml-4 text-lg text-gray-500 line-through">${product.originalPrice}</span>
              <span className="ml-2 text-sm text-green-600 font-medium">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% off
              </span>
            </div>

            {/* Seller Info */}
            <div className="flex items-center py-4 border-t border-b border-gray-200">
              <User className="text-gray-400 w-5 h-5 mr-2" />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium">{product.seller}</span>
                  <div className="flex items-center ml-2">
                    <Star className="text-yellow-400 w-4 h-4" />
                    <span className="ml-1 text-sm">{product.sellerRating}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <ThumbsUp className="w-3 h-3 mr-1" /> {product.totalSales} sales
                  <span className="mx-2">•</span>
                  <MapPin className="w-3 h-3 mr-1" /> {product.location}
                </div>
              </div>
            </div>
            
            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    className={`px-4 py-2 border rounded-md text-sm ${
                      selectedSize === size
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-900"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
              <div className="flex items-center">
                <button
                  className="p-2 border border-gray-300 rounded-l-md"
                  onClick={() => handleQuantityChange(-1)}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 border-t border-b border-gray-300 text-center min-w-[3rem]">
                  {quantity}
                </span>
                <button
                  className="p-2 border border-gray-300 rounded-r-md"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gray-900 text-white py-4 rounded-md font-semibold hover:bg-gray-800 flex items-center justify-center"
              >
                <ShoppingCart className="mr-2 w-5 h-5" /> Add to Cart
              </button>
              <button
                onClick={toggleWishlist}
                className={`p-4 rounded-md border ${
                  inWishlist 
                    ? "bg-red-50 border-red-200 text-red-500" 
                    : "border-gray-300 text-gray-500"
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} />
              </button>
              <button
                className="p-4 rounded-md border border-gray-300 text-gray-500"
              >
                <Share className="w-5 h-5" />
              </button>
            </div>
            
            {/* Shipping Info */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <Truck className="text-gray-500 w-5 h-5 mr-2" />
                <span>{product.shippingCost === "Free" ? "Free Shipping" : `Shipping: ${product.shippingCost}`}</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="text-gray-500 w-5 h-5 mr-2" />
                <span>{product.returnPolicy}</span>
              </div>
              <div className="flex items-center">
                <RefreshCw className="text-gray-500 w-5 h-5 mr-2" />
                <span>Buy with confidence - Buyer protection included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <button className="border-b-2 border-gray-900 pb-4 font-medium text-gray-900">
              Description
            </button>
            <button className="text-gray-500 pb-4 font-medium">
              Details
            </button>
            <button className="text-gray-500 pb-4 font-medium">
              Reviews
            </button>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <p>{product.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div>
              <h3 className="text-lg font-medium mb-2">Item Details</h3>
              <ul className="space-y-2 list-none pl-0">
                <li className="flex">
                  <span className="font-medium w-32">Condition:</span>
                  <span>{product.condition}</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-32">Color:</span>
                  <span>{product.color}</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-32">Material:</span>
                  <span>{product.material}</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-32">Size:</span>
                  <span>{product.size}</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Condition Details</h3>
              <p>{product.itemConditionDetails}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((relatedProduct) => (
            <div key={relatedProduct.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-square relative">
                <img 
                  src={relatedProduct.image} 
                  alt={relatedProduct.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  {relatedProduct.condition}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">
                  {relatedProduct.name}
                </h3>
                <div className="flex items-center mt-1">
                  <span className="text-lg font-bold text-gray-900">${relatedProduct.price}</span>
                  <span className="ml-2 text-sm text-gray-500 line-through">${relatedProduct.originalPrice}</span>
                </div>
                <button 
                  onClick={() => console.log(`Navigate to product ${relatedProduct.id}`)}
                  className="mt-2 text-blue-600 text-sm hover:underline"
                >
                  View Item
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;