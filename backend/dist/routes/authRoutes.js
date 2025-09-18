"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("Loading: authRoutes.ts");
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authService_1 = require("../services/authService");
const router = express_1.default.Router();
const authService = new authService_1.AuthService();
const controller = new authController_1.AuthController(authService);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
exports.default = router;
