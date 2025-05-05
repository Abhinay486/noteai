import express from "express";
import { isAuth } from '../middlewares/isAuth.js';
import { registerUser, loginUser, logOut, myProfile, createNote, updateNote, deleteNote, getAllnotes } from "../controllers/userControllers.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", isAuth, logOut);
router.get("/me", isAuth, myProfile);
router.post("/user/:userId/newnote", isAuth, createNote);
router.put("/user/:userId/note/:noteId", isAuth, updateNote);
router.delete("/user/:userId/note/:noteId", isAuth, deleteNote);
router.get("/notes", isAuth, getAllnotes);

export default router;

