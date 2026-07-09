const fs = require('fs');
const path = 'c:/Users/HUNG/.gemini/antigravity/AgriMarket/AgriMarket/agrimarket-frontend/src/pages/Admin/Promotions/AdminPromotions.jsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'return (\n    <div className="admin-promo-page-wrapper">',
  'return (\n    <div className="admin-layout">\n      <AdminSidebar />\n      <div className="admin-content admin-promo-page-wrapper">'
);

code = code.replace(
  '    </div>\n  );\n};',
  '      </div>\n    </div>\n  );\n};'
);

if (!code.includes('import AdminSidebar')) {
  code = code.replace(
    "import { useNavigate } from 'react-router-dom';",
    "import { useNavigate } from 'react-router-dom';\nimport AdminSidebar from '../../../components/common/Sidebar/AdminSidebar';"
  );
}

fs.writeFileSync(path, code);
console.log('Done script2');
