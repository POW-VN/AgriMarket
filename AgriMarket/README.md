Chức năng chung: 
Đăng ký tài khoản
Đăng nhập
Đăng nhập bằng Google
Đăng xuất
View profile
Edit profile
Đổi mật khẩu
Quên mật khẩu
Gửi yêu cầu hỗ trợ đến admin
Gửi báo cáo vi phạm 
Người nông dân: 
Đăng sản phẩm nông sản
Cập nhật số lượng tồn kho
Thay đổi thông tin sản phẩm, ngừng bán sp
Xác nhận/ từ chối đơn hàng
Chat với người mua
View thống kê doanh thu
View feedback
Xem lịch sử đơn hàng
Mở phiên live bán hàng
Ghim sản phẩm vào livestream 
Kết thúc livestream 
Tạo chương trình khuyến mãi / giảm giá sản phẩm
Xem thông báo 
AI hỗ trợ viết mô tả sản phẩm 
AI gợi ý giá sản phẩm


Khách hàng:
Tìm kiếm sản phẩm
Lọc sản phẩm
Thêm vào giỏ hàng 
Cập nhật số lượng 
Xóa khỏi giỏ hàng 
Xem giỏ hàng
view chi tiết sản phẩm
view hồ sơ nông dân
Đặt hàng
Huỷ đơn hàng
Thanh toán đơn hàng
Feedback
Sửa/Xoá đánh giá 
Xem lịch sử mua hàng
Chat với nông dân
Đặt trước mùa vụ
Thêm sản phẩm vào wishlist
Thêm sản phẩm yêu thích
Xóa sản phẩm yêu thích
Xem danh sách yêu thích
Follow nhà vườn
Unfollow nhà vườn
Xem danh sách đang theo dõi 
Xem sản phẩm đã xem gần đây 
Áp dụng voucher khi checkout 
Chat với AI
Xem sản phẩm đề xuất cho bạn (AI gợi ý sản phẩm)
Thêm địa chỉ
Sửa địa chỉ
Chọn địa chỉ mặc định 

Quản trị viên:
Khoá/mở tài khoản
Xem danh sách đơn hàng
Theo dõi giao dịch
Xem danh sách khiếu nại
View báo cáo vi phạm
View list account
Tìm kiếm account
Xem thống kê hệ thống
Gửi thông báo hệ thống
Duyệt sản phẩm trước khi hiển thị
Xem danh mục sản phẩm
Tạo voucher
Xem danh sách nội dung AI phản hồi
view sản phẩm vi phạm 

Đơn vị vận chuyển:
Nhận yêu cầu vận chuyển
Xem danh sách đơn cần giao 
Cập nhật trạng thái đơn hàng
Xem lịch sử vận chuyển
Xác nhận lấy hàng 
Xác nhận giao hàng thành công
Liên hệ khách hàng



1. Bảng admin:
id (PK): Khóa chính
full_name: Họ và tên
email: Địa chỉ email
password: Mật khẩu mã hóa
avatar_url: Đường dẫn ảnh đại diện
create_at: Thời gian tạo
2. Bảng Customer (Khách hàng)
id (PK)
full_name
email
phone
password
avatar_url
status:active, banned, pending
created_at 
2.1 Bảng customer_address
- id (PK)
- customer_id (FK)
- receiver_name
- phone
- address
- is_default
3. Bảng farmer (Nông dân/Nhà vườn)
id (PK): Khóa chính
full_name:
email
phone
password
avatar_url
farm_name: Tên nông trại
farm_address: Địa chỉ nông trại
description: Mô tả về nông trại
verification_status: pending,verified, rejected Trạng thái xác thực tài khoản nhà vườn
rating_average: Điểm đánh giá trung bình
total_products: Tổng số sản phẩm
created_at: Thời gian đăng ký
status: active, banned, pending
created_at
4. Bảng otp_verification
- id (PK)
- email	
user_type: customer/farmer/admin
- otp_code
- type: register, forgot_password
- expired_at
- verified
- created_at

5. Bảng categories (Danh mục sản phẩm)
id (PK): Khóa chính
name: Tên danh mục
description: Mô tả danh mục
parent_id: ID danh mục cha (dùng cho danh mục đa cấp)
6. Bảng product (Sản phẩm)
id (PK): Khóa chính
farmer_id (FK): Khóa ngoại liên kết với bảng farmer
category_id (FK): Khóa ngoại liên kết với bảng categories
name: Tên sản phẩm
description: Mô tả chi tiết
ai_generated_description 
price: Giá sản phẩm
ai_suggested_price 
stock_quantity: Số lượng tồn kho
unit: Đơn vị tính (kg, thùng, bó...)
status: Trạng thái kiểm duyệt và hiển thị của sản phẩm
harvest_date: Ngày thu hoạch
created_at: Thời gian tạo
status
pending
approved
rejected
hidden
sold_out
draft
7. Bảng product_image:
id (PK)
product_id (FK)
img_url
is_thumbnail
8. Bảng product_discount (Giảm giá sản phẩm)
id (PK): Khóa chính
product_id (FK): Khóa ngoại liên kết tới bảng product
discount_percent: Phần trăm giảm giá
start_date: Ngày bắt đầu áp dụng
end_date: Ngày kết thúc chương trình
9. Bảng product_view_history
- id (PK)
- customer_id (FK)
- product_id (FK)
- viewed_at

