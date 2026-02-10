# Dokumentasi API Tiket Kereta

Base URL: `http://localhost:7000`

## 1. Autentikasi

### Login
Masuk ke aplikasi untuk mendapatkan akses.

*   **URL**: `/login`
*   **Method**: `POST`
*   **Content-Type**: `application/json`
*   **Body**:
    ```json
    {
        "username": "admin",
        "password": "password_rahasia"
    }
    ```
*   **Response (Sukses - 200)**:
    ```json
    {
        "message": "Login berhasil",
        "user": {
            "id": 1,
            "username": "admin",
            "role": "admin"
        }
    }
    ```
*   **Response (Gagal - 401)**:
    ```json
    {
        "message": "Login gagal"
    }
    ```

---

## 2. Tiket

### Lihat Semua Tiket
Mendapatkan daftar seluruh tiket yang tersedia.

*   **URL**: `/tickets`
*   **Method**: `GET`
*   **Response**:
    ```json
    [
        {
            "id": 1,
            "train_name": "Argo Bromo",
            "origin": "Jakarta",
            "destination": "Surabaya",
            "price": 350000
        },
        ...
    ]
    ```

### Tambah Tiket Baru
Menambahkan tiket baru ke dalam sistem.

*   **URL**: `/tickets`
*   **Method**: `POST`
*   **Content-Type**: `application/json`
*   **Body**:
    ```json
    {
        "train_name": "Taksaka",
        "origin": "Jakarta",
        "destination": "Yogyakarta",
        "price": 300000
    }
    ```
*   **Response**:
    ```json
    {
        "message": "Tiket ditambahkan",
        "id": 2
    }
    ```

---

## 3. Pesanan (Order)

### Membuat Pesanan
Memesan tiket kereta.

*   **URL**: `/orders`
*   **Method**: `POST`
*   **Content-Type**: `application/json`
*   **Body**:
    ```json
    {
        "user_id": 1,
        "ticket_id": 1,
        "quantity": 2
    }
    ```
*   **Response**:
    ```json
    {
        "message": "Pesanan dibuat",
        "order_id": 5
    }
    ```

### Lihat Semua Pesanan
Melihat daftar semua pesanan yang masuk.

*   **URL**: `/orders`
*   **Method**: `GET`
*   **Response**:
    ```json
    [
        {
             "id": 5,
             "user_id": 1,
             "ticket_id": 1,
             "quantity": 2,
             "status": "MENUNGGU PEMBAYARAN",
             ...
        }
    ]
    ```

### Upload Bukti Pembayaran
Mengupload bukti transfer untuk pesanan tertentu.

*   **URL**: `/payments/:order_id`
    *   Contoh: `/payments/5`
*   **Method**: `POST`
*   **Content-Type**: `multipart/form-data`
*   **Body**:
    *   Key: `bukti`
    *   Type: `File` (Pilih gambar bukti transfer)
*   **Response**:
    ```json
    {
        "message": "Bukti transfer diupload"
    }
    ```
