import React, { useState } from "react";

export const LoginFarmconnect = ({ onNavigate }) => {
  const [role, setRole] = useState("customer"); // Default to customer
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }
    // Báo đăng nhập thành công trực tiếp
    alert("Đăng nhập tài khoản FarmConnect thành công!");
  };

  const handleGoogleSignIn = () => {
    // Client ID mẫu dùng cho giao diện thử nghiệm (người dùng có thể thay thế bằng client ID thật của mình)
    const clientId = "784768086492-e08i5tergvq01ut5u0oivvsoo70st9q0.apps.googleusercontent.com";
    const redirectUri = window.location.origin; // Quay lại trang web React hiện tại
    const scope = "email profile openid";
    const responseType = "token"; // Lấy access_token qua URL hash fragment

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${responseType}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `prompt=select_account`; // Yêu cầu người dùng chọn tài khoản Google đang đăng nhập trên máy

    window.location.href = googleAuthUrl;
  };

  return (
    <div className="login-farmconnect">
      <div className="main-login-container">
        {/* Left Side: Imagery Panel */}
        <div className="image-section-hidden">
          <div className="fresh-organic" />
          <div className="overlay-overlayblur" />
          <div className="container">
            <div className="div">
              <h2 className="cultivating-trust">
                Cultivating Trust,
                <br />
                Delivering Freshness.
              </h2>
            </div>
            <div className="join-the-digital-wrapper">
              <p className="join-the-digital">
                Join the digital stewardship revolution connecting dedicated
                <br />
                farmers with mindful consumers.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="form-section">
          <div className="container-2">
            <div className="brand-header">
              <div className="div">
                <h1 className="text-wrapper">FarmConnect</h1>
              </div>
              <div className="div">
                <p className="p">Sign in to your account</p>
              </div>
            </div>

            {/* Role Selection Tabs */}
            <div className="role-selection">
              <button
                type="button"
                className={role === "customer" ? "active" : ""}
                onClick={() => setRole("customer")}
              >
                Customer
              </button>
              <button
                type="button"
                className={role === "farmer" ? "active" : ""}
                onClick={() => setRole("farmer")}
              >
                Farmer
              </button>
            </div>

            {/* Google Sign In */}
            <button type="button" className="button-google-sign" onClick={handleGoogleSignIn}>
              <svg className="google-logo" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.29 1.93 15.53.5 12.24.5c-6.354 0-11.5 5.146-11.5 11.5s5.146 11.5 11.5 11.5c6.63 0 11.03-4.66 11.03-11.2 0-.756-.08-1.336-.18-1.815H12.24z"
                />
              </svg>
              <span className="text-3">Sign in with Google</span>
            </button>

            {/* Divider */}
            <div className="container-3">
              <div className="horizontal-divider" />
              <div className="text-wrapper-2">
                <span className="text-4">or sign in with email</span>
              </div>
              <div className="horizontal-divider" />
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="container-4">
                <label className="label" htmlFor="input-1">
                  Email address
                </label>
                <div className="input-wrapper">
                  <svg className="field-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    className="container-5"
                    id="input-1"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="container-4">
                <label className="label" htmlFor="input-2">
                  Password
                </label>
                <div className="input-wrapper">
                  <svg className="field-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    className="container-5"
                    id="input-2"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="button-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="margin">
                <div className="container-6">
                  <label className="label-2">
                    <input type="checkbox" defaultChecked />
                    <span>Remember me</span>
                  </label>
                </div>
              </div>

              {/* Login Submit Button */}
              <button type="submit" className="button-3">
                Login
              </button>
            </form>

            {/* Footer Navigation */}
            <div className="paragraph">
              <span className="text-7">Don't have an account?</span>
              <span className="link-register-here" onClick={() => onNavigate("register")}>
                Register here
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
