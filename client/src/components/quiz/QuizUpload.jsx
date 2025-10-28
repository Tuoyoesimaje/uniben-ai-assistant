import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Upload, FileText, Lock } from 'lucide-react';
import Navbar from '../shared/Navbar';

export default function QuizUpload() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pdf');
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a PDF file');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;

      if (activeTab === 'pdf') {
        if (!file) {
          setError('Please select a PDF file');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('title', title || file.name.replace('.pdf', ''));

        response = await axios.post('/api/quiz/generate/pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        if (!text || text.length < 100) {
          setError('Please enter at least 100 characters');
          setLoading(false);
          return;
        }

        response = await axios.post('/api/quiz/generate/text', {
          text,
          title: title || 'Practice Quiz'
        });
      }

      navigate(`/quiz/start/${response.data.quiz.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is guest
  if (user?.role === 'guest') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 pt-20 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            Login Required
          </h2>
          <p className="text-neutral-600 mb-6">
            The quiz feature is available for students and staff only. Create an account to generate quizzes from your study notes!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Login as Student
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Login as Staff
            </button>
          </div>
        </div>
      </div>
    </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 pt-20 p-6">
        <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-700 mb-2 flex items-center gap-3">
            <span className="text-4xl">📚</span>
            <span>Create Practice Quiz</span>
          </h1>
          <p className="text-neutral-600">
            Upload a PDF or paste text to generate questions
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pdf'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span className="text-lg">📄</span>
              <span>Upload PDF</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'text'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span className="text-lg">📝</span>
              <span>Paste Text</span>
            </button>
          </div>

          <form onSubmit={handleGenerate}>
            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-neutral-700 font-medium mb-2">
                Quiz Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Data Structures Practice"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* PDF Upload */}
            {activeTab === 'pdf' && (
              <div className="mb-6">
                <label className="block w-full">
                  <div className={`
                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${file
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-neutral-300 hover:border-emerald-400 hover:bg-neutral-50'
                    }
                  `}>
                    <Upload className="mx-auto mb-3 text-emerald-500" size={48} />
                    <p className="font-medium text-neutral-700 mb-1">
                      {file ? file.name : 'Drop PDF here or click to upload'}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Max file size: 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Text Input */}
            {activeTab === 'text' && (
              <div className="mb-6">
                <label className="block text-neutral-700 font-medium mb-2">
                  Paste your study material
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your notes, textbook content, or any study material here..."
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-emerald-500 focus:outline-none resize-none"
                  rows={12}
                />
                <p className="text-sm text-neutral-500 mt-2">
                  {text.length} / 100 characters minimum
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Questions...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">✨</span>
                  <span>Generate Quiz</span>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}