import express from "express";
import { registerUser, loginUser, logOut, myProfile, createNote, updateNote, deleteNote, Refresh, chatBotResponse, ImageUpload } from "../controllers/userControllers.js";
const router = express.Router();
router.post("/users/register", registerUser);
router.post("/users/login", loginUser);
router.get("/me", myProfile)
router.get("/logout", logOut)
router.post("/notes/:id/newnote", createNote);
router.put("/notes/:userId/updatepin/:noteId", updateNote);
router.delete("/notes/:userId/delete/:noteId", deleteNote);
router.post("/refresh", Refresh);
router.post("/chat-bot", chatBotResponse);
router.post("/image-upload", ImageUpload); // Assuming you have an ImageUpload controller function
export default router;

