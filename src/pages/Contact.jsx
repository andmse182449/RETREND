import React from 'react';

export default function Contact() {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <a href="/" className="hover:underline">Home</a>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-700">Contact Us</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">CONTACT US</h1>
      
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Get In Touch</h2>
          <p className="mb-6 text-gray-600">
            We're here to help! If you have any questions about our products, your order, or our policies, 
            please don't hesitate to reach out. Our customer service team is available Monday through Friday, 
            9:30 AM - 5:30 PM (EST).
          </p>
          
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Email</p>
                <a href="mailto:support@retrend.com" className="text-blue-600 hover:underline">support@retrend.com</a>
                <p className="text-sm text-gray-500 mt-1">We typically respond within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Phone</p>
                <a href="tel:+15551234567" className="text-blue-600 hover:underline">+1 (555) 123-4567</a>
                <p className="text-sm text-gray-500 mt-1">Available Mon-Fri, 9:30AM - 5:30PM (EST)</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Address</p>
                <p>123 Fashion St, Suite 500</p>
                <p>Style City, CA 90210</p>
                <p>United States</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Send Us a Message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" id="subject" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea id="message" rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200">
              Send Message
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">FAQ</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-800">What are your business hours?</h3>
            <p className="text-gray-600">Our customer service team is available Monday through Friday from 9:30 AM to 5:30 PM (EST).</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">How quickly will I receive a response?</h3>
            <p className="text-gray-600">We strive to respond to all inquiries within 24 hours during business days.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Can I visit your physical store?</h3>
            <p className="text-gray-600">Yes, our showroom is open to visitors by appointment only. Please contact us to schedule a visit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}