export const starterMiddleware = (req, res, next) => {
    res.header("Acess-Control-Allow-Origin", "*");
    console.log(`### ${req.ip} ${req.method} ${req.originalUrl}`);
    next();
};