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
                    <h1>Welcome to FarmConnect</h1>
                    <p>Choose how you want to use the platform to get started on your agricultural journey.</p>
                </div>

                <div className="role-cards-container">
                    {/* Thẻ Customer */}
                    <div
                        className={`role-card ${selectedRole === 'customer' ? 'selected' : ''}`}
                        onClick={() => setSelectedRole('customer')}
                    >
                        <div className="card-icon-wrapper">
                            <svg className="card-main-icon" viewBox="0 0 24 24" fill="none" stroke="#012d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                        </div>
                        <h2>Customer</h2>
                        <p className="card-description">I want to discover fresh, local organic products and connect directly with local farmers.</p>

                        <ul className="card-features">
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#012d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                Shop seasonal organic produce
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#012d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                Chat with farmers directly
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#012d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="3" width="15" height="13" />
                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                    <circle cx="5.5" cy="18.5" r="2.5" />
                                    <circle cx="18.5" cy="18.5" r="2.5" />
                                </svg>
                                Track your fresh deliveries
                            </li>
                        </ul>
                    </div>

                    {/* Thẻ Farmer */}
                    <div
                        className={`role-card ${selectedRole === 'farmer' ? 'selected' : ''}`}
                        onClick={() => setSelectedRole('farmer')}
                    >
                        <div className="card-icon-wrapper">
                            <svg className="card-main-icon" viewBox="0 0 24 24" fill="none" stroke="#012d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="7" cy="15" r="4" />
                                <circle cx="17" cy="15" r="4" />
                                <path d="M11 11V6a2 2 0 0 1 2-2h5l3 4v7" />
                                <path d="M3 11h8" />
                                <path d="M11 15h2" />
                            </svg>
                        </div>
                        <h2>Farmer</h2>
                        <p className="card-description">I want to sell my products, manage my inventory, and grow my digital farm stewardship.</p>

                        <ul className="card-features">
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#012d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                                List your organic harvests
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#012d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                                Manage live inventory
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#012d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                                Access market demand insights
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="role-actions">
                    <button className="btn-back">Back</button>
                    <button
                        className={`btn-continue ${selectedRole ? 'active' : ''}`}
                        onClick={handleContinue}
                    >
                        Continue
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="role-footer">
                <div className="footer-brand">AgriMarket</div>
                <div className="footer-copyright">© 2026 AgriMarket Digital Stewardship. All rights reserved.</div>
                <div className="footer-links">
                    <a style={{cursor: 'pointer'}}>Privacy Policy</a>
                    <a style={{cursor: 'pointer'}}>Terms of Service</a>
                    <a style={{cursor: 'pointer'}}>Help Center</a>
                    <a style={{cursor: 'pointer'}}>Contact Us</a>
                </div>
            </footer>
        </div>
    );
};