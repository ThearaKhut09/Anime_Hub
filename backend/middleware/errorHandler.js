const errorHandler = (err, req, res, next) => {
    console.error('🔥 Server Error:', err.stack || err.message);

    const statusCode = err.statusCode || err.status || (res.statusCode !== 200 ? res.statusCode : 500);
    const isProd = process.env.NODE_ENV === 'production';

    res.status(statusCode).json({
        success: false,
        // Never leak internal error details (SQL, driver messages) to clients in production
        message: (isProd && statusCode >= 500) ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
        stack: isProd ? null : err.stack
    });
};

module.exports = errorHandler;
