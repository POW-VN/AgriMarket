import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './ForgotPassword.css';

// IMAGE
import bannerImage from '../../assets/images/forgot-password-banner.png';

// ICONS
import mailIcon from '../../assets/icons/mail-icon.svg';
import arrowLeftIcon from '../../assets/icons/arrow-left.svg';
import securityLockIcon from '../../assets/icons/security-lock.svg';

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (value) => {
        if (!value) return 'Vui lòng nhập email.';

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Vui lòng nhập địa chỉ email hợp lệ.';
        }

        return '';
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);

        if (emailError) {
            setEmailError('');
        }
    };

    const handleSendOTP = (e) => {
        e.preventDefault();

        const error = validateEmail(email);

        if (error) {
            setEmailError(error);
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            navigate('/reset-password');
        }, 1500);
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">

                {/* Phía Trái: Banner */}
                <div className="forgot-password-card__left">
                    <img
                        src={bannerImage}
                        alt="Harvest Banner"
                        className="banner-image"
                    />
                    <div className="banner-content">
                        <h2 className="banner-title">Bảo Vệ Vụ Mùa Của Bạn</h2>
                        <p className="banner-text">
                            Bảo vệ dữ liệu nông nghiệp của bạn với các giao thức bảo mật cấp doanh nghiệp.
                        </p>
                    </div>
                </div>

                {/* Phía Phải: Form */}
                <div className="forgot-password-card__right">
                    <div className="forgot-password__header">
                        <h2 className="brand-logo">FarmConnect</h2>
                    </div>

                    <div className="forgot-password__body">
                        <h1 className="forgot-password__title">
                            Quên Mật Khẩu
                        </h1>

                        <p className="forgot-password__description">
                            Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một mã xác minh để đặt lại mật khẩu.
                        </p>

                        <form
                            className="forgot-password__form"
                            onSubmit={handleSendOTP}
                        >
                            <div className="forgot-password__input-wrapper">
                                <label className="forgot-password__label">Địa chỉ Email</label>

                                <div className="forgot-password__input-group">
                                    <img
                                        src={mailIcon}
                                        alt="Mail"
                                        className="forgot-password__input-icon"
                                    />

                                    <input
                                        type="email"
                                        placeholder="nongdan@example.com"
                                        value={email}
                                        onChange={handleEmailChange}
                                        className="forgot-password__input"
                                    />
                                </div>

                                {emailError && (
                                    <p className="forgot-password__error">
                                        {emailError}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="forgot-password__button"
                            >
                                {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                            </button>
                        </form>

                        <div className="forgot-password__back">
                            <Link
                                to="/login"
                                className="forgot-password__back-link"
                            >
                                <img
                                    src={arrowLeftIcon}
                                    alt="Back"
                                />
                                <span>Quay lại Đăng nhập</span>
                            </Link>
                        </div>

                        <div className="forgot-password__security">
                            <img
                                src={securityLockIcon}
                                alt="Security"
                            />
                            <p>
                                Vì sự an toàn của bạn, liên kết đặt lại mật khẩu sẽ hết hạn sau một thời gian nhất định.
                                Nếu bạn không nhận được email, vui lòng kiểm tra hộp thư rác.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;