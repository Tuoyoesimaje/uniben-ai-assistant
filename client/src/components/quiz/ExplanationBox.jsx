import { motion } from 'framer-motion';

export default function ExplanationBox({ correctAnswer, explanation, options }) {
  const correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctAnswer);
  const correctText = options[correctIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-4 bg-info/10 border-2 border-info rounded-xl p-6"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">💡</span>
        <div className="flex-1">
          <h3 className="font-semibold text-info text-lg mb-3">Let me help you out!</h3>

          <div className="bg-success/10 border border-success/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-neutral-600 mb-1">The correct answer is:</p>
            <p className="font-semibold text-neutral-700">{correctAnswer}) {correctText}</p>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-xl">📖</span>
            <div>
              <h4 className="font-medium text-neutral-700 mb-1">Here's why:</h4>
              <p className="text-neutral-600 leading-relaxed">{explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}