import React from 'react';

export default function Shipping() {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <a href="/" className="hover:underline">Trang chủ</a>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-700">Chính sách Vận chuyển</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">CHÍNH SÁCH VẬN CHUYỂN</h1>
      
      <div className="mb-8">
        <p className="mb-4 text-gray-700 text-lg">
          Chúng tôi cam kết giao đơn hàng của bạn một cách nhanh chóng, an toàn và với chi phí hợp lý. 
          Dưới đây là thông tin chi tiết về các lựa chọn vận chuyển, thời gian giao hàng và chính sách của chúng tôi áp dụng tại Việt Nam.
        </p>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">1</span>
          Các Lựa Chọn Vận Chuyển
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 mb-6">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Phương Thức Vận Chuyển</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Thời Gian Giao Hàng Ước Tính</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Chi Phí (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 border-b text-gray-600">Giao Hàng Tiêu Chuẩn</td>
                <td className="py-3 px-4 border-b text-gray-600">2-5 ngày làm việc</td>
                <td className="py-3 px-4 border-b text-gray-600">25.000 - 35.000</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 border-b text-gray-600">Giao Hàng Nhanh</td>
                <td className="py-3 px-4 border-b text-gray-600">1-3 ngày làm việc</td>
                <td className="py-3 px-4 border-b text-gray-600">40.000 - 60.000</td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b text-gray-600">Giao Hỏa Tốc (Nội thành TP.HCM & Hà Nội)</td>
                <td className="py-3 px-4 border-b text-gray-600">Trong ngày (đặt trước 14:00)</td>
                <td className="py-3 px-4 border-b text-gray-600">50.000 - 70.000</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mb-6">
          <p className="text-green-700">
            <strong>Miễn Phí Vận Chuyển:</strong> Đơn hàng từ 500.000 VNĐ trở lên được miễn phí vận chuyển tiêu chuẩn toàn quốc.
          </p>
        </div>
        
        <p className="text-gray-600">
          Ngày làm việc là từ Thứ Hai đến Thứ Sáu, không bao gồm các ngày lễ, Tết theo quy định. Đơn hàng đặt sau 15:00 
          sẽ được xử lý vào ngày làm việc tiếp theo.
        </p>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">2</span>
          Xử Lý Đơn Hàng
        </h2>
        <p className="mb-4 text-gray-600">
          Sau khi bạn đặt hàng, bạn sẽ nhận được email xác nhận đơn hàng cùng với mã đơn hàng của bạn.
        </p>
        <ul className="list-disc list-inside text-gray-600 pl-8 space-y-2">
          <li>Đơn hàng thường được xử lý trong vòng 1 ngày làm việc</li>
          <li>Trong mùa cao điểm hoặc các đợt khuyến mãi lớn, việc xử lý có thể mất đến 2-3 ngày làm việc</li>
          <li>Bạn sẽ nhận được email xác nhận vận chuyển cùng với thông tin theo dõi (nếu có) khi đơn hàng của bạn được gửi đi</li>
          <li>Các mặt hàng đặt trước (pre-order) sẽ được vận chuyển riêng khi chúng có sẵn</li>
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">3</span>
          Phạm Vi Vận Chuyển
        </h2>
        <p className="mb-4 text-gray-600">
          Chúng tôi hiện đang vận chuyển đến tất cả các tỉnh thành trên toàn quốc Việt Nam.
        </p>
        <ul className="list-disc list-inside text-gray-600 pl-8 space-y-2">
            <li>Giao hàng đến địa chỉ nhà riêng, văn phòng.</li>
            <li>Không hỗ trợ giao hàng đến các hộp thư công cộng hoặc các địa điểm hạn chế theo quy định.</li>
        </ul>
         {/* Phần này không còn phù hợp với phạm vi nội địa VN 
         <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <p className="text-yellow-700">
            <strong>Quan trọng:</strong> Đơn hàng quốc tế có thể phải chịu phí hải quan, thuế nhập khẩu, 
            và các loại thuế khác, người nhận hàng chịu trách nhiệm thanh toán và không được bao gồm trong phí vận chuyển của chúng tôi.
          </p>
        </div> 
        */}
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">4</span>
          Theo Dõi Đơn Hàng Của Bạn
        </h2>
        <p className="mb-4 text-gray-600">
          Sau khi đơn hàng của bạn được gửi đi, bạn sẽ nhận được thông báo (email hoặc SMS) cùng với mã vận đơn (nếu có) để theo dõi. 
          Bạn cũng có thể theo dõi đơn hàng của mình bằng cách:
        </p>
        <ul className="list-disc list-inside text-gray-600 pl-8 space-y-2">
          <li>Đăng nhập vào tài khoản của bạn trên website và xem lịch sử đơn hàng</li>
          <li>Sử dụng mã vận đơn để tra cứu trên website của đối tác vận chuyển (ví dụ: Viettel Post, GHN, GHTK,...)</li>
          <li>Liên hệ với đội ngũ dịch vụ khách hàng của chúng tôi và cung cấp mã đơn hàng</li>
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 mr-2">5</span>
          Các Chính Sách Vận Chuyển Khác
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Thay Đổi Địa Chỉ</h3>
            <p className="text-gray-600">
              Chúng tôi chỉ có thể hỗ trợ thay đổi địa chỉ nếu đơn hàng của bạn chưa được bàn giao cho đơn vị vận chuyển. Vui lòng liên hệ với đội ngũ dịch vụ khách hàng 
              của chúng tôi ngay lập tức nếu bạn cần thay đổi địa chỉ giao hàng.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Chậm Trễ Vận Chuyển</h3>
            <p className="text-gray-600">
              Đôi khi, đơn hàng có thể bị chậm trễ do các trường hợp ngoài tầm kiểm soát như điều kiện thời tiết bất lợi, 
              sự cố từ phía đơn vị vận chuyển, hoặc các giai đoạn cao điểm (Lễ, Tết). Chúng tôi sẽ cố gắng thông báo cho bạn về bất kỳ sự chậm trễ đáng kể nào.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Gói Hàng Bị Mất hoặc Hư Hỏng</h3>
            <p className="text-gray-600">
              Nếu gói hàng của bạn có dấu hiệu bị mất hoặc bị hư hỏng khi đến nơi, vui lòng liên hệ với đội ngũ dịch vụ khách hàng của chúng tôi trong vòng 
              24 giờ kể từ khi nhận hàng (hoặc ngày dự kiến giao hàng). Vui lòng giữ lại bằng chứng (hình ảnh, video) để chúng tôi có thể làm việc với đơn vị vận chuyển và giải quyết vấn đề.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Nhiều Lô Hàng</h3>
            <p className="text-gray-600">
              Các đơn hàng lớn hoặc đơn hàng chứa các mặt hàng đặc biệt có thể được vận chuyển thành nhiều gói. 
              Bạn sẽ nhận được thông tin theo dõi cho từng gói hàng (nếu có).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Liên Hệ Bộ Phận Vận Chuyển & CSKH</h2>
        <p className="mb-4 text-gray-600">
          Nếu bạn có bất kỳ câu hỏi nào về vận chuyển hoặc cần hỗ trợ theo dõi đơn hàng, đội ngũ dịch vụ khách hàng của chúng tôi luôn sẵn sàng giúp đỡ.
        </p>
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href="mailto:hotro@tencongtycuaban.vn" className="text-blue-600 hover:underline">hotro@tencongtycuaban.vn</a>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href="tel:1900xxxx" className="text-blue-600 hover:underline">1900 xxxx</a> (Hoặc: 02x xxx xxxx)
          </div>
        </div>
      </div>
    </div>
  );
}