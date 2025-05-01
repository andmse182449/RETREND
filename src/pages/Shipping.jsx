import React from 'react';

export default function Shipping() {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <a href="/" className="hover:underline">Home</a>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-700">Shipping Policy</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">SHIPPING POLICY</h1>
      
      <div className="mb-8">
        <p className="mb-4 text-gray-700 text-lg">
          We are committed to delivering your orders quickly, safely, and affordably. 
          Below you'll find detailed information about our shipping options, delivery times, and policies.
        </p>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">1</span>
          Shipping Options
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 mb-6">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Shipping Method</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Estimated Delivery Time</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 border-b text-gray-600">Standard Shipping</td>
                <td className="py-3 px-4 border-b text-gray-600">5-7 business days</td>
                <td className="py-3 px-4 border-b text-gray-600">$7.95</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 border-b text-gray-600">Express Shipping</td>
                <td className="py-3 px-4 border-b text-gray-600">2-3 business days</td>
                <td className="py-3 px-4 border-b text-gray-600">$14.95</td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b text-gray-600">Next Day Delivery</td>
                <td className="py-3 px-4 border-b text-gray-600">1 business day (order by 1PM EST)</td>
                <td className="py-3 px-4 border-b text-gray-600">$24.95</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 border-b text-gray-600">International Shipping</td>
                <td className="py-3 px-4 border-b text-gray-600">7-14 business days</td>
                <td className="py-3 px-4 border-b text-gray-600">Varies by location</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mb-6">
          <p className="text-green-700">
            <strong>Free Shipping:</strong> Orders over $100 qualify for free standard shipping within the continental United States.
          </p>
        </div>
        
        <p className="text-gray-600">
          Business days are Monday through Friday, excluding federal holidays. Orders placed after 2PM EST 
          will be processed the following business day.
        </p>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">2</span>
          Order Processing
        </h2>
        <p className="mb-4 text-gray-600">
          Once you place an order, you'll receive an order confirmation email with your order number.
        </p>
        <ul className="list-disc list-inside text-gray-600 pl-8 space-y-2">
          <li>Orders are typically processed within 1-2 business days</li>
          <li>During peak seasons or promotional periods, processing may take up to 3 business days</li>
          <li>You'll receive a shipping confirmation email with tracking information once your order ships</li>
          <li>Pre-order and back-ordered items will ship separately when they become available</li>
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">3</span>
          Shipping Destinations
        </h2>
        <p className="mb-4 text-gray-600">
          We currently ship to the following regions:
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Domestic</h3>
            <ul className="list-disc list-inside text-gray-600 pl-4">
              <li>All 50 United States</li>
              <li>U.S. Territories (Puerto Rico, Guam, U.S. Virgin Islands)</li>
              <li>APO/FPO addresses</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">International</h3>
            <ul className="list-disc list-inside text-gray-600 pl-4">
              <li>Canada</li>
              <li>Mexico</li>
              <li>European Union countries</li>
              <li>United Kingdom</li>
              <li>Australia and New Zealand</li>
              <li>Select Asian countries</li>
            </ul>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <p className="text-yellow-700">
            <strong>Important:</strong> International orders may be subject to customs fees, import duties, and taxes, 
            which are the responsibility of the recipient and are not included in our shipping charges.
          </p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">4</span>
          Tracking Your Order
        </h2>
        <p className="mb-4 text-gray-600">
          After your order ships, you'll receive a shipping confirmation email with tracking information. 
          You can also track your order by:
        </p>
        <ul className="list-disc list-inside text-gray-600 pl-8 space-y-2">
          <li>Logging into your account and viewing your order history</li>
          <li>Clicking the tracking link in your shipping confirmation email</li>
          <li>Contacting our customer service team with your order number</li>
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">5</span>
          Shipping Policies
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Address Changes</h3>
            <p className="text-gray-600">
              We can only make address changes if your order has not yet been processed. Please contact our customer service 
              team immediately if you need to change your shipping address.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Shipping Delays</h3>
            <p className="text-gray-600">
              Occasionally, orders may be delayed due to circumstances beyond our control, such as weather conditions, 
              carrier delays, or high volume periods. We'll make every effort to inform you of any significant delays.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Lost or Damaged Packages</h3>
            <p className="text-gray-600">
              If your package appears to be lost or arrives damaged, please contact our customer service team within 
              48 hours of the expected delivery date. We'll work with the carrier to resolve the issue.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Multiple Shipments</h3>
            <p className="text-gray-600">
              Large orders or orders containing items from different warehouses may be shipped in multiple packages. 
              You'll receive tracking information for each package.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Contact Our Shipping Department</h2>
        <p className="mb-4 text-gray-600">
          If you have any questions about shipping or need assistance with tracking your order, our customer service team is here to help.
        </p>
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href="mailto:shipping@retrend.com" className="text-blue-600 hover:underline">shipping@retrend.com</a>
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