import React from "react";
import { FaCamera, FaCheck } from "react-icons/fa";

export default function SellNow() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Sell Your Item</h1>
            <p className="text-sm text-gray-500 mt-1">List your pre-loved item in just a few steps</p>
          </div>

          <form className="space-y-6">
            {/* Photo Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photos (Max 5)
              </label>
              <div className="flex gap-3 overflow-x-auto">
                {[...Array(5)].map((_, i) => (
                  <label
                    key={i}
                    className="min-w-[100px] aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative hover:border-green-400"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        console.log("Selected file:", e.target.files[0])
                      }
                    />
                    <FaCamera className="w-6 h-6 text-gray-400 pointer-events-none" />
                  </label>
                ))}
              </div>
            </div>

            {/* Item Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="e.g., Gently Used Denim Jacket"
              />
            </div>

            {/* Condition Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["New", "Excellent", "Good", "Fair"].map((condition) => (
                  <label
                    key={condition}
                    className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:border-green-400"
                  >
                    <input
                      type="radio"
                      name="condition"
                      className="h-4 w-4 text-green-600"
                    />
                    <span className="ml-3 text-sm text-gray-800">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pricing Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                  <input
                    type="number"
                    className="w-full pl-7 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="Original price"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                  <input
                    type="number"
                    className="w-full pl-7 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="Your asking price"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-amber-100 text-gray-900 py-3 rounded-md font-medium hover:bg-amber-200 transition-colors"
            >
              List Item for Sale
            </button>
          </form>
        </div>

        {/* Selling Tips */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-base font-semibold mb-4 text-gray-800">Selling Tips</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center">
              <FaCheck className="w-4 h-4 text-green-500 mr-2" />
              Use natural lighting for photos
            </li>
            <li className="flex items-center">
              <FaCheck className="w-4 h-4 text-green-500 mr-2" />
              Describe any flaws accurately
            </li>
            <li className="flex items-center">
              <FaCheck className="w-4 h-4 text-green-500 mr-2" />
              Price items 30–50% below retail
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
