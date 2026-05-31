import { useNavigate } from "react-router-dom";
import "./FarmDetails.css";

export const FarmDetails = () => {
    const navigate = useNavigate();

    return (
        <div className="farm-details-page">
            <header className="onboarding-header">
                <div className="logo">AgriMarket</div>
                <div className="help-circle">?</div>
            </header>

            <main className="farm-details-container">
                {/* CỘT TRÁI - HERO IMAGE */}
                <div className="farm-hero-side">
                    <div className="hero-card">
                        <div className="hero-image-placeholder">
                            <div className="hero-overlay-text">
                                <h2>Đồng hành cùng chúng tôi</h2>
                                <p>Tham gia cộng đồng các nhà sản xuất tận tâm và kết nối trực tiếp với thị trường đô thị.</p>
                            </div>
                        </div>
                        <div className="trust-card">
                            <div className="trust-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#012d1d" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div className="trust-content">
                                <h4>Uy tín là cốt lõi</h4>
                                <p>Mọi hồ sơ đều trải qua quá trình xác minh để đảm bảo chất lượng dịch vụ tốt nhất cho khách hàng.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI - FORM NỘI DUNG */}
                <div className="farm-form-side">
                    <div className="form-wrapper">
                        <h1>Thông tin trang trại</h1>
                        <p className="subtitle">Chia sẻ thêm về trang trại của bạn. Thông tin này sẽ hiển thị công khai với khách hàng.</p>

                        <div className="input-group">
                            <label>Tên trang trại</label>
                            <input type="text" placeholder="Ví dụ: Trang trại Vườn Xanh" />
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Quận/Huyện</label>
                                <input type="text" placeholder="Quận/Huyện" />
                            </div>
                            <div className="input-group">
                                <label>Tỉnh/Thành phố</label>
                                <input type="text" placeholder="Tỉnh/Thành phố" />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Mô tả trang trại</label>
                            <textarea placeholder="Chia sẻ câu chuyện, phương pháp canh tác và giá trị của bạn..."></textarea>
                        </div>

                        <div className="upload-box">
                            <div className="upload-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#317a55" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                            </div>
                            <div className="upload-text">
                                <strong>Tải lên hình ảnh trang trại</strong>
                                <p>Hình ảnh chất lượng cao giúp tăng hiệu quả hiển thị tốt hơn 40%</p>
                            </div>
                        </div>

                        <button className="btn-continue-farm" onClick={() => navigate("/home")}>
                            Tiếp tục <span>→</span>
                        </button>
                        <button className="btn-skip" onClick={() => navigate("/home")}>Để sau</button>
                    </div>
                </div>
            </main>

            <footer className="onboarding-footer">
                <div className="footer-left">AgriMarket</div>
                <div className="footer-right">
                    <span>Chính sách bảo mật</span>
                    <span>Điều khoản dịch vụ</span>
                    <span>Trung tâm trợ giúp</span>
                    <span>Liên hệ</span>
                    <span className="copyright">© 2024 AgriMarket Digital Stewardship.</span>
                </div>
            </footer>
        </div>
    );
};