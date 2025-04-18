import { Router } from "express";
import { login, register, updateUser, logout, deleteUser } from "../controllers/userController";
import { getAllUsers, fetchUserById, updateProfilePhoto} from "../services/userService";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/getUsers", getAllUsers);

router.get("/getUser/", fetchUserById);   

router.post("/uploadPhotos", updateProfilePhoto);

router.put("/update", authenticateToken, updateUser)

router.get("/logout", authenticateToken, logout)

router.delete("/delete", authenticateToken, deleteUser)

export default router;
