import React from 'react';

export default function Contact() {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <a href="/" className="hover:underline">Trang chủ</a>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-700">Liên hệ chúng tôi</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">LIÊN HỆ CHÚNG TÔI</h1>
      
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Liên lạc với chúng tôi</h2>
          <p className="mb-6 text-gray-600">
            Chúng tôi ở đây để giúp bạn! Nếu bạn có bất kỳ câu hỏi nào về sản phẩm, đơn hàng hoặc chính sách của chúng tôi, 
            đừng ngần ngại liên hệ. Đội ngũ dịch vụ khách hàng của chúng tôi làm việc từ Thứ Hai đến Thứ Sáu, 
            9:30 sáng - 8:30 chiều (giờ EST).
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
                <a href="mailto:support@retrend.com" className="text-blue-600 hover:underline">retrend@gmail.com</a>
                <p className="text-sm text-gray-500 mt-1">Chúng tôi thường trả lời trong vòng 24 giờ</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Điện thoại</p>
                <a href="tel:+15551234567" className="text-blue-600 hover:underline">+1 (555) 123-4567</a>
                <p className="text-sm text-gray-500 mt-1">Làm việc Thứ Hai - Thứ Sáu, 9:30 sáng - 8:30 chiều (giờ EST)</p>
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
                <p className="font-medium">Địa chỉ</p>
                <p>FPT University</p>
                <p>Thành phố Thủ Đức</p>
                <p>Việt Nam</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Gửi tin nhắn cho chúng tôi</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input type="text" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ Email</label>
              <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Chủ đề</label>
              <input type="text" id="subject" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Tin nhắn</label>
              <textarea id="message" rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200">
              Gửi tin nhắn
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Câu hỏi thường gặp (FAQ)</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-800">Giờ làm việc của bạn là gì?</h3>
            <p className="text-gray-600">Đội ngũ dịch vụ khách hàng của chúng tôi làm việc từ Thứ Hai đến Thứ Sáu, từ 9:30 sáng đến 5:30 chiều (giờ EST).</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Tôi sẽ nhận được phản hồi trong bao lâu?</h3>
            <p className="text-gray-600">Chúng tôi cố gắng trả lời tất cả các yêu cầu trong vòng 24 giờ vào các ngày làm việc.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Tôi có thể đến cửa hàng trực tiếp của bạn không?</h3>
            <p className="text-gray-600">Có, phòng trưng bày của chúng tôi mở cửa đón khách theo lịch hẹn. Vui lòng liên hệ với chúng tôi để đặt lịch hẹn.</p>
          </div>
        </div>
      </div>
    </div>
  );
}