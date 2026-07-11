# AI Moderation Worker (Hệ thống kiểm duyệt Livestream bằng AI)

Hệ thống AI này chịu trách nhiệm kiểm duyệt luồng hình ảnh của Livestream (phát hiện vũ khí nguy hiểm, khỏa thân, live rác màn hình đen/màn hình tĩnh). Hệ thống được xây dựng bằng Python (FastAPI) kết hợp mô hình học máy YOLOv8.

---

## 🛠️ Hướng dẫn cài đặt cho thành viên dự án

Sau khi pull code mới nhất từ Git về máy, các thành viên cần thực hiện các bước sau để thiết lập môi trường chạy AI:

### Bước 1: Tạo môi trường ảo (Virtual Environment)
Mở terminal (nhớ di chuyển về thư mục gốc của dự án `AgriMarket` chứa thư mục `AI_Moderation_Worker`) và chạy lệnh:

```bash
# Tạo môi trường ảo tên là .venv
python -m venv .venv
```

### Bước 2: Kích hoạt môi trường ảo
* **Trên Windows (PowerShell):**
  ```powershell
  .venv\Scripts\Activate.ps1
  ```
* **Trên Windows (Command Prompt - CMD):**
  ```cmd
  .venv\Scripts\activate.bat
  ```
* **Trên macOS / Linux:**
  ```bash
  source .venv/bin/activate
  ```

### Bước 3: Cài đặt các thư viện cần thiết
Khi môi trường ảo đã được kích hoạt (bạn sẽ thấy chữ `(.venv)` ở đầu dòng lệnh), tiến hành cài đặt các thư viện từ file `requirements.txt`:

```bash
pip install -r AI_Moderation_Worker/requirements.txt
```
*(Tiến trình này sẽ tự động tải các thư viện cần thiết bao gồm: FastAPI, Uvicorn, OpenCV, NumPy, và Ultralytics YOLOv8).*

---

## 🚀 Hướng dẫn chạy server AI

Mỗi khi bắt đầu chạy dự án, hãy kích hoạt môi trường ảo và chạy lệnh sau để khởi động server AI ở cổng `8000`:

```bash
# 1. Di chuyển vào thư mục AI
cd AI_Moderation_Worker

# 2. Chạy server bằng Uvicorn
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Khi chạy thành công, terminal sẽ hiện dòng chữ báo tải thành công mô hình YOLOv8:
`>>> Loading YOLOv8 model...`
`>>> YOLOv8 loaded successfully.`
`Uvicorn running on http://127.0.0.1:8000`

---

## ⚙️ Các API chính
* `POST /moderation/frame`: Nhận ảnh chụp từ livestream của Farmer gửi lên để AI phân tích phát hiện vi phạm.
