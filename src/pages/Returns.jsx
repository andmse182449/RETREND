import React from 'react';

export default function Returns() {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <a href="/" className="hover:underline">Home</a>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-700">Returns & Exchanges</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">RETURNS & EXCHANGES POLICY</h1>
      
      <div className="mb-8">
        <p className="mb-4 text-gray-700 text-lg">
          We want you to be completely satisfied with your purchase. If you're not entirely happy 
          with your order, we're here to help.
        </p>
        <p className="mb-4 text-gray-700">
          All products can be returned or exchanged within 30 days of delivery, provided they meet our return conditions.
        </p>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">1</span>
          General Return Conditions
        </h2>
        <ul className="list-disc list-inside text-gray-600 pl-8 space-y-2">
          <li>Products must be unused, undamaged, and in their original condition</li>
          <li>All original packaging and tags must be intact</li>
          <li>Items on sale or marked as final sale cannot be returned</li>
          <li>Custom or personalized items are not eligible for return unless defective</li>
          <li>Returns are subject to inspection before a refund is processed</li>
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">2</span>
          How to Return an Item
        </h2>
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <ol className="list-decimal list-inside text-gray-600 space-y-4">
            <li className="pb-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Contact our support team</span>
              <p className="mt-1 pl-5">
                Email us at <a href="mailto:returns@retrend.com" className="text-blue-600 hover:underline">returns@retrend.com</a> or 
                call <a href="tel:+15551234567" className="text-blue-600 hover:underline">+1 (555) 123-4567</a> within 7 days of receiving your order.
              </p>
            </li>
            <li className="pb-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Fill out the return form</span>
              <p className="mt-1 pl-5">
                Include your order number, the items you wish to return, and the reason for the return.
              </p>
            </li>
            <li className="pb-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Package your return</span>
              <p className="mt-1 pl-5">
                Carefully repackage the items in their original packaging along with the completed return form.
              </p>
            </li>
            <li>
              <span className="font-medium text-gray-700">Ship your return</span>
              <p className="mt-1 pl-5">
                Send your package to the address provided by our customer service team. We recommend using a trackable shipping method.
              </p>
            </li>
          </ol>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-blue-700">
            <strong>Note:</strong> For store purchases, you can return items to any of our physical store locations. 
            Please bring your receipt and the items in their original condition.
          </p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">3</span>
          Refund Process
        </h2>
        <p className="mb-4 text-gray-600">
          Once we receive your return, our team will inspect the items to ensure they meet our return conditions.
        </p>
        <ul className="list-disc list-inside text-gray-600 pl-8 space-y-2">
          <li>Refunds will be processed within 7 business days after receiving and inspecting your return</li>
          <li>Refunds will be issued to the original payment method used for the purchase</li>
          <li>The refund amount will include the price of the returned items but not the original shipping costs</li>
          <li>For items purchased with a discount code, the refunded amount will reflect the discounted price</li>
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">4</span>
          Exchanges
        </h2>
        <p className="mb-4 text-gray-600">
          If you'd like to exchange an item for a different size, color, or style, please follow the same return process 
          and indicate your preference for an exchange.
        </p>
        <ul className="list-disc list-inside text-gray-600 pl-8 space-y-2">
          <li>Exchanges are subject to product availability</li>
          <li>If the exchanged item has a different price, you will be charged or refunded the difference</li>
          <li>We'll process your exchange as quickly as possible once we receive your return</li>
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">5</span>
          Damaged or Defective Items
        </h2>
        <p className="mb-4 text-gray-600">
          If you receive a damaged or defective item, please contact us within 48 hours of delivery. 
          We'll arrange for a replacement or refund.
        </p>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <p className="text-yellow-700">
            <strong>Important:</strong> Please take photos of the damaged items and packaging to help us process your claim more efficiently.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Contact Our Returns Department</h2>
        <p className="mb-4 text-gray-600">
          If you have any questions or need assistance with returns or exchanges, our customer service team is here to help.
        </p>
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href="mailto:returns@retrend.com" className="text-blue-600 hover:underline">returns@retrend.com</a>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href="tel:+15551234567" className="text-blue-600 hover:underline">+1 (555) 123-4567</a>
          </div>
        </div>
      </div>
    </div>
  );
}