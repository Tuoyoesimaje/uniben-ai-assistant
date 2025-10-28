import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../shared/Navbar';

export default function QuizStart() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`/api/quiz/${id}`);
      setQuiz(response.data.quiz);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 pt-20 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-soft p-8">
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">📚</span>
          <h1 className="text-3xl font-bold text-gray-700 mb-2">
            Quiz Ready!
          </h1>
          <p className="text-gray-600">
            {quiz.title}
          </p>
          <p className="text-xs text-gray-500 mt-1">Edit title ↗</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl mb-2">❓</div>
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {quiz.questions.length}
            </p>
            <p className="text-sm text-gray-600">Questions</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl mb-2">⏱️</div>
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {Math.floor(quiz.timeLimit / 60)}
            </p>
            <p className="text-sm text-gray-600">Minutes</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-3xl font-bold text-gray-800 mb-1">
              Medium
            </p>
            <p className="text-sm text-gray-600">Level</p>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-xl">💡</span>
            <span>Quick Tips</span>
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-lg">🧘‍♀️</span>
              <span>Take a deep breath! You've prepared for this.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">👀</span>
              <span>Read each question carefully before answering.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span>Don't worry about the clock too much, stay focused.</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => navigate(`/quiz/take/${id}`)}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span className="text-lg">🚀</span>
          <span>Start Quiz</span>
        </button>

        <button
          onClick={() => navigate('/quiz')}
          className="w-full mt-3 py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg">←</span>
          <span>Back to Upload</span>
        </button>
      </div>
    </div>
    </>
  );
}