import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import toast from 'react-hot-toast';
import { LuCopy } from "react-icons/lu";
import { UserData } from "../context/UserContext";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import NoteViewer from "../components/NoteViewer";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TypographyEnhancedContent = ({ content, type }) => {
  const processContent = (rawContent) => {
    if (!rawContent) return '';

    return rawContent
      // Escape HTML to prevent injection
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

      // Headings
      .replace(/^#### (.*)$/gm, '<h4 class="text-lg mt-1 mb-2 leading-snug text-gray-800">$1</h4>')
      .replace(/^### (.*)$/gm, '<h3 class="text-xl mt-1 mb-2 leading-snug tracking-tight text-gray-800">$1</h3>')
      .replace(/^## (.*)$/gm, '<h2 class="text-xl mt-1 mb-2 leading-tight tracking-tight text-gray-800">$1</h2>')
      .replace(/^# (.*)$/gm, '<h1 class="text-[16px] mt-1 mb-1 leading-tight tracking-tight text-gray-900">$1</h1>')

      // Horizontal Rule
      .replace(/^---$/gm, '<hr class="my-8 border-t border-gray-300">')

      // Blockquotes
      .replace(/^> (.*)$/gm, '<blockquote class="pl-2 border-l-4 border-gray-300 italic text-gray-700 my-4">$1</blockquote>')

      // Ordered List
      .replace(/^\d+\.\s+(.*)$/gm, '<li class="ml-2 list-decimal my-1 leading-relaxed">$1</li>')

      // Unordered List
      .replace(/^[*-]\s+(.*)$/gm, '<li class="ml-2 list-disc my-1 leading-relaxed">$1</li>')

      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

      // Italics
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

      // Inline code
      .replace(/`([^`\n]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">$1</code>')

      // Code block (```)
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-1 rounded-md overflow-x-auto my-1"><code class="text-sm font-mono text-gray-800">$1</code></pre>')

      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline underline-offset-2" target="_blank" rel="noopener noreferrer">$1</a>')

      // Simple tables
      .replace(/^\|(.+)\|\n\|([-| ]+)\|\n((\|.*\|\n?)*)/gm, (match, headers, separator, rows) => {
        const headerHtml = headers.split('|').map(h => `<th class="px-4 py-2 border">${h.trim()}</th>`).join('');
        const rowHtml = rows.trim().split('\n').map(row =>
          `<tr>${row.split('|').map(c => `<td class="px-4 py-2 border">${c.trim()}</td>`).join('')}</tr>`
        ).join('');
        return `<table class="min-w-full border-collapse border my-4"><thead><tr>${headerHtml}</tr></thead><tbody>${rowHtml}</tbody></table>`;
      })

      // Paragraphs - only match non-empty lines that aren't already HTML elements
      .replace(/^(?!<h|<ul|<ol|<li|<pre|<blockquote|<hr|<table|<tr|<th|<td)([^<].+?)(?:\n|$)/gm, (match, content) => {
        return content.trim() ? `<p class="inoput my-3 leading-relaxed text-gray-700">${content.trim()}</p>` : '';
      })

      // Line breaks - only add <br> between paragraphs
      .replace(/\n\n+/g, '<br><br>');
  };

  const containerClass = "bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200";
  
  

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 tracking-tight">
        {type === 'generated' ? 'Generated Content' : 'Summarized Content'}
      </h2>
      <div className={containerClass}>
        <div className="flex items-center justify-end">
          <button
          onClick={() => {
            const text = document.querySelector('.inoput').innerText;
            navigator.clipboard.writeText(text);
            toast.success('Content copied to clipboard!', { duration: 2000 });
          }}
        ><LuCopy style={{ cursor: "pointer"}} /></button>
        </div>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: processContent(content) }}
        />
      </div>
    </div>
  );
};

const Home = () => {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const observerRef = useRef();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [summarisedContent, setSummarisedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const { user, loading, isAuth, fetchUser } = UserData();
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedNote, setSelectedNote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Format date to readable string
  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Filter notes based on search term
  const filteredNotes = user && user.notes ? user.notes.filter(
    (note) =>
      note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Sort notes based on sort order
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Intersection Observer for scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, entry.target.dataset.id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Attach observer to elements
  useEffect(() => {
    const elements = document.querySelectorAll('[data-animate="true"]');
    elements.forEach(el => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      elements.forEach(el => {
        if (observerRef.current) {
          observerRef.current.unobserve(el);
        }
      });
    };
  }, [sortedNotes, searchTerm, sortOrder]);
   const formtag = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 tracking-wide">
          Title
        </label>
        <div className="relative group">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 text-slate-900 placeholder-slate-400 bg-white border border-slate-200 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 group-hover:shadow-md"
            placeholder="Enter a descriptive title..."
          />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 tracking-wide">
          Content
        </label>
        <div className="relative group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 text-slate-900 placeholder-slate-400 bg-white border border-slate-200 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 resize-none group-hover:shadow-md"
            placeholder="Share your thoughts, ideas, or observations..."
          />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </div>
    </div>
  );
  const handleDataToMongoDb = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.post(
        `${VITE_API_URL}/api/notes/${user._id}/newnote`,
        { title, content },
        {
          credentials: "include",
          withCredentials: true,
        }
      );

      setTitle('');
      setContent('');
      setShowForm(false);
      await fetchUser();
    } catch (error) {
      console.error("Failed to add note:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async (noteId) => {
    try {
      const response = await axios.delete(
        `${VITE_API_URL}/api/notes/${user._id}/delete/${noteId}`,
        {
          credentials: "include",
          withCredentials: true,
        }
      );
      // console.log("Note deleted successfully:", response.data);
      await fetchUser();
    } catch (error) {
      console.error("Failed to delete note:", error.response?.data || error.message);
    }
  };
  const handleEdit = async (noteId) => {
    try {
      const noteToEdit = user.notes.find(note => note._id === noteId);
      if (noteToEdit) {
        setEditingNote(noteToEdit);
        setTitle(noteToEdit.title);
        setContent(noteToEdit.content);
        setShowForm(true);
      }
    } catch (error) {
      console.error("Failed to prepare note for editing:", error);
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.put(
        `${VITE_API_URL}/api/notes/${user._id}/updatepin/${editingNote._id}`,
        { title, content },
        {
          credentials: "include",
          withCredentials: true,
        }
      );

      setTitle('');
      setContent('');
      setShowForm(false);
      setEditingNote(null);
      await fetchUser();
    } catch (error) {
      console.error("Failed to update note:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContent = async (content) => {
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedContent("");

    const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API });

    try {
      // Use generateContentStream for streaming response
      const result = await genAI.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Generate a detailed analysis of the following topic: "${content}". 
                Please structure your response with:
                1. A main heading
                2. Key points as bullet points
                3. Each section should have a subheading
                4. Use markdown formatting for better readability
                5. Keep points concise and informative
                6. Include relevant examples where appropriate`,
              },
            ],
          },
        ],
      });

      let fullResponse = "";
      for await (const chunk of result) {
        fullResponse += chunk.text;
        setGeneratedContent(fullResponse);
      }
    } catch (err) {
      console.error("Error during content generation:", err);
      setGenerationError("Something went wrong while generating content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSummariseContent = async (content) => {
    setIsSummarizing(true);
    setGenerationError(null);
    setSummarisedContent("");

    const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API });

    try {
      const result = await genAI.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: "Summarize the following content in a concise way: " + content },
            ],
          },
        ],
      });

      let fullResponse = "";
      for await (const chunk of result) {
        fullResponse += chunk.text;
        setSummarisedContent(fullResponse);
      }
    } catch (err) {
      console.error("Error during content generation:", err);
      setGenerationError("Something went wrong while generating content.");
    } finally {
      setIsSummarizing(false);
    }
  };


  const viewNote = (note) => {
    // console.log('Selected note:', note);
    setSelectedNote(note);
    setGeneratedContent('');
    setSummarisedContent('');
    setGenerationError(null);
  };

  const goBackToList = () => {
    setSelectedNote(null);
  }

  if (selectedNote) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={goBackToList}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back to notes</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {selectedNote.title || "Untitled Note"}
            </h1>
            <div className="flex items-center">
             
              <button onClick={() => handleDelete(selectedNote._id)} className="p-1 text-gray-500 hover:text-red-600 yamini">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Calendar size={16} className="mr-1" />
            <span>
              Last updated:{" "}
              {formatDate(selectedNote.updatedAt || selectedNote.createdAt)}
            </span>
          </div>

          <NoteViewer
            selectedNote={selectedNote}
            refreshNotes={async () => {
              await fetchUser();
              // Find the updated note from the latest user.notes
              const updated = user.notes.find(n => n._id === selectedNote._id);
              if (updated) setSelectedNote(updated);
            }}
            userId={user._id}
          />

          <div className="flex justify-between items-center mb-6 mt-6">
            <button
              onClick={() => handleGenerateContent(selectedNote.title)}
              disabled={isGenerating}
              className={`bg-blue-500 text-white px-5 py-3 rounded-md hover:bg-blue-600 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </button>
            <button
              onClick={() => handleSummariseContent(selectedNote.content)}
              disabled={isSummarizing}
              className={`bg-blue-500 text-white px-5 py-3 rounded-md hover:bg-blue-600 ${isSummarizing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isSummarizing ? 'Summarizing...' : 'Summarise Content'}
            </button>
          </div>

          {generationError && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
              {generationError}
            </div>
          )}

          <div className="font-sans">
            {generatedContent && (
              <TypographyEnhancedContent
                content={generatedContent}
                type="generated"
              />
            )}

            {summarisedContent && (
              <TypographyEnhancedContent
                content={summarisedContent}
                type="summarised"
              />
            )}
          </div>

          <div className="flex justify-between items-center mb-6 mt-6">
            <button
              onClick={() => setShowHistory((prev) => !prev)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
            >
              {showHistory ? "Hide Edit History" : "View Edit History"}
            </button>
          </div>

          {showHistory && selectedNote.history && selectedNote.history.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-2">Edit History</h3>
              <ul className="space-y-6">
                {selectedNote.history.map((h, idx) => (
                  <li
                    key={idx}
                    className="group relative p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Timeline connector */}
                    {idx !== selectedNote.history.length - 1 && (
                      <div className="absolute left-8 -bottom-6 w-px h-6 bg-gradient-to-b from-blue-200 to-transparent"></div>
                    )}

                    {/* Version indicator */}
                    <div className="absolute -left-3 top-6 w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>

                    <div className="ml-6">
                      {/* Timestamp with icon */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">
                          {new Date(h.editedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full font-medium">
                          v{selectedNote.history.length - idx}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="font-bold text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {h.title}
                      </div>

                      {/* Content */}
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4 border-l-4 border-blue-100">
                        {h.content}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
  


  return(

    <div className="max-w-4xl mx-auto px-4 py-8">
      {showForm && (
         <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="mb-8 animate-in slide-in-from-top duration-300 ease-out w-full max-w-md relative">
        <form
          onSubmit={editingNote ? handleUpdateNote : handleDataToMongoDb}
          className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full space-y-6 transform transition-all duration-300"
        >
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">
              {editingNote ? 'Edit Note' : 'New Note'}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              {editingNote ? 'Update your note with new information' : 'Capture your thoughts and ideas'}
            </p>
          </div>

          {formtag()}

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={isLoading || (!title.trim() && !content.trim())}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                editingNote ? 'Update Note' : 'Add Note'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingNote(null);
                setTitle('');
                setContent('');
              }}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Optional Floating Effects */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10" />
      </div>
    </div>
      )}

      <div className="flex justify-between items-center mb-6 animate-in slide-in-from-top duration-500 ease-out">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          My Notes
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
        >
          <Plus size={18} />
          <span>New Note</span>
        </button>
      </div>

      <div className="mb-6 animate-in slide-in-from-top duration-700 ease-out">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={20} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 animate-in slide-in-from-top duration-900 ease-out">
        <span className="text-sm text-gray-600 font-medium">
          {sortedNotes.length} {sortedNotes.length === 1 ? 'note' : 'notes'}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {sortedNotes.length > 0 ? (
        <div className="space-y-6">
          {sortedNotes.map((note, index) => {
            const isVisible = visibleItems.has(note._id || note.id);
            return (
              <div
                key={note._id || note.id}
                data-id={note._id || note.id}
                data-animate="true"
                className={`
                  border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl 
                  transition-all duration-500 cursor-pointer group backdrop-blur-sm
                  transform hover:-translate-y-1 hover:scale-[1.02]
                  ${isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                  }
                `}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
                }}
                onClick={() => viewNote(note)}
              >
                <div className="px-6 py-5 bg-gradient-to-r from-white to-gray-50 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg mb-2 group-hover:text-blue-800 transition-colors duration-200">
                        {note.title || "Untitled Note"}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Calendar size={14} className="mr-2 group-hover:text-blue-500 transition-colors duration-200" />
                        <span className="group-hover:text-blue-600 transition-colors duration-200">
                          {formatDate(note.updatedAt || note.createdAt)}
                        </span>
                      </div>
                      {note.content && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors duration-200">
                          {note.content}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(note._id);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note._id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 animate-in fade-in duration-1000">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
          </div>
          <p className="text-gray-500 text-lg mb-4">No notes found</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    
    </div>

  );
};

export default Home;
