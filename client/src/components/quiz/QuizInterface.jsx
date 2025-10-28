import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import QuestionCard from './QuestionCard';
import HintBox from './HintBox';
import ExplanationBox from './ExplanationBox';
import ProgressBar from './ProgressBar';
import Timer from './Timer';

export default function QuizInterface() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hint, setHint] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [hintTimer, setHintTimer] = useState(null);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeRemaining === null) return;
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // 15-second hint timer
  useEffect(() => {
    if (showResult || showHint || !quiz || !quiz.questions || !quiz.questions[currentQuestion]) {
      console.log('Hint timer not set up. Conditions:', { showResult, showHint, hasQuiz: !!quiz, hasQuestions: !!quiz?.questions, hasCurrentQuestion: !!quiz?.questions?.[currentQuestion] });
      return;
    }

    console.log('Setting up hint timer for question:', currentQuestion);
    console.log('Quiz data:', quiz.questions[currentQuestion]);

    const timer = setTimeout(() => {
      const question = quiz.questions[currentQuestion];
      console.log('Hint timer triggered for question:', currentQuestion);
      console.log('Question hint:', question.hint);
      console.log('Question data:', question);

      if (question && question.hint && question.hint.trim()) {
        console.log('Showing hint:', question.hint);
        setHint(question.hint);
        setShowHint(true);
      } else {
        console.log('No hint available for this question - setting default hint');
        setHint('Consider the context of the question and think about what the most logical answer might be.');
        setShowHint(true);
      }
    }, 15000); // Back to 15 seconds

    setHintTimer(timer);

    return () => clearTimeout(timer);
  }, [currentQuestion, showResult, showHint, quiz]);

  const fetchQuiz = async () => {
    try {
      console.log('Fetching quiz with ID:', id);
      const response = await axios.get(`/api/quiz/${id}`);
      console.log('Quiz response:', response.data);
      console.log('Quiz questions:', response.data.quiz?.questions);

      if (response.data.success && response.data.quiz) {
        setQuiz(response.data.quiz);
        setTimeRemaining(response.data.quiz.timeLimit);
      } else {
        console.error('Invalid quiz response:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer) => {
    // Clear hint timer
    if (hintTimer) {
      clearTimeout(hintTimer);
      setHintTimer(null);
    }

    // Get current question data
    if (!quiz || !quiz.questions || !quiz.questions[currentQuestion]) {
      console.error('Quiz or question data not available');
      return;
    }

    const question = quiz.questions[currentQuestion];
    console.log('Selected answer:', answer);
    console.log('Correct answer:', question.correctAnswer);
    console.log('Question data:', question);
    console.log('Question hint:', question.hint);
    console.log('Question explanation:', question.explanation);

    const correct = answer === question.correctAnswer;
    console.log('Is correct:', correct);

    // Record the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: {
        selected: answer,
        isCorrect: correct
      }
    }));

    // Set correct answer for display
    setCorrectAnswer(question.correctAnswer);

    // Show result immediately
    setIsCorrect(correct);
    setShowResult(true);

    // Auto-advance after 2 seconds for correct answers, 12 seconds for wrong answers (to read explanation)
    const delay = correct ? 2000 : 12000;
    const timer = setTimeout(() => {
      setShowResult(false);
      goToNextQuestion();
    }, delay);
    setAutoAdvanceTimer(timer);
  };

  const goToNextQuestion = () => {
    // Clear any pending auto-advance timer
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }

    if (quiz && quiz.questions && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowHint(false);
      setShowResult(false);
      setIsCorrect(false);
      setHint('');
      setCorrectAnswer('');
      setHintTimer(null);
    }
  };

  const goToPreviousQuestion = () => {
    // Clear any pending auto-advance timer
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }

    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowHint(false);
      setShowResult(false);
      setIsCorrect(false);
      setHint('');
      setCorrectAnswer('');
      setHintTimer(null);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting quiz with answers:', answers);
      console.log('Time spent:', quiz.timeLimit - timeRemaining);

      const response = await axios.post(`/api/quiz/${id}/submit`, {
        answers,
        timeSpent: quiz.timeLimit - timeRemaining
      });

      console.log('Submit response:', response.data);
      navigate(`/quiz/results/${id}`);
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response?.data);
      // Still navigate to results even if there's an error
      navigate(`/quiz/results/${id}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!quiz || !quiz.questions) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const question = quiz.questions[currentQuestion];
  const currentAnswer = answers[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-xl">📚</span>
              <span>{quiz.title}</span>
            </span>
            <ProgressBar current={currentQuestion + 1} total={quiz.questions.length} />
          </div>
          <Timer timeRemaining={timeRemaining} />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionCard
              question={question}
              questionNumber={currentQuestion + 1}
              selectedAnswer={currentAnswer?.selected}
              onAnswerSelect={handleAnswerSelect}
              disabled={showResult}
              correctAnswer={correctAnswer}
              isCorrect={isCorrect}
              showResult={showResult}
              currentQuestionIndex={currentQuestion}
              answers={answers}
            />
          </motion.div>
        </AnimatePresence>

        {/* Hint Box */}
        <AnimatePresence>
          {showHint && !showResult && <HintBox hint={hint} />}
        </AnimatePresence>

        {/* Explanation Box when wrong */}
        <AnimatePresence>
          {showResult && !isCorrect && <ExplanationBox correctAnswer={question.correctAnswer} explanation={question.explanation} options={question.options} />}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:border-gray-300 disabled:opacity-50 transition-all"
          >
            ← Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Submit Quiz 🎯
            </button>
          ) : (
            <button
              onClick={goToNextQuestion}
              disabled={!currentAnswer}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 transition-all"
            >
              Next Question →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}