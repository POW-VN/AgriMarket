const fs = require('fs');

const farmerJsx = fs.readFileSync('c:/Users/HUNG/.gemini/antigravity/AgriMarket/AgriMarket/agrimarket-frontend/src/pages/Farmer/FarmerPromotions/FarmerPromotions.jsx', 'utf8');
const farmerCss = fs.readFileSync('c:/Users/HUNG/.gemini/antigravity/AgriMarket/AgriMarket/agrimarket-frontend/src/pages/Farmer/FarmerPromotions/FarmerPromotions.css', 'utf8');

let adminJsx = farmerJsx;
adminJsx = adminJsx.replace(/FarmerPromotions/g, 'AdminPromotions');
adminJsx = adminJsx.replace(/FarmerSidebar/g, 'AdminSidebar');
adminJsx = adminJsx.replace(/fp-/g, 'admin-promo-');
adminJsx = adminJsx.replace(/Hồ sơ cá nhân/g, 'Quản trị viên');
adminJsx = adminJsx.replace(/Quản lý các chương trình khuyến mãi và mã giảm giá để thúc đẩy doanh số./g, 'Quản lý các chương trình khuyến mãi cấp hệ thống và toàn sàn.');
adminJsx = adminJsx.replace(/Tạo và quản lý các chương trình giảm giá cho nông sản của bạn./g, 'Tạo và quản lý các chương trình khuyến mãi chung cho toàn hệ thống.');
adminJsx = adminJsx.replace(/Cà chua hữu cơ - Giảm 15%/g, 'Giảm 10% Toàn Sàn Tháng 7');
adminJsx = adminJsx.replace(/Dưa leo siêu sale/g, 'Freeship đơn từ 200k');

adminJsx = adminJsx.replace(/'\.\/FarmerPromotions\.css'/g, '\'./AdminPromotions.css\'');
adminJsx = adminJsx.replace(/'\.\.\/\.\.\/components\/common\/Sidebar\/AdminSidebar'/g, '\'../../../components/common/Sidebar/AdminSidebar\'');
adminJsx = adminJsx.replace(/import AdminSidebar from '\.\.\/\.\.\/\.\.\/components\/common\/Sidebar\/FarmerSidebar';/, "import AdminSidebar from '../../../components/common/Sidebar/AdminSidebar';");

if(!adminJsx.includes('AdminStyles.css')) {
  adminJsx = adminJsx.replace(/import '\.\/AdminPromotions\.css';/, "import '../AdminStyles.css';\nimport './AdminPromotions.css';");
}

fs.writeFileSync('c:/Users/HUNG/.gemini/antigravity/AgriMarket/AgriMarket/agrimarket-frontend/src/pages/Admin/Promotions/AdminPromotions.jsx', adminJsx);

let adminCss = farmerCss;
adminCss = adminCss.replace(/fp-/g, 'admin-promo-');
adminCss = adminCss.replace(/--fp-green/g, '--admin-primary');
adminCss = adminCss.replace(/--fp-green-light/g, '--admin-primary-light');
adminCss = adminCss.replace(/--fp-green-dark/g, '--admin-primary-hover');
adminCss = adminCss.replace(/--fp-bg/g, '--admin-bg');
adminCss = adminCss.replace(/--fp-card-bg/g, '--admin-card-bg');
adminCss = adminCss.replace(/--fp-border/g, '--admin-border');
adminCss = adminCss.replace(/--fp-border-dark/g, '#e2e8f0');
adminCss = adminCss.replace(/--fp-text-main/g, '--admin-text-main');
adminCss = adminCss.replace(/--fp-text-muted/g, '--admin-text-muted');
adminCss = adminCss.replace(/--fp-text-light/g, '#94a3b8');
adminCss = adminCss.replace(/--fp-red/g, '#dc2626');
adminCss = adminCss.replace(/--fp-red-light/g, '#fef2f2');
adminCss = adminCss.replace(/--fp-orange/g, '#f59e0b');
adminCss = adminCss.replace(/--fp-orange-light/g, '#fffbeb');
adminCss = adminCss.replace(/--fp-gray/g, '#f1f5f9');
adminCss = adminCss.replace(/--fp-gray-text/g, '#475569');

fs.writeFileSync('c:/Users/HUNG/.gemini/antigravity/AgriMarket/AgriMarket/agrimarket-frontend/src/pages/Admin/Promotions/AdminPromotions.css', adminCss);

console.log('Done!');
