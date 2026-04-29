import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
    createApiKey,
    listApiKeys,
    revokeApiKey,
    deleteApiKey
} from "../controllers/apiKeys.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.post("/generate", createApiKey);
router.get("/list", listApiKeys);
router.post("/:apiKeyId/revoke", revokeApiKey);
router.delete("/:apiKeyId", deleteApiKey);

export default router;