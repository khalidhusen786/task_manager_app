console.log("Loading: authRoutes.ts");
import express from 'express';

import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/authService';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/authSchemas';

const router = express.Router();
const authService = new AuthService();
const controller = new AuthController(authService);

router.post("/register", validate({ body: registerSchema }), controller.register);
router.post("/login", validate({ body: loginSchema }), controller.login);
router.post("/logout", authenticateToken, controller.logout);
router.post("/refresh-token", validate({ body: refreshTokenSchema }), controller.refreshToken);
router.get("/profile", authenticateToken, controller.getProfile);
export default router;
