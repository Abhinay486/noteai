import bcrypt from 'bcryptjs'
import { User } from '../models/userModel.js';
import TryCatch from '../utils/TryCatch.js';
import generateToken from '../utils/generateToken.js'
import jwt from 'jsonwebtoken';

export const registerUser = TryCatch(async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) return res.status(400).json({
    message: "Already registered"
  });

  const hashPassword = await bcrypt.hash(password, 10)

  user = await User.create({
    name,
    email,
    password: hashPassword,
  })

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token to user document
  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json({ message: "Login successful" });
})
export const loginUser = TryCatch(async (req, res) => {
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
  console.log(user);
  const { accessToken, refreshToken } = generateToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json({ message: "Login successful" });
})

export const myProfile = TryCatch(async (req, res) => {
  // Remove token verification since isAuth middleware already does this

  const accessToken = req.cookies.accessToken;
  if (!accessToken) return res.status(401).json({ error: "No access token" });

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch {
    res.status(401).json({ error: "Invalid access token" });
  }
});


export const Refresh = TryCatch(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000 * 2, // 15 minutes
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({ message: "Tokens refreshed" });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
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

  const note = user.notes[notesIdx];

  // Save current state to history before updating
  note.history.push({
    title: note.title,
    content: note.content,
    editedAt: new Date(),
  });

  // Update note fields
  if (req.body.title) note.title = req.body.title;
  if (req.body.content) note.content = req.body.content;
  note.updatedAt = new Date();

  await user.save();

  res.json({
    message: "Note updated successfully",
    updatedNote: note,
  });
});




export const logOut = TryCatch(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    // Clear refresh token from database
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logged out" });
});

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

import { GoogleGenerativeAI } from "@google/generative-ai";


// Initialize Gemini

export const chatBotResponse = TryCatch(async (req, res) => {
  const { message, userId } = req.body;
  if (!message || !userId) return res.status(400).json({ error: "Message and userId are required." });

  // Load the model
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(`
    You're an AI assistant that extracts a note title and generates detailed content.

    From this user instruction:
    "${message}"

    Identify the note's title and generate informative, structured content for that note.

    Return ONLY JSON in the following format (without any markdown code block):
    {
      "title": "Extracted Title",
      "content": "Full AI-generated note content"
    }
  `);

  const response = await result.response;
  const rawText = response.text();

  // Strip markdown code block if it exists
  const cleanText = rawText
    .replace(/^```json\n/, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanText);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to parse Gemini response",
      raw: rawText
    });
  }

  const { title, content } = parsed;
  if (!title || !content) {
    return res.status(400).json({ error: "Incomplete data from Gemini", parsed });
  }

  // Save to user notes
  const user = await User.findById(userId);
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
    message: "Note added successfully via chatbot",
    note: newNote
  });
});


export const ImageUpload = TryCatch(async (req, res) => {

  const { image } = req.body;

  if (!image) return res.status(400).json({ error: "Image data is required." });

  const buffer = Buffer.from(image, "base64");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Please:
- Do NOT rephrase or rewrite the content.
- Only correct spelling mistakes, grammar, punctuation, and formatting.
- Maintain the original structure and meaning.
- Assign a relevant title for the extracted content.

Return the result exactly in this format:
**Title:** [title]
**Corrected Content:** [refined content]
`;

  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { mimeType: "image/jpeg", data: image } }
  ]);

  const geminiResponse = await result.response.text();

  // Optional: Extract title and corrected content (if needed by frontend)
  const titleMatch = geminiResponse.match(/\*\*Title:\*\*\s*(.+)/i);
  const contentMatch = geminiResponse.match(/\*\*Corrected Content:\*\*\s*([\s\S]*)/i);

  const title = titleMatch ? titleMatch[1].trim() : "Untitled";
  const correctedContent = contentMatch ? contentMatch[1].trim() : geminiResponse;


  res.status(200).json({
    message: "Image processed successfully",
    title,
    correctedContent
  });
});
