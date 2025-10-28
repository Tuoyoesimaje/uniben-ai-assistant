const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateQuiz(text, numberOfQuestions = 15, title = 'Practice Quiz') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Generate exactly ${numberOfQuestions} multiple-choice questions from this content.

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no extra text.

Content:
${text.substring(0, 15000)} // Limit to avoid token limits

Requirements:
1. Each question tests understanding, not memorization
2. Provide exactly 4 options labeled A, B, C, D
3. Include a helpful HINT for each question (1-2 sentences that guide the user without revealing the answer, keep under 200 characters)
4. Include detailed EXPLANATION for the correct answer with examples
5. Mix difficulty levels appropriately
6. Make sure correctAnswer is exactly one of: A, B, C, D

IMPORTANT: Every question MUST have both "hint" and "explanation" fields. Do not skip these fields.

Return this EXACT JSON structure:
{
  "questions": [
    {
      "question": "What is the main topic discussed?",
      "options": ["Topic A", "Topic B", "Topic C", "Topic D"],
      "correctAnswer": "B",
      "hint": "Consider the primary focus of the content and what the author is trying to explain.",
      "explanation": "The correct answer is B because the content primarily discusses this topic in detail with supporting examples."
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let response = result.response.text().trim();

    console.log('AI API Response:', response);

    // Clean markdown formatting if present
    response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    console.log('Cleaned Response:', response);

    const quizData = JSON.parse(response);

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz format');
    }

    // Ensure every question has a hint and explanation, and trim hints to 200 characters
    quizData.questions.forEach(q => {
      if (!q.hint || !q.hint.trim()) {
        q.hint = "Consider the context of the question and think about what the most logical answer might be.";
      } else if (q.hint.length > 200) {
        q.hint = q.hint.substring(0, 197) + "...";
      }

      if (!q.explanation || !q.explanation.trim()) {
        q.explanation = "The correct answer is as specified. Review the content for more details.";
      }
    });

    return {
      title,
      questions: quizData.questions.slice(0, numberOfQuestions)
    };
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw new Error('Failed to generate quiz');
  }
}

module.exports = { generateQuiz };