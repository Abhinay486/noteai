import express from "express";
import { isAuth } from '../middlewares/isAuth.js';
import { registerUser, loginUser, logOut, myProfile, createNote, updateNote, deleteNote, getAllnotes } from "../controllers/userControllers.js";
const router = express.Router();

router.post("/users/register", registerUser);
router.post("/users/login", loginUser);
router.get("/me", isAuth, myProfile)
router.get("/logout", isAuth, logOut)
router.post("/notes/:id/newnote", isAuth, createNote);
router.put("/notes/:userId/updatepin/:noteId", isAuth, updateNote);
router.delete("/notes/:userId/delete/:noteId", isAuth, deleteNote);
// router.get("/notes", isAuth, getAllnotes);

export default router;
