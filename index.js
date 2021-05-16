const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');
require('dotenv').config();
require('./helpers/init_mongodb');
const { verifyAccessToken } = require('./helpers/jwt_helper');

const authRoute = require('./routes/auth.route');

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', verifyAccessToken, (req, res, _next) => {
    res.send('Hello from express');
});

app.use('/auth', authRoute);

app.use((_res, _req, next) => {
    next(createError.NotFound());
});

app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
