import React from 'react';
import PreviewSidebar from './PreviewSidebar';
import { mockFarmers } from '../PromotionsMockData';

const Step1BasicInfo = ({ formData, updateFormData, role }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
      <div>
        <div className="spromo-card">
          <h3 className="spromo-card-title">Thông tin cơ bản</h3>
          
          <div className="form-group">
            <label>Tên chương trình *</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Nhập tên chương trình khuyến mãi" 
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                maxLength={100}
              />
              <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '12px', color: 'var(--spromo-text-muted)' }}>
                {formData.title.length}/100
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Thời gian áp dụng *</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="date" 
                value={formData.startDate}
                onChange={(e) => updateFormData({ startDate: e.target.value })}
              />
              <span>-</span>
              <input 
                type="date" 
                value={formData.endDate}
                onChange={(e) => updateFormData({ endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả chương trình</label>
            <div style={{ position: 'relative' }}>
              <textarea 
                rows="3" 
                placeholder="Nhập mô tả ngắn gọn về chương trình (không bắt buộc)"
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                maxLength={255}
              ></textarea>
              <span style={{ position: 'absolute', right: '12px', bottom: '12px', fontSize: '12px', color: 'var(--spromo-text-muted)' }}>
                {formData.description.length}/255
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Ảnh chương trình (Tùy chọn)</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <input 
                type="file" 
                id="promo-image-upload" 
                accept="image/*" 
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const imageUrl = URL.createObjectURL(file);
                    updateFormData({ image: imageUrl });
                  }
                }}
              />
              <label 
                htmlFor="promo-image-upload" 
                className="btn-spromo-secondary" 
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Tải ảnh lên
              </label>
              {formData.image && <span style={{ fontSize: '13px', color: 'var(--spromo-primary)', fontWeight: 500 }}>Đã tải ảnh thành công</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Tên nông dân {role === 'admin' && '*'}</label>
              {role === 'admin' ? (
                <div>
                  <input 
                    type="text"
                    list="farmer-list" 
                    placeholder="Nhập tên hoặc chọn nông dân" 
                    value={
                      formData.farmerSearchText !== undefined 
                        ? formData.farmerSearchText 
                        : (mockFarmers.find(f => f.id == formData.farmerId)?.name || '')
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      const selectedFarmer = mockFarmers.find(f => f.name === val);
                      if (selectedFarmer) {
                        updateFormData({ farmerId: selectedFarmer.id, farmerSearchText: val });
                      } else {
                        updateFormData({ farmerId: '', farmerSearchText: val });
                      }
                    }}
                  />
                  <datalist id="farmer-list">
                    {mockFarmers.map(farmer => (
                      <option key={farmer.id} value={farmer.name} />
                    ))}
                  </datalist>
                </div>
              ) : (
                <input type="text" value="Gian hàng của tôi" disabled />
              )}
            </div>
            
            <div className="form-group">
              <label>Số lượng sử dụng tối đa (tùy chọn)</label>
              <input 
                type="number" 
                placeholder="Nhập số lượt sử dụng tối đa" 
                value={formData.maxUses}
                onChange={(e) => updateFormData({ maxUses: e.target.value })}
              />
              <span style={{ fontSize: '12px', color: 'var(--spromo-text-muted)' }}>Để trống nếu không giới hạn</span>
            </div>
          </div>


        </div>

        <div className="spromo-card">
          <h3 className="spromo-card-title">Loại khuyến mãi</h3>
          <p style={{ fontSize: '14px', color: 'var(--spromo-text-muted)', marginBottom: '16px' }}>Chọn hình thức giảm giá cho chương trình</p>
          
          <div className="radio-card-grid">
            {/* Percent */}
            <div 
              className={`radio-card ${formData.discountType === 'percent' ? 'selected' : ''}`}
              onClick={() => updateFormData({ discountType: 'percent' })}
            >
              <div className="radio-card-header">
                <span className="icon">%</span> Giảm theo %
              </div>
              <div className="radio-card-desc">
                Giảm giá theo phần trăm<br/>Ví dụ: Giảm 15%
              </div>
            </div>

            {/* Amount */}
            <div 
              className={`radio-card ${formData.discountType === 'amount' ? 'selected' : ''}`}
              onClick={() => updateFormData({ discountType: 'amount' })}
            >
              <div className="radio-card-header">
                <span className="icon">$</span> Giảm theo số tiền
              </div>
              <div className="radio-card-desc">
                Giảm giá theo số tiền cố định<br/>Ví dụ: Giảm 20.000đ
              </div>
            </div>

            {/* Order */}
            <div 
              className={`radio-card ${formData.discountType === 'order' ? 'selected' : ''}`}
              onClick={() => updateFormData({ discountType: 'order' })}
            >
              <div className="radio-card-header">
                <span className="icon">🛒</span> Giảm đơn hàng
              </div>
              <div className="radio-card-desc">
                Giảm giá cho đơn hàng<br/>Ví dụ: Giảm 30.000đ cho đơn từ 200.000đ
              </div>
            </div>

            {/* Code */}
            <div 
              className={`radio-card ${formData.discountType === 'code' ? 'selected' : ''}`}
              onClick={() => updateFormData({ discountType: 'code' })}
            >
              <div className="radio-card-header">
                <span className="icon">🎟️</span> Mã giảm giá
              </div>
              <div className="radio-card-desc">
                Tạo mã giảm giá cho khách hàng<br/>Ví dụ: FREESHIP
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <PreviewSidebar formData={formData} />
      </div>
    </div>
  );
};

export default Step1BasicInfo;