10. Bảng cart (Giỏ hàng)
id (PK): Khóa chính
customer_id (FK): Khóa ngoại thuộc về khách hàng nào
created_at: Thời gian thêm vào giỏ
UNIQUE(customer_id)
11. Bảng cart_item
id (PK)
cart_id (FK)
product_id (FK)
quantity:
UNIQUE(cart_id, product_id)
12. Bảng wishlist
- id (PK)
- customer_id (FK)
- created_at
UNIQUE(customer_id)
13. Bảng wishlist_item
- wishlist_id 
- product_id 
primary key (wishlist_id, product_id)
14. Bảng checkout (Phiên thanh toán/Khởi tạo đơn hàng)
id (PK): Khóa chính
customer_id (FK): Khóa ngoại người đặt hàng
subtotal: Tạm tính tổng tiền sản phẩm
shipping_fee: Phí vận chuyển
discount_amount: Số tiền được giảm giá
total_amount: Tổng số tiền cuối cùng phải trả
shipping_address: Địa chỉ giao nhận hàng
status: Trạng thái thanh toán/checkout
created_at: Thời gian khởi tạo
expired_at: Thời gian hết hạn phiên thanh toán
status
pending
payment_processing
completed
expired
cancelled

15. Bảng checkout_item (Chi tiết phiên thanh toán)
id (PK): Khóa chính
checkout_id (FK): Thuộc phiên checkout nào
product_id (FK): ID sản phẩm mua
product_name: Tên sản phẩm tại thời điểm thanh toán
product_thumbnail: Ảnh sản phẩm
quantity: Số lượng
unit_price: Đơn giá
subtotal: Thành tiền
16. Bảng order (Đơn hàng chính thức)
id (PK): Khóa chính
customer_id (FK): Khóa ngoại người mua
checkout_id (FK): Liên kết với phiên checkout
total_price: Tổng tiền đơn hàng
status: Trạng thái đơn hàng (Ví dụ: Chờ xử lý, Đang giao, Đã giao...)
payment_status: Trạng thái thanh toán đơn hàng
shipping_address: Địa chỉ nhận hàng
created_at: Thời gian đặt hàng
status
pending
confirmed
shipping
delivered
cancelled
rejected
payment_status
unpaid
paid
refunded
17. Bảng order_item (Chi tiết đơn hàng)
id (PK): Khóa chính
order_id (FK): Thuộc đơn hàng nào
product_id (FK): ID sản phẩm mua
farmer_id (FK): Khóa ngoại người bán (nhà vườn)
product_name: Tên sản phẩm lúc mua
product_thumbnail: Ảnh sản phẩm lúc mua
quantity: Số lượng đặt
unit_price: Đơn giá sản phẩm
subtotal: Thành tiền
18. Bảng order_cancellation (Hủy đơn hàng)
id (PK): Khóa chính
order_id (FK) (unique): ID đơn hàng bị hủy
cancel_by: Người thực hiện hủy (Khách hàng / Nhà vườn / Admin)
reason: Lý do hủy đơn
created_at: Thời gian hủy đơn
19. Bảng payment (Giao dịch thanh toán)
id (PK): Khóa chính
order_id (FK): Khóa ngoại thuộc đơn hàng nào
payment_method: Phương thức thanh toán (Ví dụ: COD, Chuyển khoản, Ví điện tử...)
transaction_code: Mã giao dịch từ cổng thanh toán
amount: Số tiền thanh toán
status: Trạng thái giao dịch
paid_at: Thời gian thực hiện thanh toán thành công
created_at
20. Bảng voucher
- id (PK)
- code
- discount_percent
- max_discount
- quantity
- expired_at 
21. Bảng voucher_usage
- voucher_id 
- customer_id 
- used_at
PRIMARY KEY(voucher_id, customer_id)
22. Bảng shipping_partner (Đối tác/Đơn vị vận chuyển)
id (PK): Khóa chính
company_name: Tên công ty vận chuyển
phone: Số điện thoại liên hệ
email: Email liên hệ
23. Bảng shipments (Thông tin giao hàng)
id (PK): Khóa chính
order_id (FK): Thuộc đơn hàng nào
shipping_partner_id (FK): Đơn vị nào vận chuyển
tracking_code: Mã vận đơn
status: Trạng thái vận chuyển (Đang lấy hàng, Đang giao, Thất bại...)
estimated_delivery: Thời gian dự kiến giao hàng
delivered_at: Thời gian giao hàng thành công thực tế
created_at: Thời gian tạo phiếu giao hàng
24. Bảng product_review (Đánh giá sản phẩm)
id (PK): Khóa chính
order_id (FK): Đánh giá dựa trên đơn hàng nào
product_id (FK): Đánh giá cho sản phẩm nào
customer_id (FK): Người thực hiện đánh giá
rating: Số sao đánh giá (1-5)
comment: Nội dung bình luận
created_at: Thời gian đánh giá
UNIQUE(order_id, product_id, customer_id)
25. Bảng farmer_review (Đánh giá nhà vườn)
id (PK): Khóa chính
farmer_id (FK): Đánh giá cho nhà vườn nào
customer_id (FK): Khách hàng đánh giá
order_id (FK)
rating: Số sao đánh giá
comment: Nội dung bình luận
created_at: Thời gian đánh giá
26. Bảng preorder (Đặt hàng trước)
id (PK): Khóa chính
customer_id (FK): Khách hàng đặt trước
status: Trạng thái đơn đặt trước
created_at: Thời gian đặt trước
27. Bảng preorder_item
id (PK)
preorder_id (FK)
product_id (FK)
quantity
expected_harvest_date 
28. Bảng conversation (Cuộc trò chuyện/Chat)
id (PK): Khóa chính
customer_id (FK): ID khách hàng tham gia
farmer_id (FK): ID nông dân tham gia
created_at: Thời gian bắt đầu cuộc trò chuyện
UNIQUE(customer_id, farmer_id)
29. Bảng messages (Tin nhắn chi tiết)
id (PK): Khóa chính
conversation_id (FK): Thuộc cuộc trò chuyện nào
sender_type: customer/farmer
sender_id
message: Nội dung tin nhắn
created_at: Thời gian gửi tin
30. Bảng livestream (Phát trực tiếp công việc/bán hàng)
id (PK): Khóa chính
farmer_id (FK): Nhà vườn nào phát livestream
title: Tiêu đề livestream
description: Mô tả livestream
start_time: Thời gian bắt đầu
status: Trạng thái livestream (Đang phát, Đã kết thúc...)
created_at: Thời gian tạo phiên livestream
31. Bảng livestream_product (Sản phẩm trong livestream)
livestream_id : Liên kết với phiên livestream
product_id : ID sản phẩm được ghim/bán trong livestream đó
PRIMARY KEY(livestream_id, product_id)
32. livestream_comment
- id (PK)
- livestream_id (FK)
- sender_type:  customer,  farmer
- sender_id
- comment
- created_at
33. Bảng support_requests (Yêu cầu hỗ trợ)
id (PK): Khóa chính
sender_type: customer/farmer
sender_id:
title: Tiêu đề yêu cầu
description: Chi tiết nội dung cần hỗ trợ
status: Trạng thái xử lý yêu cầu (Chờ duyệt, Đã giải quyết...)
created_at: Thời gian gửi yêu cầu
34. Bảng notification (Thông báo)
id (PK): Khóa chính
receiver_type: customer, farmer
receiver_id
title: Tiêu đề thông báo
content: Nội dung thông báo
is_read: Đánh giá trạng thái đã đọc hay chưa (True/False)
created_at: Thời gian gửi thông báo
35. Bảng report (Báo cáo vi phạm)
id (PK): Khóa chính
reporter_type: customer/farmer
target_type: farmer/customer/product
target_id
reason: Lý do báo cáo
description: Mô tả chi tiết hành vi vi phạm
status: Trạng thái xử lý báo cáo
created_at: Thời gian gửi báo cáo
36. Bảng AI_conversation
id (PK)
customer_id (FK)
title
created_at
updated_at
37. Bảng AI_message
id (PK)
conversation_id (FK)
sender_type: user, AI
message
send_time
38. Bảng farmer_follow
- customer_id 
- farmer_id 
- created_at
PRIMARY KEY(customer_id, farmer_id)
39. Bảng AI_product_description_history
- id (PK)
- farmer_id (FK)
- product_id (FK, nullable)
- product_name
- input_prompt
- generated_description
- generated_keywords
- generated_hashtags
- language
- created_at
40. Bảng AI_price_suggestion
- id (PK)
- farmer_id (FK)
- product_id (FK, nullable)
- product_name
- input_cost_price
- market_average_price
- suggested_price
- min_price
- max_price
- ai_reason
- created_at
41. Bảng AI_recommendation
- id (PK)
- customer_id (FK)
- product_id (FK)
- recommendation_score
- reason
- created_at
42. Bảng AI_search_history
- id (PK)
- customer_id (FK)
- prompt
- ai_response
- created_at
43. Bảng AI_content_moderation
- id (PK)
- product_id (FK)
- is_safe
- flagged_reason
- checked_at


