const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');

require('dotenv').config();

const app = express();

app.get('/', (_req, res, _next) => {
    res.send('Hello from express');
});

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
