"use client";

import { useState, useEffect } from "react";
import styles from "./QuestionsUploadForm.module.css";

const QuestionsUploadForm = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Create book, 2: Add questions
  const [questionsBook, setQuestionsBook] = useState(null);
  const [bookFormData, setBookFormData] = useState({
    title: "",
    board: "",
    class: "",
    subject: "",
    chapterName: "",
    topic: "",
    semester: "",
    year: "",
    part: "",
    description: "",
    language: "English",
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    questionType: "mcq",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    difficulty: "medium",
    explanation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleBookFormChange = (e) => {
    const { name, value } = e.target;
    setBookFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", bookFormData.title);
      formDataToSend.append("board", bookFormData.board);
      formDataToSend.append("class", bookFormData.class);
      formDataToSend.append("subject", bookFormData.subject);

      if (bookFormData.chapterName)
        formDataToSend.append("chapter_name", bookFormData.chapterName);
      if (bookFormData.topic)
        formDataToSend.append("topic", bookFormData.topic);
      if (bookFormData.semester)
        formDataToSend.append("semester", bookFormData.semester);
      if (bookFormData.year) formDataToSend.append("year", bookFormData.year);
      if (bookFormData.part) formDataToSend.append("part", bookFormData.part);
      if (bookFormData.description)
        formDataToSend.append("description", bookFormData.description);
      formDataToSend.append("language", bookFormData.language);

      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://adhyaan.onrender.com/api/v1";
      const response = await fetch(`${apiUrl}/content/questions-book`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create questions book");
      }

      const data = await response.json();
      setQuestionsBook(data);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!currentQuestion.questionText.trim()) {
      setError("Question text is required");
      return;
    }

    if (
      currentQuestion.questionType === "mcq" &&
      currentQuestion.options.filter((o) => o.trim()).length < 2
    ) {
      setError("MCQ must have at least 2 options");
      return;
    }

    if (!currentQuestion.correctAnswer.trim()) {
      setError("Correct answer is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const questionData = {
        book_id: questionsBook.id,
        question_text: currentQuestion.questionText,
        question_type: currentQuestion.questionType,
        correct_answer: currentQuestion.correctAnswer,
        marks: parseInt(currentQuestion.marks),
        difficulty: currentQuestion.difficulty,
      };

      if (currentQuestion.questionType === "mcq") {
        questionData.options = currentQuestion.options.filter((o) => o.trim());
      }

      if (currentQuestion.explanation) {
        questionData.explanation = currentQuestion.explanation;
      }

      const token = localStorage.getItem("token");
      // const apiUrl = "https://adhyaan.up.railway.app/api/v1";
      const apiUrl = "http://localhost:8000/api/v1";
      const response = await fetch(`${apiUrl}/content/questions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add question");
      }

      const data = await response.json();
      setQuestions((prev) => [...prev, data]);

      // Reset current question
      setCurrentQuestion({
        questionText: "",
        questionType: "mcq",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 1,
        difficulty: "medium",
        explanation: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onSuccess(questionsBook);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setQuestionsBook(null);
    setBookFormData({
      title: "",
      board: "",
      class: "",
      subject: "",
      chapterName: "",
      topic: "",
      semester: "",
      year: "",
      part: "",
      description: "",
      language: "English",
    });
    setQuestions([]);
    setCurrentQuestion({
      questionText: "",
      questionType: "mcq",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
      difficulty: "medium",
      explanation: "",
    });
    setError("");
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>❓ {step === 1 ? "Create Questions Bank" : "Add Questions"}</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            &times;
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleCreateBook} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Question Bank Title *</label>
              <input
                type="text"
                name="title"
                value={bookFormData.title}
                onChange={handleBookFormChange}
                placeholder="e.g., Mathematics Practice Questions"
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Board *</label>
                <select
                  name="board"
                  value={bookFormData.board}
                  onChange={handleBookFormChange}
                  required
                >
                  <option value="">Select Board</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">IB</option>
                  <option value="Cambridge">Cambridge</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Class *</label>
                <input
                  type="text"
                  name="class"
                  value={bookFormData.class}
                  onChange={handleBookFormChange}
                  placeholder="e.g., 10"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={bookFormData.subject}
                  onChange={handleBookFormChange}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Chapter (Optional)</label>
                <input
                  type="text"
                  name="chapterName"
                  value={bookFormData.chapterName}
                  onChange={handleBookFormChange}
                  placeholder="e.g., Algebra"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Topic (Optional)</label>
                <input
                  type="text"
                  name="topic"
                  value={bookFormData.topic}
                  onChange={handleBookFormChange}
                  placeholder="e.g., Quadratic Equations"
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleClose}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? "Creating..." : "Create & Add Questions"}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.form}>
            <div className={styles.questionsCount}>
              📝 {questions.length} question{questions.length !== 1 ? "s" : ""}{" "}
              added
            </div>

            <div className={styles.formGroup}>
              <label>Question Text *</label>
              <textarea
                name="questionText"
                value={currentQuestion.questionText}
                onChange={handleQuestionChange}
                placeholder="Enter the question..."
                rows="3"
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Question Type *</label>
                <select
                  name="questionType"
                  value={currentQuestion.questionType}
                  onChange={handleQuestionChange}
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="long_answer">Long Answer</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Marks *</label>
                <input
                  type="number"
                  name="marks"
                  value={currentQuestion.marks}
                  onChange={handleQuestionChange}
                  min="1"
                  max="100"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Difficulty *</label>
                <select
                  name="difficulty"
                  value={currentQuestion.difficulty}
                  onChange={handleQuestionChange}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {currentQuestion.questionType === "mcq" && (
              <div className={styles.optionsGroup}>
                <label>Options *</label>
                {currentQuestion.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className={styles.optionInput}
                  />
                ))}
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Correct Answer *</label>
              {currentQuestion.questionType === "mcq" ? (
                <select
                  name="correctAnswer"
                  value={currentQuestion.correctAnswer}
                  onChange={handleQuestionChange}
                  required
                >
                  <option value="">Select correct option</option>
                  {currentQuestion.options.map(
                    (option, index) =>
                      option.trim() && (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ),
                  )}
                </select>
              ) : currentQuestion.questionType === "true_false" ? (
                <select
                  name="correctAnswer"
                  value={currentQuestion.correctAnswer}
                  onChange={handleQuestionChange}
                  required
                >
                  <option value="">Select answer</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              ) : (
                <input
                  type="text"
                  name="correctAnswer"
                  value={currentQuestion.correctAnswer}
                  onChange={handleQuestionChange}
                  placeholder="Enter the correct answer"
                  required
                />
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Explanation (Optional)</label>
              <textarea
                name="explanation"
                value={currentQuestion.explanation}
                onChange={handleQuestionChange}
                placeholder="Explain the correct answer..."
                rows="2"
              />
            </div>

            <div className={styles.questionActions}>
              <button
                type="button"
                onClick={handleAddQuestion}
                disabled={loading}
                className={styles.addBtn}
              >
                {loading ? "Adding..." : "+ Add Question"}
              </button>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleClose}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className={styles.submitBtn}
              >
                Finish ({questions.length} questions)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsUploadForm;
