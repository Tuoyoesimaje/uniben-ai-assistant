import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

export default function HintBox({ hint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-6"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Lightbulb className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-800 text-lg mb-2">Hint</h3>
          <p className="text-blue-700 leading-relaxed">{hint}</p>
          <p className="mt-3 text-sm text-blue-600 font-medium">
            Think carefully and try again!
          </p>
        </div>
      </div>
    </motion.div>
  );
}