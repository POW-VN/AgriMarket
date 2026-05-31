import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import container from "./container.svg";
import googleLogo from "./google-logo.svg";
import authService from "../../services/authService";
import "./Register.css";

export const RegisterFarmconnect = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!agreeTerms) {
      setError("Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        fullName,
        email,
        phoneNumber,
        password,
        role
      });
      console.log("Registration successful:", response);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError("");
      try {
        const response = await authService.googleLogin({
          token: tokenResponse.access_token,
          role: "",
        });
        if (response?.newUser || response?.isNewUser) {
          navigate("/role", { state: { googleAccessToken: tokenResponse.access_token } });
        } else {
          console.log("Google login/register successful:", response);
          navigate("/profile");
        }
      } catch (err) {
        setError(err.message || "Đăng ký bằng Google thất bại. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Register Error:", error);
      setError("Đăng ký bằng Google thất bại.");
    }
  });

  return (
    <div className="register-farmconnect">
      <div className="container">
        <div className="left-side-form">
          <div className="div">
            <div className="brand-header">
              <div className="div-2">
                <div className="text-wrapper">Tham gia FarmConnect</div>
              </div>
              <div className="div-2">
                <p className="p">
                  Bắt đầu hành trình hướng tới nông nghiệp sạch, địa phương.
                </p>
              </div>
            </div>
            {error && (
              <div className="error-message" style={{ color: 'var(--error-color)', backgroundColor: '#ffebee', padding: '10px', borderRadius: '8px', width: '100%', marginBottom: '10px', border: '1px solid #ffcdd2', fontSize: '14px' }}>
                {error}
              </div>
            )}
            <div className="container-2">
              <div className="tablist-role">
                <div 
                  className={role === 'customer' ? 'tab' : 'tab-margin'} 
                  onClick={() => setRole('customer')}
                  style={{ cursor: 'pointer' }}
                >
                  {role === 'customer' ? (
                    <div className="text">Khách hàng</div>
                  ) : (
                    <div className="div-wrapper">
                      <div className="text-2">Khách hàng</div>
                    </div>
                  )}
                </div>
                <div 
                  className={role === 'farmer' ? 'tab' : 'tab-margin'} 
                  onClick={() => setRole('farmer')}
                  style={{ cursor: 'pointer' }}
                >
                  {role === 'farmer' ? (
                    <div className="text">Nông dân</div>
                  ) : (
                    <div className="div-wrapper">
                      <div className="text-2">Nông dân</div>
                    </div>
                  )}
                </div>
              </div>
              <form className="div-3" onSubmit={handleSubmit}>
                <div className="base-fields">
                  <div className="container-3">
                    <div className="div-2">
                      <div className="text-wrapper-2">Họ và tên</div>
                    </div>
                    <input 
                      className="input" 
                      type="text" 
                      placeholder="Nguyễn Văn A" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={{ padding: '0 16px', outline: 'none' }}
                    />
                  </div>
                  <div className="container-3">
                    <div className="div-2">
                      <div className="text-wrapper-2">Địa chỉ Email</div>
                    </div>
                    <input 
                      className="input" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ padding: '0 16px', outline: 'none' }}
                    />
                  </div>
                  <div className="container-3">
                    <div className="div-2">
                      <div className="text-wrapper-2">Số điện thoại</div>
                    </div>
                    <input 
                      className="input" 
                      type="tel" 
                      placeholder="0123456789" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      style={{ padding: '0 16px', outline: 'none' }}
                    />
                  </div>
                  <div className="container-3">
                    <div className="div-2">
                      <div className="text-wrapper-2">Mật khẩu</div>
                    </div>
                    <input 
                      className="input" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ padding: '0 16px', outline: 'none' }}
                    />
                  </div>
                  <div className="container-3">
                    <div className="div-2">
                      <div className="text-wrapper-2">Xác nhận mật khẩu</div>
                    </div>
                    <input 
                      className="input" 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ padding: '0 16px', outline: 'none' }}
                    />
                  </div>
                </div>
                <div className="container-4" onClick={() => setAgreeTerms(!agreeTerms)} style={{ cursor: 'pointer' }}>
                  <div className="input-2" style={{ backgroundColor: agreeTerms ? 'var(--primary-color)' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}>
                    {agreeTerms && '✓'}
                  </div>
                  <div className="label-margin">
                    <p className="label-i-agree-to-the">
                      <span className="span">Tôi đồng ý với </span>
                      <span className="text-wrapper-3">Điều khoản dịch vụ</span>
                      <span className="span"> và </span>
                      <span className="text-wrapper-3">Chính sách bảo mật</span>
                    </p>
                  </div>
                </div>
                <button className="button" type="submit" disabled={loading}>
                  <div className="text-3">{loading ? "Đang đăng ký..." : "Đăng ký tài khoản"}</div>
                </button>
              </form>
            </div>
            <div className="div-3">
              <div className="div-2" style={{ position: 'relative', height: '24px' }}>
                <div className="horizontal-divider-wrapper">
                  <div className="horizontal-divider" />
                </div>
                <div className="background-wrapper">
                  <div className="background">
                    <div className="text-4">Hoặc tiếp tục bằng</div>
                  </div>
                </div>
              </div>
              <div className="button-2" onClick={handleGoogleRegister} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <img className="google-logo" alt="Google logo" src={googleLogo} style={{ width: '20px', height: '20px' }} />
                <div className="text-wrapper-2">
                  <div className="text-4" style={{ fontSize: '14px', fontWeight: 600 }}>Google</div>
                </div>
              </div>
            </div>
            <div className="paragraph">
              <div className="text-6">Đã có tài khoản?</div>
              <Link to="/login" className="link-log-in-here">Đăng nhập tại đây</Link>
            </div>
          </div>
        </div>
        <div className="right-side-imagery">
        </div>
      </div>
    </div>
  );
};

export default RegisterFarmconnect;
