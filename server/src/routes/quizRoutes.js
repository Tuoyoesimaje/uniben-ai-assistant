const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

// Generate quiz
router.post('/generate/pdf',
  authMiddleware,
  requireRole('student', 'staff'),
  upload.single('pdf'),
  quizController.generateFromPDF
);

router.post('/generate/text',
  authMiddleware,
  requireRole('student', 'staff'),
  quizController.generateFromText
);

// Take quiz
router.get('/:id', authMiddleware, quizController.getQuiz);
router.get('/:quizId/question/:questionIndex', authMiddleware, quizController.getQuestionDetails);

// Submit quiz
router.post('/:id/submit', authMiddleware, quizController.submitQuiz);

// Get results
router.get('/:id/results', authMiddleware, quizController.getResults);

module.exports = router;