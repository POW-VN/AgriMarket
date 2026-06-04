import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import Footer from "../../components/common/Footer/Footer";
import "../Home/Home.css";
import "./PrivacyPolicy.css";
import NotificationBell from "../../components/common/NotificationBell/NotificationBell";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="privacy-page">
      {/* Header / Navbar (Consistent with Home) */}
      <header className="home-header">
        <div className="header-container">
          <div className="header-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="logo-tractor"
            >
              <circle cx="7" cy="18" r="2"></circle>
              <circle cx="18" cy="18" r="2"></circle>
              <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z"></path>
              <path d="M16 9h3l2 3v4"></path>
            </svg>
            <span className="logo-text">AgriMarket</span>
          </div>

          <nav className="header-nav">
            <Link to="/" className="nav-link">Trang chủ</Link>
            <Link to="/shop" className="nav-link">Cửa hàng</Link>
            <Link to="/farms" className="nav-link">Nông trại</Link>
            <Link to="/about" className="nav-link">Giới thiệu</Link>
          </nav>

          <div className="header-actions">
            {/* Search Icon */}
            <button className="icon-btn" aria-label="Tìm kiếm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* Cart Icon */}
            {user && user.role !== "farmer" && (
              <button className="icon-btn" aria-label="Giỏ hàng">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>
            )}

            {/* Bell Icon (Thông báo) */}
            {user && <NotificationBell user={user} />}

            {/* Profile & Auth Info */}
            {user ? (
              <div className="auth-profile-container">
                <div className="profile-indicator" onClick={() => navigate("/profile")} title="Xem hồ sơ">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="avatar-img" />
                  ) : (
                    <div className="avatar-fallback">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="profile-name">{user.fullName}</span>
                </div>
                <button className="btn-auth btn-logout" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="auth-profile-container">
                <button className="btn-auth btn-login" onClick={() => navigate("/login")}>
                  Đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="privacy-main">
        <div className="privacy-container">
          <div className="privacy-header-section">
            <span className="privacy-tag">🛡️ AN TOÀN & BẢO MẬT</span>
            <h1 className="privacy-title">Chính sách bảo mật</h1>
            <p className="privacy-updated">Cập nhật lần cuối: Ngày 05 tháng 06 năm 2026</p>
          </div>

          <div className="privacy-card">
            <p className="privacy-intro">
              Chào mừng bạn đến với **AgriMarket**. Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn và đảm bảo tính an toàn cho mọi giao dịch kết nối nông nghiệp. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu của bạn khi bạn sử dụng nền tảng của chúng tôi.
            </p>

            <hr className="privacy-divider" />

            <section className="privacy-section">
              <h2>1. Thu thập thông tin cá nhân</h2>
              <p>Chúng tôi thu thập các loại thông tin sau để cung cấp dịch vụ tốt nhất:</p>
              <ul>
                <li><strong>Thông tin tài khoản:</strong> Họ tên, địa chỉ email, số điện thoại, mật khẩu mã hóa khi bạn đăng ký tài khoản.</li>
                <li><strong>Thông tin hồ sơ bổ sung:</strong> Địa chỉ giao hàng, ảnh đại diện, thông tin nông trại (đối với tài khoản Nông dân).</li>
                <li><strong>Giấy chứng nhận sản phẩm:</strong> Tài liệu, ảnh chụp giấy chứng nhận nguồn gốc nông sản hữu cơ do Nông dân cung cấp.</li>
                <li><strong>Dữ liệu giao dịch:</strong> Lịch sử đơn hàng, thông tin thanh toán khi bạn thực hiện mua/bán nông sản.</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>2. Mục đích sử dụng thông tin</h2>
              <p>Thông tin cá nhân thu thập được sử dụng cho các mục đích sau:</p>
              <ul>
                <li>Vận hành, duy trì và nâng cấp các tính năng của nền tảng AgriMarket.</li>
                <li>Hỗ trợ kết nối mua bán trực tiếp giữa khách hàng và các chủ trang trại địa phương.</li>
                <li>Xử lý đơn hàng, điều phối giao nhận và xác minh nguồn gốc hữu cơ của sản phẩm.</li>
                <li>Gửi thông báo cập nhật về đơn hàng, tài khoản hoặc các khuyến cáo nông sản mùa vụ.</li>
                <li>Hỗ trợ kỹ thuật và giải quyết các khiếu nại, tranh chấp phát sinh.</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>3. Bảo mật và lưu trữ dữ liệu</h2>
              <p>
                AgriMarket áp dụng các biện pháp kỹ thuật và tổ chức nghiêm ngặt nhằm bảo vệ dữ liệu của bạn trước các hành vi truy cập trái phép, thay đổi, tiết lộ hoặc phá hủy dữ liệu:
              </p>
              <ul>
                <li>Mật khẩu của bạn được mã hóa hoàn toàn trước khi lưu trữ vào cơ sở dữ liệu.</li>
                <li>Hệ thống lưu trữ trên đám mây an toàn, bảo vệ bằng các lớp tường lửa và giao thức HTTPS mã hóa luồng truyền dữ liệu.</li>
                <li>Chúng tôi chỉ lưu trữ thông tin cá nhân của bạn trong thời gian tài khoản của bạn còn hoạt động hoặc khi cần thiết để thực hiện các nghĩa vụ pháp lý.</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>4. Chia sẻ thông tin với bên thứ ba</h2>
              <p>
                Chúng tôi tuyệt đối <strong>không bán, trao đổi hoặc cho thuê</strong> thông tin cá nhân của bạn cho bên thứ ba. Thông tin chỉ được chia sẻ trong các trường hợp giới hạn:
              </p>
              <ul>
                <li><strong>Đối tác vận chuyển:</strong> Chia sẻ tên, số điện thoại và địa chỉ giao hàng để thực hiện vận chuyển nông sản.</li>
                <li><strong>Theo yêu cầu pháp lý:</strong> Tiết lộ thông tin khi có yêu cầu hợp pháp từ các cơ quan quản lý nhà nước có thẩm quyền.</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>5. Quyền của người dùng</h2>
              <p>Bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình trên AgriMarket:</p>
              <ul>
                <li>Xem và tự do chỉnh sửa thông tin hồ sơ, ảnh đại diện, địa chỉ nông trại bất cứ lúc nào trong trang quản lý cá nhân.</li>
                <li>Yêu cầu khóa hoặc xóa vĩnh viễn tài khoản cùng toàn bộ dữ liệu giao dịch liên quan trên hệ thống thông qua tính năng "Xóa tài khoản".</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>6. Thay đổi điều khoản chính sách</h2>
              <p>
                Chúng tôi có thể cập nhật chính sách bảo mật này để phù hợp với những thay đổi trong dịch vụ hoặc quy định pháp luật. Khi có thay đổi, ngày cập nhật ở đầu trang sẽ được thay đổi tương ứng. Bạn nên thường xuyên kiểm tra trang này để cập nhật những quy định mới nhất.
              </p>
            </section>

            <section className="privacy-section contact-info">
              <h2>Liên hệ với chúng tôi</h2>
              <p>
                Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này hoặc các hoạt động bảo vệ dữ liệu của AgriMarket, vui lòng liên hệ ban quản trị qua:
              </p>
              <p>📧 Email: <strong>support@agrimarket.vn</strong> | 📞 Hotline: <strong>1900 6789</strong></p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
