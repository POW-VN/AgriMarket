import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      setError("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
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
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    console.log("Google register clicked");
  };

  return (
    <div className="register-farmconnect">
      <div className="container">
        <div className="left-side-form">
          <div className="div">
            <div className="brand-header">
              <div className="div-2">
                <div className="text-wrapper">Join FarmConnect</div>
              </div>
              <div className="div-2">
                <p className="p">
                  Start your journey towards fresh, local agriculture.
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
                    <div className="text">Customer</div>
                  ) : (
                    <div className="div-wrapper">
                      <div className="text-2">Customer</div>
                    </div>
                  )}
                </div>
                <div 
                  className={role === 'farmer' ? 'tab' : 'tab-margin'} 
                  onClick={() => setRole('farmer')}
                  style={{ cursor: 'pointer' }}
                >
                  {role === 'farmer' ? (
                    <div className="text">Farmer</div>
                  ) : (
                    <div className="div-wrapper">
                      <div className="text-2">Farmer</div>
                    </div>
                  )}
                </div>
              </div>
              <form className="div-3" onSubmit={handleSubmit}>
                <div className="base-fields">
                  <div className="container-3">
                    <div className="div-2">
                      <div className="text-wrapper-2">Full Name</div>
                    </div>
                    <input 
                      className="input" 
                      type="text" 
                      placeholder="John Doe" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={{ padding: '0 16px', outline: 'none' }}
                    />
                  </div>
                  <div className="container-3">
                    <div className="div-2">
                      <div className="text-wrapper-2">Email address</div>
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
                      <div className="text-wrapper-2">Phone Number</div>
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
                      <div className="text-wrapper-2">Password</div>
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
                      <div className="text-wrapper-2">Confirm Password</div>
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
                      <span className="span">I agree to the </span>
                      <span className="text-wrapper-3">Terms of Service</span>
                      <span className="span"> and </span>
                      <span className="text-wrapper-3">Privacy Policy</span>
                    </p>
                  </div>
                </div>
                <button className="button" type="submit" disabled={loading}>
                  <div className="text-3">{loading ? "Registering..." : "Register Account"}</div>
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
                    <div className="text-4">Or continue with</div>
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
              <div className="text-6">Already have an account?</div>
              <Link to="/login" className="link-log-in-here">Log in here</Link>
            </div>
          </div>
        </div>
        <div className="right-side-imagery">
          <div className="glassmorphism">
            <div className="container-5">
              <img className="container-6" alt="Container" src={container} />
              <div className="heading">
                <div className="text-7">Growing Together</div>
              </div>
            </div>
            <div className="farmconnect-wrapper">
              <p className="farmconnect">
                &#34;FarmConnect transformed how we reach our local community.
                <br />
                We spend less time managing orders and more time focusing
                <br />
                on what we do best: growing fresh, healthy food.&#34;
              </p>
            </div>
            <div className="container-7">
              <p className="text-wrapper-4">
                — Sarah Jenkins, Sunny Valley Farms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFarmconnect;
