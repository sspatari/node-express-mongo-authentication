const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const redisClient = require('./init_redis');
const client = require('./init_redis');

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: '1h',
        issuer: 'pickurpage.com',
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log({ error: err.message });
          return reject(createError.InternalServerError());
        }
        return resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers['authorization']) return next(createError.Unauthorized());
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
        return next(createError.Unauthorized(message));
      }
      req.payload = payload;
      next();
    });
  },
  signRefreshToken: async (userId) => {
    const refreshToken = await new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: '1y',
        issuer: 'pickurpage.com',
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.error(err.message);
          return reject(createError.InternalServerError());
        }
        return resolve(token);
      });
    });
    await redisClient.set(userId, refreshToken, {
      EX: 365 * 24 * 60 * 60,
    });
    return refreshToken;
  },
  verifyRefreshToken: async (refreshToken) => {
    const userId = await new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) {
            console.error(err.message);
            return reject(createError.Unauthorized());
          }
          return resolve(payload.aud);
        }
      );
    });
    const redisRefreshToken = await redisClient.get(userId);
    if (redisRefreshToken === refreshToken) return userId;
    throw createError.Unauthorized();
  },
};
