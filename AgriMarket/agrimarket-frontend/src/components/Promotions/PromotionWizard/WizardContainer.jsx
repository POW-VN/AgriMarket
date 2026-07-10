import React, { useState } from 'react';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Details from './Step2Details';
import Step3Products from './Step3Products';
import Step4Review from './Step4Review';
import { mockPromotions } from '../PromotionsMockData';

const WizardContainer = ({ role, onCancel, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Shared state for the wizard
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    maxUses: '',
    farmerId: '', // For admin
    visibility: 'show', // show, hide
    discountType: 'percent', // percent, amount, order, code
    discountVal: '',
    maxDiscount: '',
    minOrder: '',
    usageLimitPerPerson: '',
    budget: '',
    image: '', // added image field
    selectedProducts: [] // array of objects
  });

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const updateFormData = (newData) => {
    setFormData({ ...formData, ...newData });
  };

  const handleCreate = () => {
    // API call to create promotion would go here
    console.log("Creating promotion:", formData);
    
    // MOCK DATA FIX: Add to mock array to show in list immediately
    const newPromo = {
      id: Math.random(),
      title: formData.title,
      description: formData.description,
      discountType: formData.discountType,
      discountVal: formData.discountVal || 0,
      farmerName: formData.farmerId ? "Nông dân đã chọn" : "Toàn hệ thống",
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
      status: "active",
      productsCount: formData.selectedProducts?.length || 0,
      maxUses: formData.maxUses || 0,
      usedCount: 0,
      budget: formData.budget || 0,
      usedBudget: 0,
      revenueGenerated: 0,
      image: formData.image || "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=400",
      code: "NEW_" + Math.floor(Math.random() * 10000)
    };
    mockPromotions.unshift(newPromo);

    // Persist to localStorage so Homepage reads new promo immediately
    const existing = JSON.parse(localStorage.getItem('mockPromotions') || '[]');
    // Avoid duplicates: remove any with same id if re-creating
    const filtered = existing.filter(p => String(p.id) !== String(newPromo.id));
    localStorage.setItem('mockPromotions', JSON.stringify([newPromo, ...filtered]));

    onSuccess(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} updateFormData={updateFormData} role={role} />;
      case 2:
        return <Step2Details formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3Products formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4Review formData={formData} onEditStep={(step) => setCurrentStep(step)} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="spromo-breadcrumb">Khuyến mãi / <span>Tạo khuyến mãi mới</span></div>
      <h2 className="spromo-title" style={{ marginBottom: '4px' }}>Tạo khuyến mãi mới</h2>
      <p className="spromo-subtitle" style={{ marginBottom: '24px' }}>Tạo chương trình khuyến mãi mới cho {role === 'admin' ? 'nông dân trên hệ thống' : 'gian hàng của bạn'}.</p>

      {/* Stepper */}
      <div className="spromo-stepper">
        {/* Step 1 */}
        <div className={`step-item ${currentStep >= 1 ? (currentStep === 1 ? 'active' : 'completed') : ''}`}>
          <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
          <div className="step-label">Thông tin cơ bản</div>
        </div>
        
        {/* Step 2 */}
        <div className={`step-item ${currentStep >= 2 ? (currentStep === 2 ? 'active' : 'completed') : ''}`}>
          <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
          <div className="step-label">Chi tiết khuyến mãi</div>
        </div>

        {/* Step 3 */}
        <div className={`step-item ${currentStep >= 3 ? (currentStep === 3 ? 'active' : 'completed') : ''}`}>
          <div className="step-number">{currentStep > 3 ? '✓' : '3'}</div>
          <div className="step-label">Sản phẩm áp dụng</div>
        </div>

        {/* Step 4 */}
        <div className={`step-item ${currentStep >= 4 ? (currentStep === 4 ? 'active' : 'completed') : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Xem trước & Hoàn tất</div>
        </div>
        
        {/* Progress Line Background */}
        <div style={{ position: 'absolute', top: '50%', left: '40px', right: '150px', height: '2px', background: 'var(--spromo-border)', zIndex: 0, transform: 'translateY(-50%)' }}></div>
        {/* Progress Line Active (approximate logic for demo) */}
        <div style={{ position: 'absolute', top: '50%', left: '40px', width: `calc(${(currentStep - 1) * 32}% - 20px)`, maxWidth: 'calc(100% - 190px)', height: '2px', background: 'var(--spromo-primary)', zIndex: 0, transform: 'translateY(-50%)', transition: 'width 0.3s' }}></div>
      </div>

      <div className="wizard-layout">
        <div className="wizard-main">
          {renderStep()}

          <div className="wizard-footer">
            <button className="btn-spromo-secondary" onClick={currentStep === 1 ? onCancel : handlePrev}>
              {currentStep === 1 ? 'Hủy bỏ' : 'Quay lại'}
            </button>
            <button className="btn-spromo-primary" onClick={currentStep === 4 ? handleCreate : handleNext}>
              {currentStep === 4 ? 'Xác nhận & Tạo' : 'Tiếp tục'} {currentStep < 4 && <span style={{ marginLeft: '4px' }}>→</span>}
            </button>
          </div>
        </div>

        {/* The sidebar is part of step 1, 2, 3 so it's managed within those components or here. 
            Looking at the screenshot, Step 1 and 2 have the preview sidebar. Step 3 has selected products. Step 4 has none.
            We'll let each step component render its own right sidebar for maximum flexibility.
        */}
      </div>
    </div>
  );
};

export default WizardContainer;

