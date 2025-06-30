import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  history: [
    {
      title: String,
      content: String,
      editedAt: { type: Date, default: Date.now },
    }
  ]
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  notes: [noteSchema],
  refreshToken: {
    type: String,
  },
}, {
  timestamps: true,
});

export const User = mongoose.model("User", userSchema);
