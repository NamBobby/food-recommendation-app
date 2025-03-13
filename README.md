# 📌 Hướng dẫn cài đặt & chạy dự án Food Recommendation App

## **1️⃣ Các phần mềm cần cài đặt trước khi clone dự án**
Trước khi chạy dự án, cần cài đặt các phần mềm sau:

### **🔹 PostgreSQL (Cơ sở dữ liệu quan hệ - RDBMS)**
✅ **Tải PostgreSQL** tại: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)  
✅ **Phiên bản khuyến nghị:** PostgreSQL **15+**  
✅ **Cài đặt pgAdmin** (nếu muốn quản lý database bằng giao diện đồ họa).  

### **🔹 Node.js (Chạy React Native - Expo)**
✅ **Tải Node.js** tại: [https://nodejs.org/en/download](https://nodejs.org/en/download)  
✅ **Phiên bản khuyến nghị:** Node.js **18+** (LTS)  
✅ **Kiểm tra sau khi cài đặt:**
```bash
node -v   # Kiểm tra phiên bản Node.js
npm -v    # Kiểm tra phiên bản npm
```

### **🔹 Python (Chạy Flask Backend)**
✅ **Tải Python** tại: [https://www.python.org/downloads/](https://www.python.org/downloads/)  
✅ **Phiên bản khuyến nghị:** Python **3.9+**  
✅ **Kiểm tra sau khi cài đặt:**
```bash
python --version   # Kiểm tra phiên bản Python
pip --version      # Kiểm tra phiên bản pip
```

### **🔹 Concurrently (Chạy cả React Native & Flask cùng lúc)**
✅ **Cài đặt Concurrently (Toàn cầu)**:
```bash
npm install -g concurrently
```
✅ **Kiểm tra sau khi cài đặt:**
```bash
concurrently --version
```

---

## **2️⃣ Clone & Cài đặt dự án**
### **🔹 Clone dự án từ GitHub**
```bash
git clone https://github.com/your-repo/food-recommendation-app.git
cd food-recommendation-app
```

### **🔹 Cài đặt thư viện cho frontend (React Native - Expo)**
```bash
cd frontend
npm install
```

### **🔹 Cài đặt thư viện cho backend (Flask & PostgreSQL)**
```bash
cd ../backend
pip install -r requirements.txt
```

---

## **3️⃣ Khởi tạo PostgreSQL Database**
📌 **Mở PostgreSQL Shell và tạo database**:
```sql
CREATE DATABASE food_recommendation_db;
```

📌 **Kiểm tra database đã tạo thành công chưa:**
```sql
\l
```

📌 **Thoát PostgreSQL Shell:**
```sql
\q
```

📌 **Khởi tạo bảng trong PostgreSQL bằng Flask**
```bash
cd backend
python database/db_init.py
```

✅ **Sau khi chạy, PostgreSQL đã sẵn sàng!**

---

## **4️⃣ Chạy dự án (React Native + Flask đồng thời)**
📌 **Chạy toàn bộ dự án bằng 1 lệnh:**
```bash
cd food-recommendation-app
npm start
```

📌 **Cách hoạt động:**
- **React Native (Expo) chạy trên cổng 19000+**
- **Flask API chạy trên cổng 5000**

✅ **Truy cập API Flask kiểm tra:**
```bash
http://127.0.0.1:5000/get-foods
http://127.0.0.1:5000/get-nutrient-effectiveness
```

✅ **Chạy ứng dụng trên điện thoại hoặc trình giả lập:**
- Android: `npx expo run:android`
- iOS: `npx expo run:ios`
- Web: `npx expo run:web`

---

## **5️⃣ Các thư viện quan trọng được sử dụng**

### **🔹 Frontend (React Native - Expo)**
- `expo`
- `react-navigation`
- `styled-components`
- `axios` (Gọi API Flask)
- `expo-camera`, `expo-image-picker`

### **🔹 Backend (Flask & PostgreSQL)**
- `Flask`
- `Flask-SQLAlchemy` (Kết nối PostgreSQL)
- `Pandas` (Đọc file CSV)
- `Psycopg2` (Driver PostgreSQL)

---

## **6️⃣ Cấu trúc thư mục dự án**
```
/food-recommendation-app  # 🏠 Root project
│── /frontend             # 📱 React Native (Expo)
│── /backend              # 🖥️ Flask API + AI Model + PostgreSQL
│── package.json          # ✅ Chạy cả frontend & backend
│── README.md             # 📜 Hướng dẫn sử dụng
```

📢 **Sau khi làm theo hướng dẫn trên, dự án đã sẵn sàng chạy!** 🚀