import React, { useState } from "react";
import { FaHeart, FaRegHeart, FaShoppingCart, FaFilter, FaStar } from "react-icons/fa";

const CustomerProductsPage = () => {
  // Mock data for products
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Recycled Denim Jacket",
      price: 899000,
      rating: 4.8,
      reviewCount: 24,
      image: "https://via.placeholder.com/300",
      seller: "EcoStyle",
      favorite: false,
      category: "clothing",
      tags: ["sustainable", "upcycled"]
    },
    {
      id: 2,
      name: "Eco-friendly T-shirt",
      price: 299000,
      rating: 4.5,
      reviewCount: 47,
      image: "https://via.placeholder.com/300",
      seller: "GreenThreads",
      favorite: true,
      category: "clothing",
      tags: ["organic", "fair-trade"]
    },
    {
      id: 3,
      name: "Sustainable Bamboo Socks",
      price: 99000,
      rating: 4.6,
      reviewCount: 106,
      image: "https://via.placeholder.com/300",
      seller: "EcoStep",
      favorite: false,
      category: "accessories",
      tags: ["bamboo", "biodegradable"]
    },
    {
      id: 4,
      name: "Upcycled Canvas Tote Bag",
      price: 199000,
      rating: 4.7,
      reviewCount: 63,
      image: "https://via.placeholder.com/300",
      seller: "ReKraft",
      favorite: false,
      category: "accessories",
      tags: ["upcycled", "zero-waste"]
    },
    {
      id: 5,
      name: "Vegan Leather Wallet",
      price: 459000,
      rating: 4.4,
      reviewCount: 18,
      image: "https://via.placeholder.com/300",
      seller: "PlantLeather",
      favorite: false,
      category: "accessories",
      tags: ["vegan", "cruelty-free"]
    },
    {
      id: 6,
      name: "Recycled Glass Water Bottle",
      price: 349000,
      rating: 4.9,
      reviewCount: 73,
      image: "https://via.placeholder.com/300",
      seller: "HydroEco",
      favorite: true,
      category: "lifestyle",
      tags: ["recycled", "reusable"]
    }
  ]);

  // Format price for display (Vietnamese Dong format)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(price);
  };

  // Toggle favorite status
  const toggleFavorite = (id) => {
    setProducts(products.map(product => 
      product.id === id ? {...product, favorite: !product.favorite} : product
    ));
  };

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  // Filter products based on active category
  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(product => product.category === activeCategory);

  // Add to cart (placeholder function)
  const addToCart = (product) => {
    alert(`Added ${product.name} to cart!`);
    // In a real app, this would update cart state or context
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Top filters bar */}
      <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold">Sustainable Products</h1>
          <span className="text-gray-500 text-sm">({filteredProducts.length} items)</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm font-medium hover:text-amber-600"
          >
            <FaFilter className="mr-2" /> 
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          
          <select className="border border-gray-300 rounded-md py-1 px-3 text-sm">
            <option>Newest First</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Most Popular</option>
          </select>
        </div>
      </div>

      {/* Filters panel - visible when showFilters is true */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <h3 className="font-medium mb-2">Categories</h3>
            <div className="space-y-2">
              <button 
                className={`block ${activeCategory === 'all' ? 'text-amber-600 font-medium' : 'text-gray-700'}`}
                onClick={() => setActiveCategory('all')}
              >
                All Categories
              </button>
              <button 
                className={`block ${activeCategory === 'clothing' ? 'text-amber-600 font-medium' : 'text-gray-700'}`}
                onClick={() => setActiveCategory('clothing')}
              >
                Clothing
              </button>
              <button 
                className={`block ${activeCategory === 'accessories' ? 'text-amber-600 font-medium' : 'text-gray-700'}`}
                onClick={() => setActiveCategory('accessories')}
              >
                Accessories
              </button>
              <button 
                className={`block ${activeCategory === 'lifestyle' ? 'text-amber-600 font-medium' : 'text-gray-700'}`}
                onClick={() => setActiveCategory('lifestyle')}
              >
                Lifestyle
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Price Range</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="price1" className="mr-2" />
                <label htmlFor="price1">Under 200,000₫</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="price2" className="mr-2" />
                <label htmlFor="price2">200,000₫ - 500,000₫</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="price3" className="mr-2" />
                <label htmlFor="price3">Over 500,000₫</label>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Sustainability</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="eco1" className="mr-2" />
                <label htmlFor="eco1">Recycled Materials</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="eco2" className="mr-2" />
                <label htmlFor="eco2">Organic</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="eco3" className="mr-2" />
                <label htmlFor="eco3">Fair Trade</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="eco4" className="mr-2" />
                <label htmlFor="eco4">Vegan</label>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Rating</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="radio" name="rating" id="rating4" className="mr-2" />
                <label htmlFor="rating4" className="flex items-center">
                  <div className="flex text-amber-400">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar className="text-gray-300" />
                  </div>
                  <span className="ml-1">& Up</span>
                </label>
              </div>
              <div className="flex items-center">
                <input type="radio" name="rating" id="rating3" className="mr-2" />
                <label htmlFor="rating3" className="flex items-center">
                  <div className="flex text-amber-400">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar className="text-gray-300" />
                    <FaStar className="text-gray-300" />
                  </div>
                  <span className="ml-1">& Up</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative overflow-hidden group">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              <button 
                onClick={() => toggleFavorite(product.id)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-gray-100"
              >
                {product.favorite ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart />
                )}
              </button>
              
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white py-2 rounded transition-colors"
                >
                  <FaShoppingCart className="mr-2" /> Add to Cart
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-gray-500 text-sm mb-1">{product.seller}</p>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-amber-600 font-bold mt-1">{formatPrice(product.price)}</p>
              
              <div className="flex items-center mt-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={i < Math.floor(product.rating) ? "" : "text-gray-300"} 
                      size={14}
                    />
                  ))}
                </div>
                <span className="text-gray-500 text-sm ml-1">
                  ({product.reviewCount})
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-3">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="px-4 py-6 border-t flex justify-center">
        <div className="flex space-x-1">
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Previous</button>
          <button className="px-3 py-1 rounded bg-amber-500 text-white hover:bg-amber-600">1</button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">2</button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">3</button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProductsPage;