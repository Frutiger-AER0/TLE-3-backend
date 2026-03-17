import jwt from "jsonwebtoken";

export default function requireAuth(req, res, next) {
    const authHeader = req.header("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Missing token" });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "JWT_SECRET is not set" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        req.user = payload;
        return next();
    } catch (e) {
        console.log("JWT VERIFY ERROR:", e.message);

        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}

export function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
}