import { Router } from "express";
import { login, register, updateUser, logout, deleteUser, updateProfilePhoto } from "../controllers/user.controller";
import { getAllUsers, fetchUserById} from "../services/user.service";
import { authenticateToken } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/getUsers", getAllUsers);

router.get("/getUser/", fetchUserById);   

router.post("/uploadPhotos", authenticateToken, upload.single("profileImage"), updateProfilePhoto);

router.put("/update", authenticateToken, updateUser)

router.get("/logout", authenticateToken, logout)

router.delete("/delete", authenticateToken, deleteUser)

export default router;
