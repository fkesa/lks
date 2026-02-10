const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tiket_kereta'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected');
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Sanitize filename to preventing directory traversal and overwrite attacks
        // Using timestamp and random number for uniqueness
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Fetch user by username only
    const query = 'SELECT * FROM users WHERE username = ?';

    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error(err); // Log error internally
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Login gagal' });
        }

        const user = results[0];

        try {
            if (await bcrypt.compare(password, user.password)) {
                // Prevent password leakage in response
                const { password, ...userWithoutPassword } = user;
                res.json({ message: 'Login berhasil', user: userWithoutPassword });
            } else {
                return res.status(401).json({ message: 'Login gagal' });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });
});

app.get('/tickets', (req, res) => {
    db.query('SELECT * FROM tickets', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});


app.post('/tickets', (req, res) => {
    const { train_name, origin, destination, price } = req.body;
    // Use parameterized query
    const query = 'INSERT INTO tickets (train_name, origin, destination, price) VALUES (?, ?, ?, ?)';
    db.query(query, [train_name, origin, destination, price], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json({ message: 'Tiket ditambahkan', id: result.insertId });
    });
});

app.post('/orders', (req, res) => {
    const { user_id, ticket_id, quantity } = req.body;

    // Use parameterized query
    const query = 'INSERT INTO orders (user_id, ticket_id, quantity, status) VALUES (?, ?, ?, ?)';

    db.query(query, [user_id, ticket_id, quantity, 'MENUNGGU PEMBAYARAN'], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json({ message: 'Pesanan dibuat', order_id: result.insertId });
    });
});


app.post('/payments/:order_id', upload.single('bukti'), (req, res) => {
    const orderId = req.params.order_id;
    const filePath = req.file.path;

    const query = 'UPDATE orders SET payment_proof=?, status=? WHERE id=?';
    db.query(query, [filePath, 'MENUNGGU VERIFIKASI', orderId], err => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json({ message: 'Bukti transfer diupload' });
    });
});


app.get('/orders', (req, res) => {
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

app.listen(7000, () => {
    console.log('Server berjalan di http://localhost:7000');
});