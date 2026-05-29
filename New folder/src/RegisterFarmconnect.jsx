import React, { useState } from "react";

export const RegisterFarmconnect = ({ onNavigate }) => {
  const [role, setRole] = useState("customer"); // "customer" or "farmer"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) {
      alert("Vui lòng nhập đầy đủ tất cả các trường.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Mật khẩu và xác nhận mật khẩu không trùng khớp.");
      return;
    }
    if (!agreed) {
      alert("Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.");
      return;
    }

    // Success simulation
    alert(`Đăng ký tài khoản ${role === "farmer" ? "Nhà vườn" : "Khách hàng"} thành công! Vui lòng đăng nhập lại.`);
    onNavigate("login");
  };

  const handleGoogleRegister = () => {
    alert("Đang liên kết đăng ký tài khoản qua Google...");
    onNavigate("profile");
  };

  return (
    <div className="register-farmconnect">
      <div className="container">
        {/* Left Side: Registration Form */}
        <div className="left-side-form">
          <div className="div">
            <div className="brand-header">
              <div className="div-2">
                <h1 className="text-wrapper">Join FarmConnect</h1>
              </div>
              <div className="div-2">
                <p className="p">
                  Start your journey towards fresh, local agriculture.
                </p>
              </div>
            </div>

            <div className="div-3">
              <div className="container-2">
                {/* Customer vs Farmer tabs */}
                <div className="tablist-role">
                  <button
                    type="button"
                    className={`tab-btn ${role === "customer" ? "active" : ""}`}
                    onClick={() => setRole("customer")}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${role === "farmer" ? "active" : ""}`}
                    onClick={() => setRole("farmer")}
                  >
                    Farmer
                  </button>
                </div>

                <form onSubmit={handleRegister} className="div-3">
                  <div className="base-fields">
                    <div className="container-3">
                      <label className="text-wrapper-2" htmlFor="reg-name">Full Name</label>
                      <input
                        type="text"
                        id="reg-name"
                        className="input-field"
                        placeholder="Nguyễn Văn A"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="container-3">
                      <label className="text-wrapper-2" htmlFor="reg-email">Email address</label>
                      <input
                        type="email"
                        id="reg-email"
                        className="input-field"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="container-3">
                      <label className="text-wrapper-2" htmlFor="reg-phone">Phone Number</label>
                      <input
                        type="tel"
                        id="reg-phone"
                        className="input-field"
                        placeholder="0987654321"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="container-3">
                      <label className="text-wrapper-2" htmlFor="reg-pass">Password</label>
                      <input
                        type="password"
                        id="reg-pass"
                        className="input-field"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="container-3">
                      <label className="text-wrapper-2" htmlFor="reg-conf">Confirm Password</label>
                      <input
                        type="password"
                        id="reg-conf"
                        className="input-field"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Terms acceptance */}
                  <div className="container-4">
                    <input
                      type="checkbox"
                      id="reg-agreed"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <div className="label-margin">
                      <label className="label-i-agree-to-the" htmlFor="reg-agreed">
                        <span className="span">I agree to the </span>
                        <span className="text-wrapper-3" onClick={(e) => { e.preventDefault(); alert("Điều khoản dịch vụ của chúng tôi..."); }}>Terms of Service</span>
                        <span className="span"> and </span>
                        <span className="text-wrapper-3" onClick={(e) => { e.preventDefault(); alert("Chính sách bảo mật của chúng tôi..."); }}>Privacy Policy</span>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="button">
                    Register Account
                  </button>
                </form>
              </div>

              {/* Divider */}
              <div className="div-3">
                <div className="or-divider">
                  <span>Or continue with</span>
                </div>
                
                {/* Google Sign In/Up */}
                <button type="button" className="button-2" onClick={handleGoogleRegister}>
                  <svg style={{ width: "20px", height: "20px" }} viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.29 1.93 15.53.5 12.24.5c-6.354 0-11.5 5.146-11.5 11.5s5.146 11.5 11.5 11.5c6.63 0 11.03-4.66 11.03-11.2 0-.756-.08-1.336-.18-1.815H12.24z"
                    />
                  </svg>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#191c1c" }}>Sign up with Google</span>
                </button>
              </div>

              {/* Redirect to Login */}
              <div className="paragraph">
                <span className="text-6">Already have an account?</span>
                <span className="link-log-in-here" onClick={() => onNavigate("login")}>
                  Log in here
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Image and Glassmorphism Panel */}
        <div className="right-side-imagery">
          <div className="glassmorphism">
            <h3 className="glassmorphism-title">Sustainable Stewardship</h3>
            <p className="glassmorphism-text">
              By joining FarmConnect, you support local growers, reduce carbon emissions,
              and gain access to the freshest, seasonal harvest directly from nearby organic farms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
