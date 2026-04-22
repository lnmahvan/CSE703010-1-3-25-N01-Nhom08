# 🦷 DENTAL PRO - HỆ THỐNG QUẢN LÝ PHÒNG KHÁM NHA KHOA

---

## 🚀 Hướng Dẫn Cài Đặt

### 1. Backend (Laravel)

#### Bước 1: Di chuyển vào thư mục backend
```bash
cd server
```

#### Bước 2: Cài đặt Composer dependencies
```bash
composer install
```

#### Bước 3: Tạo file cấu hình
```bash
cp .env.example .env
php artisan key:generate
```

#### Bước 4: Cấu hình Database trong .env
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nha_khoa_db
DB_USERNAME=root
DB_PASSWORD=
```

**Tạo database** `dental_pro` trong phpMyAdmin trước

#### Bước 5: Chạy Migration
```bash
php artisan migrate:fresh
php artisan config:clear
php artisan route:clear
```

#### Bước 6: Khởi động server
```bash
php artisan serve
```

Backend chạy tại: **http://localhost:8000**

---

### 2. Frontend (React)

#### Bước 1: Di chuyển vào thư mục frontend
```bash
cd client
```

#### Bước 2: Cài đặt NPM dependencies
```bash
npm install
```

#### Bước 3: Chạy dev server
```bash
npm run dev
```

Frontend chạy tại: **http://localhost:5173**
