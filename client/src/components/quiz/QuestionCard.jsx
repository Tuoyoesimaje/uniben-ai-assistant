import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function QuestionCard({ question, questionNumber, selectedAnswer, onAnswerSelect, disabled, correctAnswer, isCorrect, showResult, currentQuestionIndex, answers }) {
  const options = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white rounded-xl shadow-soft p-8">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-2">Question {questionNumber}</p>
        <h2 className="text-xl font-semibold text-gray-700 leading-relaxed flex items-start gap-3">
          <span className="text-2xl mt-1">🤔</span>
          <span>{question.question}</span>
        </h2>
        <p className="text-sm text-gray-500 mt-2">Select one of the options below.</p>
      </div>

      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const optionIsCorrect = correctAnswer && option === correctAnswer;
          const optionIsWrong = correctAnswer && isSelected && option !== correctAnswer;
          const hasBeenAnswered = selectedAnswer !== undefined;

          // Check if this question has been answered before (for navigation)
          const previousAnswer = answers && answers[currentQuestionIndex];
          const wasCorrect = previousAnswer && previousAnswer.isCorrect;
          const wasWrong = previousAnswer && !previousAnswer.isCorrect;

          return (
            <motion.button
              key={option}
              onClick={() => !disabled && !hasBeenAnswered && onAnswerSelect(option)}
              disabled={disabled || hasBeenAnswered}
              whileHover={!disabled && !isSelected && !hasBeenAnswered ? { scale: 1.01 } : {}}
              whileTap={!disabled && !hasBeenAnswered ? { scale: 0.99 } : {}}
              className={`
                w-full p-4 rounded-xl text-left font-medium transition-all
                ${showResult && optionIsCorrect ? 'bg-green-100 border-2 border-green-500' : ''}
                ${showResult && optionIsWrong ? 'bg-red-100 border-2 border-red-500' : ''}
                ${!showResult && previousAnswer && isSelected && wasCorrect ? 'bg-green-100 border-2 border-green-500' : ''}
                ${!showResult && previousAnswer && isSelected && wasWrong ? 'bg-red-100 border-2 border-red-500' : ''}
                ${isSelected && !showResult && !previousAnswer ? 'bg-blue-100 border-2 border-blue-500' : ''}
                ${!isSelected && !showResult && !hasBeenAnswered ? 'bg-gray-50 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50' : ''}
                ${!isSelected && !showResult && hasBeenAnswered ? 'bg-gray-100 border-2 border-gray-300 opacity-60' : ''}
                ${disabled || hasBeenAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700">
                  <span className="font-bold text-emerald-600 mr-3">{option})</span>
                  {question.options[index]}
                </span>
                {showResult && optionIsCorrect && isSelected && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                {showResult && optionIsWrong && (
                  <X className="w-5 h-5 text-red-600" />
                )}
                {!showResult && previousAnswer && isSelected && wasCorrect && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                {!showResult && previousAnswer && isSelected && wasWrong && (
                  <X className="w-5 h-5 text-red-600" />
                )}
                {isSelected && !showResult && !previousAnswer && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}