import React, { useState } from "react";
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
import { UserData } from "../context/UserContext";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
        return content.trim() ? `<p class="my-3 leading-relaxed text-gray-700">${content.trim()}</p>` : '';
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
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: processContent(content) }}
        />
      </div>
    </div>
  );
};

const Home = () => {
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
  const formtag = () => {
    return(
      <div className="space-y-4">
      <input
        type="text"
        name="title"
        id="title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        name="content"
        id="content"
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    );
  }
  const handleDataToMongoDb = async (e) => {
    e.preventDefault();
  
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required.");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in.");
      return;
    }
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/${user._id}/newnote`,
        { title, content },
        {
          withCredentials: true,
        }
      );
  
      setTitle('');
      setContent('');
      setShowForm(false);
      await fetchUser();
    } catch (error) {
      console.error("Failed to add note:", error.response?.data || error.message);
    }
  };
  const handleDelete = async (noteId) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/user/${user._id}/note/${noteId}`,
        {
          withCredentials: true,
        }
      );
      console.log("Note deleted successfully:", response.data);
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
  
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required.");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in.");
      return;
    }
  
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/${user._id}/note/${editingNote._id}`,
        { title, content },
        {
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
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedNote, setSelectedNote] = useState(null);
  if (loading) return <div className="text-center mt-10">Loading...</div>;

  if (!user || !user.notes) return <div className="text-center mt-10">No user or notes found.</div>;
  // Filter notes based on search term
  const filteredNotes = user.notes.filter(
    (note) =>
      note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort notes based on sort order
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);

    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // View note in full page
  const viewNote = (note) => {
    setSelectedNote(note);
    setGeneratedContent('');
    setSummarisedContent('');
    setGenerationError(null);
  };

  // Go back to notes list
  const goBackToList = () => {
    setSelectedNote(null);
  };

  const handleGenerateContent = async (content) => {
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedContent('');

    const apiKey = import.meta.env.VITE_GEMINI_API;
    if (!apiKey) {
      setGenerationError("Gemini API key not found. Please check your environment variables.");
      setIsGenerating(false);
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    try {
      const result = await model.generateContentStream({
        contents: [
          {
            role: "user",
            parts: [
              { text: `Generate a detailed analysis of the following topic: "${content}". 
              Please structure your response with:
              1. A main heading
              2. Key points as bullet points
              3. Each section should have a subheading
              4. Use markdown formatting for better readability
              5. Keep points concise and informative
              6. Include relevant examples where appropriate` },
            ],
          },
        ],
      });

      let fullResponse = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
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
    setSummarisedContent('');

    const apiKey = import.meta.env.VITE_GEMINI_API;
    if (!apiKey) {
      setGenerationError("Gemini API key not found. Please check your environment variables.");
      setIsSummarizing(false);
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    try {
      const result = await model.generateContentStream({
        contents: [
          {
            role: "user",
            parts: [
              { text: "Summarize the following content in a concise way: " + content },
            ],
          },
        ],
      });

      let fullResponse = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        setSummarisedContent(fullResponse);
      }
    } catch (err) {
      console.error("Error during content summarization:", err);
      setGenerationError("Something went wrong while summarizing content.");
    } finally {
      setIsSummarizing(false);
    }
  };

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

          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {selectedNote.content || "No content"}
            </p>
          </div>

          <div className="flex justify-between items-center mb-6 mt-6">
            <button
              onClick={() => handleGenerateContent(selectedNote.title)}
              disabled={isGenerating}
              className={`bg-blue-500 text-white px-5 py-3 rounded-md hover:bg-blue-600 ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </button>
            <button 
              onClick={() => handleSummariseContent(selectedNote.content)}
              disabled={isSummarizing}
              className={`bg-blue-500 text-white px-5 py-3 rounded-md hover:bg-blue-600 ${
                isSummarizing ? 'opacity-50 cursor-not-allowed' : ''
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {showForm && (
        <form
          onSubmit={editingNote ? handleUpdateNote : handleDataToMongoDb}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6 mb-8"
        >
          {formtag()}
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              {editingNote ? 'Update Note' : 'Add Note'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingNote(null);
                setTitle('');
                setContent('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Notes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus size={18} />
          <span>New Note</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600">
          {sortedNotes.length} notes
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {sortedNotes.length > 0 ? (
        <div className="space-y-4">
          {sortedNotes.map((note) => (
            <div
              key={note._id || note.id}
              className="border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => viewNote(note)}
            >
              <div className="px-4 py-3 bg-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">
                    {note.title || "Untitled Note"}
                  </h3>
                  <div className="flex items-center">
                    <button
                      className="p-1 text-gray-500 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add edit functionality here
                        handleEdit(note._id);
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-1 text-gray-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add delete functionality here
                        handleDelete(note._id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Calendar size={14} className="mr-1" />
                  <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                </div>
                {note.content && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {note.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No notes found</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-blue-600 hover:underline mt-2"
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
