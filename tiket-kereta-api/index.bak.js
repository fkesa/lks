const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(bodyParser.json());
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
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(401).json({ message: 'Login gagal' });
        res.json({ message: 'Login berhasil', user: results[0] });
    });
});

app.get('/tickets', (req, res) => {
    db.query('SELECT * FROM tickets', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});


app.post('/tickets', (req, res) => {
    const { train_name, origin, destination, price } = req.body;
    const query = `INSERT INTO tickets (train_name, origin, destination, price) VALUES ('${train_name}', '${origin}', '${destination}', ${price})`;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Tiket ditambahkan', id: result.insertId });
    });
});


app.post('/orders', (req, res) => {
    const { user_id, ticket_id, quantity } = req.body;
    
    const query = `INSERT INTO orders (user_id, ticket_id, quantity, status) VALUES (${user_id}, ${ticket_id}, ${quantity}, 'MENUNGGU PEMBAYARAN')`;
    
    db.query(query, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Pesanan dibuat', order_id: result.insertId });
    });
});


app.post('/payments/:order_id', upload.single('bukti'), (req, res) => {
    const orderId = req.params.order_id;
    const filePath = req.file.path;
    
    const query = `UPDATE orders SET payment_proof='${filePath}', status='MENUNGGU VERIFIKASI' WHERE id=${orderId}`;
    db.query(query, err => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Bukti transfer diupload' });
    });
});


app.get('/orders', (req, res) => {
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});