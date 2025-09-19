console.log("Loading: authRoutes.ts");
import express from 'express';

import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/authService';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();
const authService = new AuthService();
const controller = new AuthController(authService);

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.post("/refresh", controller.refreshToken);
router.get("/profile", authenticateToken, controller.getProfile);
export default router;
