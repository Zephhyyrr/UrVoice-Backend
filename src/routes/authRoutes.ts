import { Router } from "express";
import { login, register } from "../controllers/userController";
import { getUsers, getUserById } from "../services/userService";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/getUsers", getUsers);

router.get("/getUser/", getUserById);

export default router;
