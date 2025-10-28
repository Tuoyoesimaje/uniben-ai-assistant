const Quiz = require('../models/Quiz');
const { extractTextFromPDF } = require('../services/pdfExtractor');
const { generateQuiz } = require('../services/quizGenerator');

exports.generateFromPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const text = await extractTextFromPDF(req.file.buffer);
    const quizData = await generateQuiz(text, 15, req.body.title || 'PDF Quiz');

    const quiz = new Quiz({
      userId: req.user.id,
      title: quizData.title,
      source: 'pdf',
      questions: quizData.questions
    });

    await quiz.save();

    res.json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        numberOfQuestions: quiz.questions.length,
        timeLimit: quiz.timeLimit
      }
    });
  } catch (error) {
    console.error('PDF quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate quiz from PDF' });
  }
};

exports.generateFromText = async (req, res) => {
  try {
    const { text, title } = req.body;

    if (!text || text.trim().length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Text must be at least 100 characters'
      });
    }

    const quizData = await generateQuiz(text, 15, title || 'Practice Quiz');

    const quiz = new Quiz({
      userId: req.user.id,
      title: quizData.title,
      source: 'text',
      questions: quizData.questions
    });

    await quiz.save();

    res.json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        numberOfQuestions: quiz.questions.length,
        timeLimit: quiz.timeLimit
      }
    });
  } catch (error) {
    console.error('Text quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate quiz' });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Send all necessary data for quiz functionality
    const sanitized = {
      id: quiz._id,
      title: quiz.title,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options,
        hint: q.hint, // Include hints for the 15-second timer
        correctAnswer: q.correctAnswer, // Include for immediate feedback
        explanation: q.explanation // Include for showing when wrong
      }))
    };

    res.json({ success: true, quiz: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getQuestionDetails = async (req, res) => {
  try {
    const { quizId, questionIndex } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const question = quiz.questions[questionIndex];

    res.json({
      success: true,
      hint: question.hint,
      explanation: question.explanation,
      correctAnswer: question.correctAnswer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    console.log('Submit request received:', { quizId: req.params.id, answers, timeSpent });

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      console.log('Quiz not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    console.log('Quiz found:', quiz._id);
    console.log('Quiz questions:', quiz.questions.length);

    // Calculate results
    let correctAnswers = 0;
    const answerDetails = [];

    Object.entries(answers).forEach(([index, answer]) => {
      const question = quiz.questions[index];
      const isCorrect = answer.selected === question.correctAnswer;

      console.log(`Question ${index}: selected=${answer.selected}, correct=${question.correctAnswer}, isCorrect=${isCorrect}`);

      if (isCorrect) correctAnswers++;

      answerDetails.push({
        questionIndex: parseInt(index),
        selectedAnswer: answer.selected,
        isCorrect,
        attempts: answer.attempts || 1
      });
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    quiz.results = {
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      incorrectAnswers: quiz.questions.length - correctAnswers,
      answers: answerDetails,
      timeSpent,
      completedAt: new Date()
    };

    console.log('Saving quiz results:', quiz.results);
    await quiz.save();

    console.log('Quiz submitted successfully');
    res.json({
      success: true,
      results: quiz.results
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit quiz' });
  }
};

exports.getResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz || !quiz.results) {
      return res.status(404).json({ success: false, message: 'Results not found' });
    }

    res.json({
      success: true,
      quiz: {
        title: quiz.title,
        results: quiz.results,
        questions: quiz.questions // Now send everything for review
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};