import bcrypt from 'bcryptjs'
import { User } from '../models/userModel.js';
import TryCatch from '../utils/TryCatch.js';
import generateToken from '../utils/generateToken.js'
export const registerUser = TryCatch(async(req, res) => {
    const {name, email, password} = req.body;

        let user = await User.findOne({email});

        if(user) return res.status(400).json({
            message : "Already registered"
        });

        const hashPassword = await bcrypt.hash(password, 10)

        user = await User.create({
            name,
            email,
            password : hashPassword,
        })

        res.status(201).json({
            user,
            message : "User Registered",

        })
})
export const loginUser = TryCatch(async(req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({
            message: "User not found"
        });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
        return res.status(400).json({
            message: "Invalid credentials"
        });
    }

    // Generate token and set it in cookie
    const token = generateToken(user._id, res);

    // Send token in response as well for localStorage
    res.json({
        message: "Logged In",
        user,
        token, // Send token for localStorage usage
    });
})

export const myProfile = TryCatch(async(req, res) => {
    const user = await User.findById(req.user._id)
    
    res.json({user})
});

export const getAllnotes = TryCatch(async (req, res) => {
    const userId = req.user.id;

  const user = await User.findById(userId).select("notes");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user.notes);

})

export const createNote = TryCatch(async (req, res) => {
    const { title, content } = req.body;

    // Validate request body
    if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: "No user with this id" });
    }

    const newNote = {
        title,
        content,
        createdAt: new Date()
    };

    user.notes.push(newNote);
    await user.save();

    res.status(201).json({
        message: "Note added successfully",
        note: newNote
    });
});

export const deleteNote = TryCatch(async (req, res) => {
    const { userId, noteId } = req.params;
  
    const user = await User.findById(userId);
  
    if (!user) {
      return res.status(404).json({ message: "No user with this id" });
    }
  
    const notesIdx = user.notes.findIndex(
      (item) => item._id.toString() === noteId
    );
  
    if (notesIdx === -1) {
      return res.status(404).json({ message: "Note not found" });
    }
  
    // Optional ownership check
    // if (user.notes[notesIdx].createdBy.toString() !== req.user.id) {
    //   return res.status(403).json({ message: "Not authorized to delete this note" });
    // }
  
    user.notes.splice(notesIdx, 1); // Remove the note
    await user.save();
  
    res.json({ message: "Note deleted successfully" });
  });
  


export const updateNote = TryCatch(async (req, res) => {
    const { userId, noteId } = req.params;
  
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "No user with this id" });
    }
  
    const notesIdx = user.notes.findIndex(
      (item) => item._id.toString() === noteId
    );
  
    if (notesIdx === -1) {
      return res.status(404).json({ message: "Note not found" });
    }
  
    // Update the note fields
    const note = user.notes[notesIdx];
    if (req.body.title) note.title = req.body.title;
    if (req.body.content) note.content = req.body.content;
    note.createdAt = new Date(); // Optional: update timestamp
  
    await user.save();
  
    res.json({
      message: "Note updated successfully",
      updatedNote: note,
    });
  });
  


export const logOut = TryCatch(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true, // Ensure it matches the cookie settings when it was set
        secure: process.env.NODE_ENV === "production", // Ensure compatibility with HTTPS in production
        sameSite: "strict", 
    });

    res.json({
        success: true,
        message: "Logged out successfully",
    });
});
