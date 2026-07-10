import React, { useMemo, useState } from "react";
import {
    Bell,
    Search,
    Download,
    DollarSign,
    Check,
    AlertCircle,
    CreditCard,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import AdminSidebar from "../../../components/common/Sidebar/AdminSidebar";
import "../AdminStyles.css";
import "./AdminTransactions.css";

/*
  Trang quản lý giao dịch dành cho Admin.

  DATABASE LIÊN QUAN:
  - payment:
    id, order_group_id, payment_method, transaction_code, amount,
    status, paid_at, created_at

  - order_group:
    id, group_code, customer_id, grand_total, payment_method,
    payment_status, recipient_name, recipient_phone, delivery_address

  - orders:
    id, order_code, order_group_id, customer_id, farmer_id,
    payment_status, status, amount, created_at

  - customer + users:
    dùng để lấy thông tin khách hàng: full_name, email, phone

  BACKEND SAU NÀY CẦN LÀM:
  - Thay mảng transactions = [] bằng API lấy danh sách giao dịch.
  - Thay stats mặc định bằng API thống kê tổng doanh thu, giao dịch thành công,
    giao dịch thất bại.
  - Các bộ lọc search, payment method, status, date nên gửi lên backend
    nếu dữ liệu nhiều.
*/

const AdminTransactions = () => {
    const [searchValue, setSearchValue] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("all");
    const [status, setStatus] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    /*
      TODO BACKEND:
      Gọi API lấy danh sách giao dịch tại đây.
  
      Ví dụ sau này:
      const response = await transactionService.getAdminTransactions({
        keyword: searchValue,
        paymentMethod,
        status,
        fromDate,
        toDate,
        page,
        size,
      });
  
      Không dùng mock data theo yêu cầu.
    */
    const transactions = [];

    /*
      TODO BACKEND:
      Nên lấy thống kê từ API riêng để tránh phải tính ở frontend
      khi dữ liệu giao dịch lớn.
  
      Ví dụ:
      GET /api/admin/transactions/statistics
    */
    const statistics = {
        totalRevenue: 0,
        successTransactions: 0,
        failedTransactions: 0,
        successRate: 0,
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter((item) => {
            const keyword = searchValue.toLowerCase();

            const matchSearch =
                !keyword ||
                item.transactionCode?.toLowerCase().includes(keyword) ||
                item.orderCode?.toLowerCase().includes(keyword) ||
                item.customerName?.toLowerCase().includes(keyword) ||
                item.customerEmail?.toLowerCase().includes(keyword);

            const matchMethod =
                paymentMethod === "all" || item.paymentMethod === paymentMethod;

            const matchStatus = status === "all" || item.status === status;

            const itemDate = item.createdAt ? new Date(item.createdAt) : null;
            const matchFromDate =
                !fromDate || (itemDate && itemDate >= new Date(fromDate));

            const matchToDate =
                !toDate || (itemDate && itemDate <= new Date(toDate));

            return (
                matchSearch &&
                matchMethod &&
                matchStatus &&
                matchFromDate &&
                matchToDate
            );
        });
    }, [transactions, searchValue, paymentMethod, status, fromDate, toDate]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN").format(value || 0);
    };

    const formatDateTime = (dateValue) => {
        if (!dateValue) return "—";

        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateValue));
    };

    const getStatusLabel = (transactionStatus) => {
        switch (transactionStatus) {
            case "paid":
            case "success":
                return "Thành công";
            case "failed":
                return "Thất bại";
            case "refunded":
                return "Hoàn tiền";
            case "pending":
                return "Đang xử lý";
            default:
                return "Không xác định";
        }
    };

    const getStatusClass = (transactionStatus) => {
        switch (transactionStatus) {
            case "paid":
            case "success":
                return "success";
            case "failed":
                return "failed";
            case "refunded":
                return "refunded";
            case "pending":
                return "pending";
            default:
                return "unknown";
        }
    };

    const handleFilter = () => {
        /*
          Hiện tại filter đang xử lý frontend.
          TODO BACKEND:
          Khi có backend, gọi lại API với các tham số filter.
        */
    };

    const handleExportCSV = () => {
        /*
          TODO BACKEND:
          Gọi API xuất báo cáo CSV.
    
          Ví dụ:
          GET /api/admin/transactions/export?fromDate=&toDate=&status=&paymentMethod=
    
          Backend nên trả về file .csv để tải xuống.
        */
        alert("Chức năng xuất CSV sẽ được kết nối backend sau.");
    };

    const handleViewDetail = (transaction) => {
        /*
          TODO BACKEND:
          Có thể mở modal chi tiết giao dịch hoặc chuyển sang trang chi tiết:
          /admin/transactions/:id
    
          Dữ liệu chi tiết nên lấy từ payment + order_group + orders.
        */
        console.log("Xem chi tiết giao dịch:", transaction);
    };

    return (
        <div className="admin-layout">
            {/* Sidebar Navigation */}
            <AdminSidebar activeItem="transactions" />

            {/* Main Panel */}
            <div className="admin-main-container">
                {/* Header */}
                <header className="admin-header">
                    <div className="admin-search-wrapper">
                        <span className="admin-search-icon" style={{ display: "inline-flex", alignItems: "center" }}><Search size={16} /></span>
                        <input
                            type="text"
                            placeholder="Tìm mã giao dịch, mã đơn, tên khách hàng..."
                            className="admin-search-input"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                    <div className="admin-header-actions">
                        <button className="admin-notification-btn" aria-label="Notifications" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            <Bell size={18} />
                            <span className="admin-notification-dot"></span>
                        </button>
                    </div>
                </header>

                {/* Page Body */}
                <main className="admin-page-body">
                    <div className="admin-transactions-page">
                        <div className="transactions-header">
                            <div>
                                <p className="breadcrumb">Admin / Giao dịch</p>
                                <h1>Danh sách Giao dịch</h1>
                                <p className="page-description">
                                    Quản lý giao dịch, thanh toán và trạng thái đơn hàng trong hệ thống.
                                </p>
                            </div>

                            <button className="export-btn" onClick={handleExportCSV}>
                                <Download size={18} />
                                Xuất báo cáo CSV
                            </button>
                        </div>

                        <div className="transaction-stats-grid">
                            <div className="transaction-stat-card">
                                <div className="stat-icon revenue">
                                    <DollarSign size={20} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-top">
                                        <p>Tổng doanh thu</p>
                                        <span>+0%</span>
                                    </div>
                                    <h3>{formatCurrency(statistics.totalRevenue)}</h3>
                                    <small>VNĐ</small>
                                </div>
                            </div>

                            <div className="transaction-stat-card">
                                <div className="stat-icon success">
                                    <Check size={20} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-top">
                                        <p>Giao dịch thành công</p>
                                        <span>{statistics.successRate}% thành công</span>
                                    </div>
                                    <h3>{formatCurrency(statistics.successTransactions)}</h3>
                                    <small>giao dịch</small>
                                </div>
                            </div>

                            <div className="transaction-stat-card">
                                <div className="stat-icon failed">
                                    <AlertCircle size={20} />
                                </div>
                                <div className="stat-content">
                                    <p>Giao dịch thất bại</p>
                                    <h3>{formatCurrency(statistics.failedTransactions)}</h3>
                                    <small>giao dịch</small>
                                </div>
                            </div>
                        </div>

                        <div className="transaction-filter-box">
                            <div className="filter-row">
                                <div className="admin-transaction-search-box">
                                    <span className="admin-search-icon" style={{ display: "inline-flex", alignItems: "center" }}><Search size={16} /></span>
                                    <input
                                        type="text"
                                        placeholder="Tìm mã giao dịch, mã đơn, tên khách hàng, email..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                    />
                                </div>

                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="all">Cổng thanh toán</option>
                                    <option value="VNPay">VNPay</option>
                                    <option value="COD">COD</option>
                                    <option value="ATM">ATM</option>
                                    <option value="QR">QR</option>
                                </select>

                                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="all">Trạng thái</option>
                                    <option value="paid">Thành công</option>
                                    <option value="pending">Đang xử lý</option>
                                    <option value="failed">Thất bại</option>
                                </select>
                            </div>

                            <div className="filter-row date-row">
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />

                                <span className="date-separator">đến</span>

                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />

                                <button className="filter-btn" onClick={handleFilter}>
                                    Lọc
                                </button>
                            </div>
                        </div>

                        <div className="transaction-table-card">
                            <div className="table-wrapper">
                                <table className="transaction-table">
                                    <thead>
                                        <tr>
                                            <th>Mã giao dịch</th>
                                            <th>Mã đơn</th>
                                            <th>Khách hàng</th>
                                            <th>Số tiền</th>
                                            <th>Phương thức</th>
                                            <th>Trạng thái</th>
                                            <th>Thời gian</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredTransactions.length > 0 ? (
                                            filteredTransactions.map((transaction) => (
                                                <tr key={transaction.id}>
                                                    <td className="transaction-code">
                                                        {transaction.transactionCode || "—"}
                                                    </td>

                                                    <td>
                                                        <strong>{transaction.orderCode || "—"}</strong>
                                                    </td>

                                                    <td>
                                                        <div className="customer-info">
                                                            <strong>{transaction.customerName || "—"}</strong>
                                                            <span>{transaction.customerEmail || "—"}</span>
                                                        </div>
                                                    </td>

                                                    <td className="amount">
                                                        {formatCurrency(transaction.amount)} đ
                                                    </td>

                                                    <td>{transaction.paymentMethod || "—"}</td>

                                                    <td>
                                                        <span
                                                            className={`status-badge ${getStatusClass(
                                                                transaction.status
                                                            )}`}
                                                        >
                                                            {getStatusLabel(transaction.status)}
                                                        </span>
                                                    </td>

                                                    <td>{formatDateTime(transaction.createdAt)}</td>

                                                    <td>
                                                        <button
                                                            className="detail-btn"
                                                            onClick={() => handleViewDetail(transaction)}
                                                        >
                                                            Chi tiết
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8">
                                                    <div className="empty-state">
                                                        <div className="empty-icon">
                                                            <CreditCard size={48} />
                                                        </div>
                                                        <h3>Chưa có dữ liệu giao dịch</h3>
                                                        <p>
                                                            Dữ liệu giao dịch sẽ được hiển thị tại đây sau khi kết
                                                            nối backend.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="table-footer">
                                <p>
                                    Hiển thị {filteredTransactions.length} giao dịch
                                </p>

                                <div className="pagination">
                                    <button disabled style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button className="active">1</button>
                                    <button disabled style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminTransactions;
