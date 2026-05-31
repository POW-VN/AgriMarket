import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RoleCard.css";

export const RoleSelection = () => {
    // State để lưu trữ thẻ nào đang được chọn (customer hoặc farmer)
    const [selectedRole, setSelectedRole] = useState(null);

    // Khởi tạo hàm chuyển trang
    const navigate = useNavigate();

    // Hàm xử lý khi bấm nút Continue
    const handleContinue = () => {
        if (selectedRole === 'customer') {
            // Khách hàng -> Đi thẳng vào trang Home
            navigate("/home");
        } else if (selectedRole === 'farmer') {
            // Nông dân -> Đi vào trang khai báo Farm Details
            navigate("/farm-onboarding");
        }
    };      

    return (
        <div className="role-selection-page">
            {/* Vòng tròn trang trí mờ ở góc dưới bên trái */}
            <div className="background-decoration"></div>

            {/* Header */}
            <header className="role-header">
                <div className="logo-text">AgriMarket</div>
                <div className="help-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>
            </header>

            {/* Main Content */}
            <main className="role-main">
                <div className="role-titles">
                    <h1>Chào mừng đến với FarmConnect</h1>
                    <p>Chọn cách bạn muốn sử dụng nền tảng để bắt đầu hành trình nông nghiệp của mình.</p>
                </div>

                <div className="role-cards-container">
                    {/* Thẻ Customer */}
                    <div
                        className={`role-card ${selectedRole === 'customer' ? 'selected' : ''}`}
                        onClick={() => setSelectedRole('customer')}
                    >
                        <div className="selected-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div className="card-icon-wrapper">
                            <svg className="card-main-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                        </div>
                        <h2>Khách hàng</h2>
                        <p className="card-description">Tôi muốn tìm kiếm nông sản tươi sạch, hữu cơ và kết nối trực tiếp với người nông dân địa phương.</p>

                        <ul className="card-features">
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                Mua sắm nông sản hữu cơ theo mùa
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                Trò chuyện trực tiếp với nông dân
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="3" width="15" height="13" />
                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                    <circle cx="5.5" cy="18.5" r="2.5" />
                                    <circle cx="18.5" cy="18.5" r="2.5" />
                                </svg>
                                Theo dõi đơn giao hàng nông sản tươi
                            </li>
                        </ul>
                    </div>

                    {/* Thẻ Farmer */}
                    <div
                        className={`role-card ${selectedRole === 'farmer' ? 'selected' : ''}`}
                        onClick={() => setSelectedRole('farmer')}
                    >
                        <div className="selected-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div className="card-icon-wrapper">
                            <svg className="card-main-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="7" cy="15" r="4" />
                                <circle cx="17" cy="15" r="4" />
                                <path d="M11 11V6a2 2 0 0 1 2-2h5l3 4v7" />
                                <path d="M3 11h8" />
                                <path d="M11 15h2" />
                            </svg>
                        </div>
                        <h2>Nông dân</h2>
                        <p className="card-description">Tôi muốn bán sản phẩm của mình, quản lý kho hàng và phát triển mô hình trang trại số của mình.</p>

                        <ul className="card-features">
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                                Đăng bán nông sản hữu cơ của bạn
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                                Quản lý kho hàng trực tiếp
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                                Tiếp cận thông tin nhu cầu thị trường
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="role-actions">
                    <button className="btn-back">Quay lại</button>
                    <button
                        className={`btn-continue ${selectedRole ? 'active' : ''}`}
                        onClick={handleContinue}
                    >
                        Tiếp tục
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="role-footer">
                <div className="footer-brand">AgriMarket</div>
                <div className="footer-copyright">© 2026 AgriMarket. Tất cả các quyền được bảo lưu.</div>
                <div className="footer-links">
                    <a style={{cursor: 'pointer'}}>Chính sách bảo mật</a>
                    <a style={{cursor: 'pointer'}}>Điều khoản dịch vụ</a>
                    <a style={{cursor: 'pointer'}}>Trung tâm trợ giúp</a>
                    <a style={{cursor: 'pointer'}}>Liên hệ</a>
                </div>
            </footer>
        </div>
    );
};