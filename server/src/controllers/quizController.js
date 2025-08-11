const Quiz = require("../models/Quiz");

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().select("-answers");
    res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select("-answers");

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.status(500).send("Server Error");
  }
};

// Get quiz by video id
exports.getQuizByVideo = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ video: req.params.videoId }).select(
      "-answers"
    );
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Create new quiz
exports.createQuiz = async (req, res) => {
  try {
    const newQuiz = new Quiz({
      ...req.body,
    });

    const quiz = await newQuiz.save();
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.status(500).send("Server Error");
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    await quiz.remove();
    res.json({ msg: "Quiz removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.status(500).send("Server Error");
  }
};

// Submit quiz attempt
exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const { answers } = req.body;
    let score = 0;
    const results = [];

    // Calculate score
    quiz.questions.forEach((question, index) => {
      const correctIndex = question.options.findIndex((o) => o.isCorrect);
      const isCorrect = String(correctIndex) === String(answers[index]);
      if (isCorrect) score++;
      results.push({
        questionId: question._id,
        isCorrect,
      });
    });

    const finalScore = (score / quiz.questions.length) * 100;
    const passed = finalScore >= quiz.passingScore;

    res.json({
      score: finalScore,
      passed,
      results,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
