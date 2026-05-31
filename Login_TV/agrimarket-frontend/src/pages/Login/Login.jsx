import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import googleLogo from "./google-logo.svg";
import icon from "./icon.svg";
import icon2 from "./icon-2.svg";
import image from "./image.svg";
import authService from "../../services/authService";
import "./Login.css";

export const LoginFarmconnect = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login({ email, password, role });
      console.log("Login successful:", response);
      // Example redirect on successful auth:
      // navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError("");
      try {
        const response = await authService.googleLogin({
          token: tokenResponse.access_token,
          role: role,
        });
        console.log("Google login successful:", response);
        // Example redirect on successful auth:
        // navigate("/dashboard");
      } catch (err) {
        setError(err.message || "Google login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
      setError("Google Login failed.");
    }
  });

  return (
    <div className="login-farmconnect">
      <div className="main-login-container">
        <div className="image-section-hidden">
          <div className="fresh-organic" />
          <div className="overlay-overlayblur" />
          <div className="container">
            <div className="div">
              <div className="cultivating-trust">
                Cultivating Trust, Delivering
                <br />
                Freshness.
              </div>
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
        <div className="form-section">
          <div className="container-2">
            <div className="brand-header">
              <div className="div">
                <div className="text-wrapper">FarmConnect</div>
              </div>
              <div className="div">
                <p className="p">Sign in to your account</p>
              </div>
            </div>
            {error && <div className="error-message" style={{ color: 'var(--error-color)', backgroundColor: '#ffebee', padding: '10px', borderRadius: '8px', width: '100%', marginBottom: '10px', border: '1px solid #ffcdd2' }}>{error}</div>}
            
            <div className="role-selection">
              <button 
                type="button" 
                className={role === "customer" ? "button" : "div-wrapper"}
                onClick={() => setRole("customer")}
              >
                <div className={role === "customer" ? "text" : "text-2"}>Customer</div>
              </button>
              <button 
                type="button" 
                className={role === "farmer" ? "button" : "div-wrapper"}
                onClick={() => setRole("farmer")}
              >
                <div className={role === "farmer" ? "text" : "text-2"}>Farmer</div>
              </button>
              {/* <button 
                type="button" 
                className={role === "admin" ? "button" : "button-2"}
                onClick={() => setRole("admin")}
              >
                <div className={role === "admin" ? "text" : "text-2"}>Admin</div>
              </button> */}
            </div>
            <div className="button-google-sign" onClick={handleGoogleLogin} style={{ cursor: "pointer" }}>
              <img className="google-logo" alt="Google logo" src={googleLogo} />
              <div className="text-3">Sign in with Google</div>
            </div>
            <div className="container-3">
              <div className="horizontal-divider" />
              <div className="text-wrapper-2">
                <p className="text-4">or sign in with email</p>
              </div>
              <div className="horizontal-divider" />
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="container-4">
                <div className="div">
                  <label className="label" htmlFor="input-1">
                    Email address
                  </label>
                </div>
                <div className="div">
                  <div className="input">
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
                  <div className="icon-wrapper">
                    <img className="icon" alt="Icon" src={icon} />
                  </div>
                </div>
              </div>
              <div className="container-4">
                <div className="div">
                  <label className="label" htmlFor="input-2">
                    Password
                  </label>
                </div>
                <div className="div">
                  <div className="container-wrapper">
                    <input
                      className="container-5"
                      id="input-2"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="icon-wrapper">
                    <img className="img" alt="Icon" src={image} />
                  </div>
                  <div className="button-toggle" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                    <div className="img-wrapper">
                      <img className="icon-2" alt="Icon" src={icon2} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="margin">
                <div className="container-6">
                  <div className="label-2" onClick={() => setRememberMe(!rememberMe)} style={{ cursor: "pointer" }}>
                    <div className="input-2" style={{ backgroundColor: rememberMe ? "var(--primary-color)" : "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "10px", fontWeight: "bold" }}>
                      {rememberMe && "✓"}
                    </div>
                    <div className="text-wrapper-2">
                      <div className="text-4">Remember me</div>
                    </div>
                  </div>
                  <div className="text-wrapper-2" onClick={() => console.log('Forgot password clicked')} style={{ cursor: 'pointer' }}>
                    <div className="text-5">Forgot password?</div>
                  </div>
                </div>
              </div>
              <div className="button-margin">
                <button className="button-3" type="submit" disabled={loading}>
                  <div className="text-6">{loading ? "Logging in..." : "Login"}</div>
                </button>
              </div>
            </form>
            <div className="paragraph">
              <div className="text-7">Don&#39;t have an account?</div>
              <Link to="/register" className="link-register-here">Register here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginFarmconnect;
