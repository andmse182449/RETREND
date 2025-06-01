import React from 'react';

export default function Returns() {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <a href="/" className="hover:underline">Trang chủ</a>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-700">Chính sách Đổi & Trả Hàng</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">CHÍNH SÁCH ĐỔI & TRẢ HÀNG</h1>
      
      <div className="mb-8">
        <p className="mb-4 text-gray-700 text-lg">
          Chúng tôi muốn bạn hoàn toàn hài lòng với giao dịch mua hàng của mình. Nếu bạn không hoàn toàn 
          hài lòng với đơn hàng, chúng tôi ở đây để giúp bạn.
        </p>
        <p className="mb-4 text-gray-700">
          Tất cả sản phẩm có thể được trả lại hoặc đổi trong vòng 30 ngày kể từ ngày giao hàng, với điều kiện đáp ứng các điều kiện trả hàng của chúng tôi.
        </p>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">1</span>
          Điều kiện Trả Hàng Chung
        </h2>
        <ul className="list-disc list-inside text-gray-600 pl-8 space-y-2">
          <li>Sản phẩm phải chưa qua sử dụng, không bị hư hỏng, và còn nguyên tình trạng ban đầu</li>
          <li>Tất cả bao bì gốc và nhãn mác phải còn nguyên vẹn</li>
          <li>Các mặt hàng đang giảm giá hoặc được đánh dấu là "final sale" (không hoàn trả) không thể trả lại</li>
          <li>Các mặt hàng đặt làm riêng hoặc cá nhân hóa không đủ điều kiện trả lại trừ khi bị lỗi</li>
          <li>Việc trả hàng phải qua kiểm tra trước khi xử lý hoàn tiền</li>
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">2</span>
          Cách Trả Hàng
        </h2>
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <ol className="list-decimal list-inside text-gray-600 space-y-4">
            <li className="pb-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Liên hệ đội ngũ hỗ trợ của chúng tôi</span>
              <p className="mt-1 pl-5">
                Gửi email cho chúng tôi tại <a href="mailto:returns@retrend.com" className="text-blue-600 hover:underline">returns@retrend.com</a> hoặc 
                gọi <a href="tel:+15551234567" className="text-blue-600 hover:underline">+1 (555) 123-4567</a> trong vòng 7 ngày kể từ khi nhận đơn hàng.
              </p>
            </li>
            <li className="pb-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Điền vào biểu mẫu trả hàng</span>
              <p className="mt-1 pl-5">
                Bao gồm mã đơn hàng, các mặt hàng bạn muốn trả lại và lý do trả hàng.
              </p>
            </li>
            <li className="pb-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Đóng gói hàng trả lại</span>
              <p className="mt-1 pl-5">
                Cẩn thận đóng gói lại các mặt hàng trong bao bì gốc cùng với biểu mẫu trả hàng đã hoàn thành.
              </p>
            </li>
            <li>
              <span className="font-medium text-gray-700">Gửi hàng trả lại</span>
              <p className="mt-1 pl-5">
                Gửi gói hàng của bạn đến địa chỉ được cung cấp bởi đội ngũ dịch vụ khách hàng của chúng tôi. Chúng tôi khuyên bạn nên sử dụng phương thức vận chuyển có thể theo dõi.
              </p>
            </li>
          </ol>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-blue-700">
            <strong>Lưu ý:</strong> Đối với các giao dịch mua tại cửa hàng, bạn có thể trả lại hàng tại bất kỳ địa điểm cửa hàng nào của chúng tôi. 
            Vui lòng mang theo hóa đơn và các mặt hàng còn nguyên tình trạng ban đầu.
          </p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">3</span>
          Quy Trình Hoàn Tiền
        </h2>
        <p className="mb-4 text-gray-600">
          Sau khi chúng tôi nhận được hàng trả lại, đội ngũ của chúng tôi sẽ kiểm tra các mặt hàng để đảm bảo chúng đáp ứng các điều kiện trả hàng.
        </p>
        <ul className="list-disc list-inside text-gray-600 pl-8 space-y-2">
          <li>Việc hoàn tiền sẽ được xử lý trong vòng 7 ngày làm việc sau khi nhận và kiểm tra hàng trả lại</li>
          <li>Tiền hoàn sẽ được chuyển vào phương thức thanh toán ban đầu đã sử dụng để mua hàng</li>
          <li>Số tiền hoàn lại sẽ bao gồm giá của các mặt hàng được trả lại nhưng không bao gồm chi phí vận chuyển ban đầu</li>
          <li>Đối với các mặt hàng được mua bằng mã giảm giá, số tiền hoàn lại sẽ phản ánh giá đã giảm</li>
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">4</span>
          Đổi Hàng
        </h2>
        <p className="mb-4 text-gray-600">
          Nếu bạn muốn đổi một mặt hàng lấy kích cỡ, màu sắc hoặc kiểu dáng khác, vui lòng làm theo quy trình trả hàng tương tự 
          và cho biết sở thích đổi hàng của bạn.
        </p>
        <ul className="list-disc list-inside text-gray-600 pl-8 space-y-2">
          <li>Việc đổi hàng tùy thuộc vào tình trạng sẵn có của sản phẩm</li>
          <li>Nếu mặt hàng được đổi có giá khác, bạn sẽ bị tính phí hoặc được hoàn lại phần chênh lệch</li>
          <li>Chúng tôi sẽ xử lý việc đổi hàng của bạn nhanh nhất có thể sau khi nhận được hàng trả lại</li>
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">5</span>
          Hàng Hóa Bị Hư Hỏng hoặc Lỗi
        </h2>
        <p className="mb-4 text-gray-600">
          Nếu bạn nhận được một mặt hàng bị hư hỏng hoặc lỗi, vui lòng liên hệ với chúng tôi trong vòng 48 giờ kể từ khi giao hàng. 
          Chúng tôi sẽ sắp xếp việc thay thế hoặc hoàn tiền.
        </p>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <p className="text-yellow-700">
            <strong>Quan trọng:</strong> Vui lòng chụp ảnh các mặt hàng bị hư hỏng và bao bì để giúp chúng tôi xử lý yêu cầu của bạn hiệu quả hơn.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Liên Hệ Bộ Phận Trả Hàng</h2>
        <p className="mb-4 text-gray-600">
          Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ về việc trả hàng hoặc đổi hàng, đội ngũ dịch vụ khách hàng của chúng tôi luôn sẵn sàng giúp đỡ.
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