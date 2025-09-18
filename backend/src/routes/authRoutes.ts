console.log("Loading: authRoutes.ts");
import express from 'express';

import { AuthController } from '../controllers/authController';

import { AuthService } from '../services/authService';

const router = express.Router();
const authService = new AuthService();
const controller = new AuthController(authService);

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
export default router;
