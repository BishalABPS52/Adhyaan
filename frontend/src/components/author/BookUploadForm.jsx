"use client";

import { useState, useEffect } from "react";
import styles from "./BookUploadForm.module.css";
import {
  uploadDocumentToVercelBlob,
  uploadCoverImageToVercelBlob,
  formatFileSize,
} from "../../services/vercelBlobService";
import BookPDFViewer from "../BookPDFViewer";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const BookUploadForm = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [bookType, setBookType] = useState(""); // 'indie' or 'academic'
  const [boardType, setBoardType] = useState(""); // 'board_related' or 'open_board'
  const [academicUploadType, setAcademicUploadType] = useState("full_book"); // 'full_book' or 'chapter_wise'

  // Cascading dropdown state (board related)
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  // Year/Semester structure from backend
  const [yearSemStructure, setYearSemStructure] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedPart, setSelectedPart] = useState("");

  // Form data
  const [bookName, setBookName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [documentProvider, setDocumentProvider] = useState("");

  // Indie book fields
  const [indieData, setIndieData] = useState({
    author_name: "",
    genre: "",
    publication_name: "",
    published_year: new Date().getFullYear(),
    description: "",
  });

  // File state
  const [bookFile, setBookFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  // Upload state
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

  // Success & Preview state
  const [uploadedData, setUploadedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Initial load: boards
  useEffect(() => {
    fetch(`${API_BASE}/books/academic/boards`)
      .then((r) => r.json())
      .then((data) => setBoards(data.boards || []))
      .catch(console.error);
  }, []);

  // Load courses when board changes
  useEffect(() => {
    if (selectedBoard) {
      fetch(
        `${API_BASE}/books/academic/courses?board=${encodeURIComponent(selectedBoard)}`,
      )
        .then((r) => r.json())
        .then((data) => setCourses(data.courses || []))
        .catch(() => setCourses([]));
      setSelectedCourse("");
      setYearSemStructure(null);
    }
  }, [selectedBoard]);

  // Load year/semester structure when course changes
  useEffect(() => {
    if (selectedCourse) {
      fetch(
        `${API_BASE}/books/academic/year-semester?board=${encodeURIComponent(selectedBoard)}&course=${encodeURIComponent(selectedCourse)}`,
      )
        .then((r) => r.json())
        .then((data) => setYearSemStructure(data))
        .catch(() => setYearSemStructure(null));
      setSelectedYear("");
      setSelectedSemester("");
      setSelectedPart("");
    }
  }, [selectedCourse]);

  const validateStep = () => {
    setError("");
    if (step === 1 && !bookType) {
      setError("Please select a book type");
      return false;
    }

    // Academic Flow
    if (bookType === "academic") {
      if (step === 2 && !boardType) {
        setError("Please select category");
        return false;
      }
      if (step === 3 && boardType === "board_related" && !selectedBoard) {
        setError("Please select a board");
        return false;
      }
      if (step === 4 && boardType === "board_related" && !selectedCourse) {
        setError("Please select a course/program");
        return false;
      }
      if (step === 5 && boardType === "board_related" && yearSemStructure) {
        if (yearSemStructure.type === "grades" && !selectedYear) {
          setError("Please select grade");
          return false;
        }
        if (yearSemStructure.type === "year_semester" && !selectedYear) {
          setError("Please select year");
          return false;
        }
      }
      if (step === 6 && !subjectName.trim()) {
        setError("Please enter subject name");
        return false;
      }
      if (step === 7) {
        if (academicUploadType === "full_book" && !bookName.trim()) {
          setError("Please enter book name");
          return false;
        }
        if (academicUploadType === "chapter_wise" && !chapterName.trim()) {
          setError("Please enter chapter name");
          return false;
        }
      }
    }

    // Indie Flow
    if (bookType === "indie") {
      if (step === 2 && !bookName.trim()) {
        setError("Please enter book title");
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (bookType === "indie" && step === 2) {
        setStep(8); // Go to files
      } else if (
        bookType === "academic" &&
        boardType === "open_board" &&
        step === 2
      ) {
        setStep(6); // Skip board dropdowns
      } else {
        setStep((prev) => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (bookType === "indie" && step === 8) {
      setStep(2);
    } else if (
      bookType === "academic" &&
      boardType === "open_board" &&
      step === 6
    ) {
      setStep(2);
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookFile) {
      setError("Please select a book file");
      return;
    }

    setLoading(true);
    try {
      setUploadStatus("Uploading Document to Vercel Blob...");
      const folder = bookType === "indie" ? "indie" : "academic";
      const blobResponse = await uploadDocumentToVercelBlob(
        bookFile,
        folder,
        setUploadProgress,
      );

      let coverImageUrl = null;
      if (coverImage) {
        setUploadStatus("Uploading cover image...");
        const coverResponse = await uploadCoverImageToVercelBlob(coverImage);
        coverImageUrl = coverResponse.blob_url;
      }

      setUploadStatus("Securely storing in database...");
      const token = localStorage.getItem("adhyaan_token");
      let endpoint, requestBody;

      const finalTitle =
        bookType === "indie"
          ? bookName
          : academicUploadType === "full_book"
            ? bookName
            : chapterName;

      if (bookType === "indie") {
        endpoint = `${API_BASE}/author/indie`;
        requestBody = {
          book_name: bookName,
          author_name: indieData.author_name || null,
          genre: indieData.genre || null,
          published_year: parseInt(indieData.published_year) || null,
          publication_name: indieData.publication_name || null,
          description: indieData.description || null,
          file_url: blobResponse.blob_url,
          cover_image_url: coverImageUrl,
        };
      } else {
        endpoint = `${API_BASE}/author/academic`;
        requestBody = {
          board: boardType === "board_related" ? selectedBoard : "Others",
          book_name: finalTitle,
          course_name: selectedCourse || "General",
          level:
            boards.find((b) => b.name === selectedBoard)?.type ||
            "undergraduate",
          upload_type: academicUploadType,
          year: parseInt(selectedYear) || null,
          semester: parseInt(selectedSemester) || null,
          part: selectedPart || null,
          subject_name: subjectName,
          chapter_name:
            academicUploadType === "chapter_wise" ? chapterName : null,
          chapter_number:
            academicUploadType === "chapter_wise"
              ? parseInt(chapterNumber) || null
              : null,
          document_provider: documentProvider || null,
          file_url: blobResponse.blob_url,
          cover_image_url: coverImageUrl,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to save");

      // Store success data for the final preview screen
      setUploadedData({
        url: blobResponse.blob_url,
        title: finalTitle,
        type: bookFile.type,
        size: bookFile.size,
      });

      setUploadStatus("Document Processed Successfully!");
      setStep(9); // Success/Preview Step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    if (step === 9) return null;
    const totalSteps =
      bookType === "indie" ? 3 : boardType === "open_board" ? 5 : 8;
    let currentDot = step;

    if (bookType === "indie") {
      if (step === 8) currentDot = 3;
    } else if (boardType === "open_board") {
      if (step === 6) currentDot = 3;
      if (step === 7) currentDot = 4;
      if (step === 8) currentDot = 5;
    }

    return (
      <div className={styles.stepIndicator}>
        {[...Array(totalSteps)].map((_, i) => (
          <div
            key={i}
            className={`${styles.stepDot} ${i + 1 === currentDot ? styles.stepDotActive : ""}`}
          />
        ))}
      </div>
    );
  };

  if (showPreview && uploadedData) {
    return (
      <div className={styles.overlay} style={{ padding: 0 }}>
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <button
            className={styles.closeBtn}
            style={{
              position: "absolute",
              right: 20,
              top: 15,
              zIndex: 1000,
              color: "white",
              background: "rgba(0,0,0,0.5)",
              borderRadius: "50%",
            }}
            onClick={() => setShowPreview(false)}
          >
            &times;
          </button>
          <BookPDFViewer
            pdfUrl={uploadedData.url}
            bookTitle={uploadedData.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{step === 9 ? "Upload Successful!" : "Upload New Material"}</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
          >
            &times;
          </button>
        </div>

        <div className={styles.formContainer}>
          {renderStepIndicator()}
          {error && (
            <div className={styles.error}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              {error}
            </div>
          )}

          {/* 1. Type */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <h3>What kind of book?</h3>
              <div className={styles.typeGrid}>
                <button
                  className={`${styles.typeCard} ${bookType === "academic" ? styles.active : ""}`}
                  onClick={() => {
                    setBookType("academic");
                    setStep(2);
                  }}
                >
                  <div className={styles.icon}>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                    </svg>
                  </div>
                  <h4>Academic</h4>
                  <p>Coursebooks, notes, solutions</p>
                </button>
                <button
                  className={`${styles.typeCard} ${bookType === "indie" ? styles.active : ""}`}
                  onClick={() => {
                    setBookType("indie");
                    setStep(2);
                  }}
                >
                  <div className={styles.icon}>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  </div>
                  <h4>Indie / Open</h4>
                  <p>Fiction, novels, personal work</p>
                </button>
              </div>
            </div>
          )}

          {/* 2. Academic Category */}
          {step === 2 && bookType === "academic" && (
            <div className={styles.stepContent}>
              <h3>Select Category</h3>
              <div className={styles.typeGrid}>
                <button
                  className={styles.typeCard}
                  onClick={() => {
                    setBoardType("board_related");
                    setStep(3);
                  }}
                >
                  <div className={styles.icon}>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <h4>Board Related</h4>
                  <p>NEB, TU, KU, IOE, etc.</p>
                </button>
                <button
                  className={styles.typeCard}
                  onClick={() => {
                    setBoardType("open_board");
                    setStep(6);
                  }}
                >
                  <div className={styles.icon}>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <h4>Open Board</h4>
                  <p>General academic content</p>
                </button>
              </div>
            </div>
          )}

          {/* 3. Board */}
          {step === 3 &&
            bookType === "academic" &&
            boardType === "board_related" && (
              <div className={styles.stepContent}>
                <h3>Choose Board / University</h3>
                <div className={styles.formGroup}>
                  <label>Educational Board</label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                  >
                    <option value="">-- Choose Board --</option>
                    {boards.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

          {/* 4. Course */}
          {step === 4 &&
            bookType === "academic" &&
            boardType === "board_related" && (
              <div className={styles.stepContent}>
                <h3>Choose Course / Program</h3>
                <div className={styles.formGroup}>
                  <label>Course / Program</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

          {/* 5. Year/Semester */}
          {step === 5 &&
            bookType === "academic" &&
            boardType === "board_related" && (
              <div className={styles.stepContent}>
                <h3>Year & Semester</h3>
                {yearSemStructure && (
                  <div className={styles.formRow}>
                    {yearSemStructure.type === "grades" ? (
                      <div className={styles.formGroup}>
                        <label>Grade</label>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                        >
                          <option value="">-- Select --</option>
                          {yearSemStructure.grades.map((g) => (
                            <option key={g} value={g}>
                              Grade {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div className={styles.formGroup}>
                          <label>Year</label>
                          <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                          >
                            <option value="">-- Select --</option>
                            {Object.keys(yearSemStructure.data).map((y) => (
                              <option key={y} value={y}>
                                Year {y}
                              </option>
                            ))}
                          </select>
                        </div>
                        {selectedYear && (
                          <div className={styles.formGroup}>
                            <label>Semester / Part</label>
                            <select
                              value={selectedSemester}
                              onChange={(e) =>
                                setSelectedSemester(e.target.value)
                              }
                            >
                              <option value="">-- Select --</option>
                              {yearSemStructure.data[
                                selectedYear
                              ].semesters?.map((s) => (
                                <option key={s} value={s}>
                                  Semester {s}
                                </option>
                              ))}
                              {yearSemStructure.data[selectedYear].parts?.map(
                                (p) => (
                                  <option key={p} value={p}>
                                    Part {p}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* 6. Subject */}
          {step === 6 && bookType === "academic" && (
            <div className={styles.stepContent}>
              <h3>Subject Details</h3>
              <div className={styles.formGroup}>
                <label>Subject Name *</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Data Structures"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Document Provider (Optional)</label>
                <input
                  type="text"
                  value={documentProvider}
                  onChange={(e) => setDocumentProvider(e.target.value)}
                  placeholder="e.g. Acme Publication"
                />
              </div>
            </div>
          )}

          {/* 7. Upload Type & Name */}
          {step === 7 && bookType === "academic" && (
            <div className={styles.stepContent}>
              <h3>Scope & Title</h3>
              <div className={styles.formGroup}>
                <label>Is this a full book or a chapter?</label>
                <div className={styles.radioOptions}>
                  <label>
                    <input
                      type="radio"
                      checked={academicUploadType === "full_book"}
                      onChange={() => setAcademicUploadType("full_book")}
                    />{" "}
                    Full Book
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={academicUploadType === "chapter_wise"}
                      onChange={() => setAcademicUploadType("chapter_wise")}
                    />{" "}
                    Chapter Wise
                  </label>
                </div>
              </div>

              {academicUploadType === "full_book" ? (
                <div className={styles.formGroup}>
                  <label>Book Name *</label>
                  <input
                    type="text"
                    value={bookName}
                    onChange={(e) => setBookName(e.target.value)}
                    placeholder="e.g. Algorithms by Cormen"
                  />
                </div>
              ) : (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Chapter No.</label>
                    <input
                      type="number"
                      value={chapterNumber}
                      onChange={(e) => setChapterNumber(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Chapter Name *</label>
                    <input
                      type="text"
                      value={chapterName}
                      onChange={(e) => setChapterName(e.target.value)}
                      placeholder="e.g. Introduction to BFS"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2 (Indie): Details */}
          {step === 2 && bookType === "indie" && (
            <div className={styles.stepContent}>
              <h3>Book Details</h3>
              <div className={styles.formGroup}>
                <label>Book Title *</label>
                <input
                  type="text"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  placeholder="Title"
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Author</label>
                  <input
                    type="text"
                    value={indieData.author_name}
                    onChange={(e) =>
                      setIndieData((p) => ({
                        ...p,
                        author_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Genre</label>
                  <input
                    type="text"
                    value={indieData.genre}
                    onChange={(e) =>
                      setIndieData((p) => ({ ...p, genre: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={indieData.description}
                  onChange={(e) =>
                    setIndieData((p) => ({ ...p, description: e.target.value }))
                  }
                  rows="3"
                />
              </div>
            </div>
          )}

          {/* 8. Files */}
          {step === 8 && (
            <div className={styles.stepContent}>
              <h3>Finalize Content</h3>
              <div className={styles.formGroup}>
                <label>PDF/DOCX Document * (Max 30MB)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setBookFile(e.target.files[0])}
                />
                {bookFile && (
                  <div className={styles.fileName}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                    {bookFile.name} ({formatFileSize(bookFile.size)})
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Cover Image (Optional - JPG, PNG, Max 15MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files[0])}
                />
                {coverImage && (
                  <div className={styles.fileName}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    {coverImage.name}
                  </div>
                )}
              </div>

              {loading && (
                <div className={styles.loader}>
                  <div className={styles.progress}>
                    <div
                      className={styles.fill}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span>{uploadStatus}</span>
                </div>
              )}
            </div>
          )}

          {/* 9. Success Step */}
          {step === 9 && uploadedData && (
            <div className={styles.successStep}>
              <div className={styles.successIconBox}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                  <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"></path>
                  <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"></path>
                </svg>
              </div>
              <h3 className={styles.successTitle}>{uploadedData.title}</h3>
              <p className={styles.successSubtitle}>
                Your file has been uploaded and stored securely.
              </p>

              <div className={styles.successDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Public URL:</span>
                  <a
                    href={uploadedData.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.detailValue}
                  >
                    {uploadedData.url}
                  </a>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>File Specs:</span>
                  <span className={styles.detailValueText}>
                    {uploadedData.type.split("/")[1].toUpperCase()} •{" "}
                    {formatFileSize(uploadedData.size)}
                  </span>
                </div>
              </div>

              <button
                className={styles.nextBtn}
                onClick={() => setShowPreview(true)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: "8px" }}
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Full Preview
              </button>
            </div>
          )}

          <div className={styles.footer}>
            {step < 9 && (
              <>
                <button
                  className={styles.backBtn}
                  onClick={prevStep}
                  disabled={loading || step === 1}
                >
                  Back
                </button>
                {step < 8 ? (
                  <button className={styles.nextBtn} onClick={nextStep}>
                    Next
                  </button>
                ) : (
                  <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Upload Now"}
                  </button>
                )}
              </>
            )}
            {step === 9 && (
              <button
                className={styles.submitBtn}
                onClick={() => {
                  onSuccess && onSuccess();
                  onClose();
                }}
              >
                Done & Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookUploadForm;
