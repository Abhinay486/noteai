import React, { useState } from 'react';
import axios from 'axios';

export default function NoteViewer({ selectedNote, refreshNotes, userId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(selectedNote.title);
  const [content, setContent] = useState(selectedNote.content);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notes/${userId}/updatepin/${selectedNote._id}`,
        { title, content },
        {   
            credentials: "include",
            withCredentials: true
         }
      );
      setIsEditing(false);
      refreshNotes();
    } catch (error) {
      console.error("Failed to update note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      {isEditing ? (
        <>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full p-2 border rounded"
          />
          <div className="mt-3 flex gap-3">
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-1 rounded"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 text-white px-4 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {content || "No content"}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-1 rounded"
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
}
