import React, { useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/common/Sidebar/AdminSidebar';
import authService from '../../../services/authService';
import '../AdminStyles.css';
import PromotionsMain from '../../../components/Promotions/PromotionsMain';

const AdminPromotions = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar activeItem="promotions" />
      <div className="admin-main-container">
        <header className="admin-header">
          <div className="admin-search-wrapper" style={{ visibility: 'hidden' }}>
            {/* Ẩn search bar cũ */}
          </div>
        </header>

        <main className="admin-page-body">
          <div className="admin-promotions-container">
            <PromotionsMain role="admin" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPromotions;
