import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../shared/Navbar';

export default function QuizResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      console.log('Fetching results for quiz ID:', id);
      const response = await axios.get(`/api/quiz/${id}/results`);
      console.log('Results response:', response.data);
      console.log('Quiz data:', response.data.quiz);
      console.log('Results data:', response.data.quiz?.results);
      console.log('Answers data:', response.data.quiz?.results?.answers);
      setQuiz(response.data.quiz);
    } catch (error) {
      console.error('Failed to fetch results:', error);
      console.error('Error response:', error.response?.data);
      // Set empty quiz data to prevent crashes
      setQuiz({ results: null, questions: [] });
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (index) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "Outstanding! You're a star! 🌟";
    if (score >= 75) return "Great job! You're really getting it! 🎉";
    if (score >= 60) return "Good effort! You're on the right track! 💪";
    return "Nice try! Let's learn from this together! 📚";
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 pt-20 p-6">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-700 mb-2">
            🎉 Quiz Complete!
          </h1>
        </motion.div>

        {/* Score Card */}
        {quiz && quiz.results ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-soft p-8 mb-6 text-center"
          >
            <div className="mb-6">
              <div className="text-6xl font-bold text-primary-500 mb-2">
                {quiz.results.score || 0}%
              </div>
              <p className="text-xl text-neutral-700">
                {quiz.results.correctAnswers || 0} / {quiz.results.totalQuestions || 0}
              </p>
            </div>

            <p className="text-lg text-neutral-600 mb-6">
              {getScoreMessage(quiz.results.score || 0)}
            </p>

            <div className="flex justify-center gap-8 text-sm">
              <div>
                <div className="text-2xl mb-1">✅</div>
                <div className="font-semibold text-neutral-700">{quiz.results.correctAnswers || 0}</div>
                <div className="text-neutral-500">Correct</div>
              </div>
              <div>
                <div className="text-2xl mb-1">❌</div>
                <div className="font-semibold text-neutral-700">{quiz.results.incorrectAnswers || 0}</div>
                <div className="text-neutral-500">Incorrect</div>
              </div>
              <div>
                <div className="text-2xl mb-1">⏱️</div>
                <div className="font-semibold text-neutral-700">
                  {Math.floor((quiz.results.timeSpent || 0) / 60)}m {(quiz.results.timeSpent || 0) % 60}s
                </div>
                <div className="text-neutral-500">Time</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft p-8 mb-6 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <p>Loading quiz results...</p>
            </div>
          </div>
        )}

        {/* Review Section */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h2 className="text-xl font-bold text-neutral-700 mb-4">📚 Review Your Answers</h2>

          <div className="space-y-3">
            {quiz.results && quiz.results.answers ? quiz.results.answers.map((answer, idx) => {
              const question = quiz.questions[idx];
              const isExpanded = expandedQuestions.has(idx);

              return (
                <div
                  key={idx}
                  className={`border-2 rounded-xl overflow-hidden transition-all ${
                    answer.isCorrect ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'
                  }`}
                >
                  <button
                    onClick={() => !answer.isCorrect && toggleQuestion(idx)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-black/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{answer.isCorrect ? '✅' : '❌'}</span>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-700">Q{idx + 1}: {question.question}</p>
                        {answer.isCorrect && (
                          <p className="text-sm text-success mt-1">You got it right! Nice work! 💚</p>
                        )}
                      </div>
                    </div>
                    {!answer.isCorrect && (
                      <span className="text-neutral-400">{isExpanded ? '▲' : '▼'}</span>
                    )}
                  </button>

                  {!answer.isCorrect && isExpanded && (
                    <div className="px-4 pb-4 border-t border-current/10">
                      <div className="mt-3 space-y-2">
                        <div className="text-sm">
                          <span className="text-neutral-600">Your answer: </span>
                          <span className="font-medium text-error">
                            {answer.selectedAnswer}) {question.options[['A','B','C','D'].indexOf(answer.selectedAnswer)]}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-neutral-600">Correct answer: </span>
                          <span className="font-medium text-success">
                            {question.correctAnswer}) {question.options[['A','B','C','D'].indexOf(question.correctAnswer)]}
                          </span>
                        </div>
                        <div className="mt-3 p-3 bg-info/10 rounded-lg">
                          <p className="text-sm font-medium text-neutral-700 mb-1">📖 Explanation:</p>
                          <p className="text-sm text-neutral-600">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-8 text-gray-500">
                No results available
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => navigate('/quiz')}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <span>New Quiz</span>
            </span>
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="flex-1 py-3 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl font-medium hover:border-primary-300 transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <span>Back to Chat</span>
            </span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}