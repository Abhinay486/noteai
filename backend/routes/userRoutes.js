import express from "express";
import { registerUser, loginUser, logOut, myProfile, createNote, updateNote, deleteNote, Refresh } from "../controllers/userControllers.js";
const router = express.Router();
router.post("/users/register", registerUser);
router.post("/users/login", loginUser);
router.get("/me", myProfile)
router.get("/logout", logOut)
router.post("/notes/:id/newnote", createNote);
router.put("/notes/:userId/updatepin/:noteId", updateNote);
router.delete("/notes/:userId/delete/:noteId", deleteNote);
router.post("/refresh", Refresh);
export default router;

