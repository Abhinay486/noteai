import React from 'react';
import { UserData } from '../context/UserContext';
import { FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notes = () => {
  const { user, loading } = UserData();

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return <div className="text-center mt-10">Please log in to view your notes.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Notes</h1>
        <Link
          to="/"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus size={18} />
          <span>New Note</span>
        </Link>
      </div>

      {user.notes && user.notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.notes.map((note) => (
            <Link
              key={note._id}
              to={`/note/${note._id}`}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-gray-800">{note.title || 'Untitled Note'}</h3>
                <FileText size={16} className="text-gray-400" />
              </div>
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {note.content}
              </p>
              <div className="text-xs text-gray-400 mt-2">
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notes yet</h3>
          <p className="text-gray-500 mt-2">Create your first note to get started</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus size={18} />
            <span>Create Note</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Notes; 