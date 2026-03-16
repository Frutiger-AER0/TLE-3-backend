import db from "../../database.js";

export default function userDelete(req, res) {
    const targetUserId = Number(req.params.id);
    const loggedInUserId = Number(req.user.id);
    const loggedInUserRole = Number(req.user.role);

    const isOwner = loggedInUserId === targetUserId;
    const isAdmin = loggedInUserRole === 1;

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            message: "You are not allowed to delete this account"
        });
    }

    db.query(
        "DELETE FROM users WHERE id = ?",
        [targetUserId],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            return res.json({
                message: "User deleted"
            });
        }
    );
}