import { Router } from "express";
import { login, register } from "../controllers/userController";
import { getAllUsers, fetchUserById, updateProfilePhoto } from "../services/userService";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/getUsers", getAllUsers);

router.get("/getUser/", fetchUserById);   

router.post("/uploadPhotos", updateProfilePhoto);

export default router;
