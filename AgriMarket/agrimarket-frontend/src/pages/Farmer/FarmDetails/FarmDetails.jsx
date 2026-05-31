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
                                <h2>Grow With Us</h2>
                                <p>Join a community of dedicated producers and connect directly with urban markets.</p>
                            </div>
                        </div>
                        <div className="trust-card">
                            <div className="trust-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#012d1d" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div className="trust-content">
                                <h4>Trust Is Our Core</h4>
                                <p>Every profile undergoes a verification process to ensure the highest quality of stewardship for our customers.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI - FORM NỘI DUNG */}
                <div className="farm-form-side">
                    <div className="form-wrapper">
                        <h1>Farm Details</h1>
                        <p className="subtitle">Tell us more about your stewardship. This information will be visible to your customers.</p>

                        <div className="input-group">
                            <label>Farm Name</label>
                            <input type="text" placeholder="e.g. Whispering Willow Acres" />
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>City</label>
                                <input type="text" placeholder="City" />
                            </div>
                            <div className="input-group">
                                <label>State/Province</label>
                                <input type="text" placeholder="State" />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Farm Description</label>
                            <textarea placeholder="Share your story, farming methods, and values..."></textarea>
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
                                <strong>Upload Farm Image</strong>
                                <p>High-res photos perform 40% better</p>
                            </div>
                        </div>

                        <button className="btn-continue-farm" onClick={() => navigate("/home")}>
                            Continue <span>→</span>
                        </button>
                        <button className="btn-skip" onClick={() => navigate("/home")}>Skip for now</button>
                    </div>
                </div>
            </main>

            <footer className="onboarding-footer">
                <div className="footer-left">AgriMarket</div>
                <div className="footer-right">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                    <span>Help Center</span>
                    <span>Contact Us</span>
                    <span className="copyright">© 2024 AgriMarket Digital Stewardship.</span>
                </div>
            </footer>
        </div>
    );
};