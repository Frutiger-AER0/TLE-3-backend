export default function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    if (Number(req.user.role) !== 1) {
        return res.status(403).json({
            message: "Admin access required"
        });
    }

    return next();
}