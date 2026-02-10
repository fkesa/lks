# Security Vulnerability Fixes for `index.js`

This document details the security vulnerabilities identified in the original `index.js` file and the corresponding fixes applied.

## 1. SQL Injection (Critical)

### Vulnerability
The application was concatenating user input directly into SQL query strings. This allows an attacker to manipulate the query, potentially bypassing authentication (`' OR '1'='1`) or stealing/modifying data.

### Fix
Refactored all SQL queries to use **Parameterized Queries** (Prepared Statements). This ensures that user input is treated as data, not executable code.

#### Example: Login Endpoint

**Before:**
```javascript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
db.query(query, (err, results) => { ... });
```

**After:**
```javascript
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
db.query(query, [username, password], (err, results) => { ... });
```

#### Endpoint: POST /tickets

**Before:**
```javascript
const query = `INSERT INTO tickets (train_name, origin, destination, price) VALUES ('${train_name}', '${origin}', '${destination}', ${price})`;
db.query(query, (err, result) => { ... });
```

**After:**
```javascript
const query = 'INSERT INTO tickets (train_name, origin, destination, price) VALUES (?, ?, ?, ?)';
db.query(query, [train_name, origin, destination, price], (err, result) => { ... });
```

#### Endpoint: POST /orders

**Before:**
```javascript
const query = `INSERT INTO orders (user_id, ticket_id, quantity, status) VALUES (${user_id}, ${ticket_id}, ${quantity}, 'MENUNGGU PEMBAYARAN')`;
db.query(query, (err, result) => { ... });
```

**After:**
```javascript
const query = 'INSERT INTO orders (user_id, ticket_id, quantity, status) VALUES (?, ?, ?, ?)';
db.query(query, [user_id, ticket_id, quantity, 'MENUNGGU PEMBAYARAN'], (err, result) => { ... });
```

#### Endpoint: POST /payments/:order_id

**Before:**
```javascript
const query = `UPDATE orders SET payment_proof='${filePath}', status='MENUNGGU VERIFIKASI' WHERE id=${orderId}`;
db.query(query, err => { ... });
```

**After:**
```javascript
const query = 'UPDATE orders SET payment_proof=?, status=? WHERE id=?';
db.query(query, [filePath, 'MENUNGGU VERIFIKASI', orderId], err => { ... });
```

---

## 2. Information Leakage (High)

### Vulnerability
The application was returning the raw database error object (`err`) directly to the client in the HTTP response (`res.status(500).json(err)`). This can expose sensitive database schema information, table names, and internal logic to an attacker.

### Fix
The application now logs the validation error internally (`console.error(err)`) and returns a generic error message to the client.

**Before:**
```javascript
if (err) return res.status(500).json(err);
```

**After:**
```javascript
if (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
}
```

---

## 3. Insecure File Upload (Medium)

### Vulnerability
The file upload mechanism used `file.originalname` directly for the stored filename.
1.  **Path Traversal**: An attacker could potentially use `../` in the filename to write files outside the intended uploads directory.
2.  **File Overwrite**: Users uploading files with the same name could overwrite each other's files.
3.  **Predictable Filenames**: Using only `Date.now()` is somewhat predictable.

### Fix
Implemented a more robust naming strategy using a timestamp and a random number to ensure uniqueness, and sanitized the extension handling.

**Before:**
```javascript
filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
}
```

**After:**
```javascript
filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
}
```

---

## 4. Insecure Password Storage (Critical)

### Vulnerability
The application was checking passwords by comparing plain text strings in the database. 
1.  **Likely Plain Text Storage**: The query implied passwords were stored as plain text.
2.  **Timing Attacks**: Plain string comparison can be vulnerable to timing attacks.

### Fix
Implemented **Argon2** for secure password hashing.
1.  **Hashing**: Added a `/register` endpoint that hashes passwords using `argon2.hash` before storing them.
2.  **Verification**: Updated `/login` to retrieval the user record by username and then verify the password using `argon2.verify`.

**Before (Login Logic):**
```javascript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
db.query(query, (err, results) => {
    // If results > 0, login success
});
```

**After (Login Logic):**
```javascript
const query = 'SELECT * FROM users WHERE username = ?';
db.query(query, [username], async (err, results) => {
    const user = results[0];
    if (await argon2.verify(user.password, password)) {
        // Login success
    }
});
```

---

## Additional Recommendations

1.  **Environment Variables**: Database credentials (host, user, password) should be stored in a `.env` file using the `dotenv` package, rather than hardcoded in `index.js`.
2.  **Input Validation**: Implement a validation library (like `joi` or `express-validator`) to ensure incoming data matches expected formats before processing.
3.  **Rate Limiting**: Implement rate limiting (e.g., using `express-rate-limit`) to prevent brute-force attacks on the `/login` endpoint.

