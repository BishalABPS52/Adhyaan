"use client";

import { useState } from "react";
import styles from "./BookUploadForm.module.css";
import {
  uploadDocumentToVercelBlob,
  uploadCoverImageToVercelBlob,
} from "../../services/vercelBlobService";

/**
 * Enhanced BookUploadForm Component with Vercel Blob Storage
 *
 * FEATURES:
 * - Level selection: Primary (1-8), Secondary (9-12), Undergraduate (Bachelor), Masters, Diploma
 * - Conditional fields based on level and upload type
 * - Chapter-wise upload with chapter number and name
 * - Full book upload with book name
 * - Auto-fills Board as "NEB" for primary/secondary
 * - Display format: "Chapter 1 - Basic Web Application | Web Application Programming"
 *
 * ARCHITECTURE: Frontend → Backend → Vercel Blob → Database
 */

const EnhancedBookUploadForm = ({ onClose, onSuccess }) => {
  const [bookType, setBookType] = useState(""); // 'indie' or 'academic'
  const [uploadType, setUploadType] = useState(""); // 'chapter_wise', 'full_book', or 'research_paper'

  const [indieData, setIndieData] = useState({
    title: "",
    genre: "",
    author_name: "",
    publication_name: "",
    published_year: new Date().getFullYear(),
    author_contact: "",
    description: "",
  });

  const [academicData, setAcademicData] = useState({
    title: "",
    level: "", // 'primary', 'secondary', 'undergraduate', 'masters', 'diploma'
    board: "NEB", // Default to NEB for primary/secondary
    class: "",
    year: "",
    part: "",
    semester: "",
    subject: "",
    chapter_number: "",
    chapter_name: "",
    course_name: "", // For undergraduate
    description: "",
    // Research paper fields
    authors: "",
    publication_year: "",
    keywords: "",
  });

  const [bookFile, setBookFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

  const handleIndieChange = (e) => {
    const { name, value } = e.target;
    setIndieData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAcademicChange = (e) => {
    const { name, value } = e.target;
    let updates = { [name]: value };

    // When level changes, reset/set default values
    if (name === "level") {
      if (value === "primary" || value === "secondary") {
        updates.board = "NEB"; // Auto-set Board to NEB
        updates.year = "";
        updates.part = "";
        updates.semester = "";
        updates.course_name = "";
      } else if (value === "undergraduate") {
        updates.board = ""; // Clear board for undergraduate
        updates.class = "Bachelor";
      } else if (value === "masters") {
        updates.board = ""; // Clear board for masters
        updates.class = "Masters";
      } else if (value === "diploma") {
        updates.board = ""; // Clear board for diploma
        updates.class = "Diploma";
      }
    }

    // Auto-calculate semester from year and part (for undergraduate, masters, diploma)
    if (
      (name === "year" || name === "part") &&
      ["undergraduate", "masters", "diploma"].includes(academicData.level)
    ) {
      const year =
        name === "year" ? parseInt(value) : parseInt(academicData.year);
      const part = name === "part" ? value : academicData.part;

      if (year && part) {
        const sem = (year - 1) * 2 + (part === "I" ? 1 : 2);
        updates.semester = sem.toString();
      }
    }

    // Auto-calculate year and part from semester (for undergraduate, masters, diploma)
    if (
      name === "semester" &&
      value &&
      ["undergraduate", "masters", "diploma"].includes(academicData.level)
    ) {
      const sem = parseInt(value);
      updates.year = Math.ceil(sem / 2).toString();
      updates.part = sem % 2 === 1 ? "I" : "II";
    }

    setAcademicData((prev) => ({ ...prev, ...updates }));
  };

  const getPrimaryClassOptions = () => {
    return ["1", "2", "3", "4", "5", "6", "7", "8"];
  };

  const getSecondaryClassOptions = () => {
    return ["9", "10", "11", "12"];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUploadProgress(0);
    setUploadStatus("");

    if (!bookFile) {
      setError("Please upload a book file");
      return;
    }

    // Validation for chapter-wise upload
    if (uploadType === "chapter_wise") {
      if (!academicData.chapter_number) {
        setError("Please enter chapter number");
        return;
      }
      if (!academicData.chapter_name) {
        setError("Please enter chapter name");
        return;
      }
    }

    // Validation for full book upload
    if (uploadType === "full_book" && !academicData.title) {
      setError("Please enter book name");
      return;
    }

    setLoading(true);

    try {
      // Determine folder based on book type
      const folder = bookType === "indie" ? "indie" : "academic";

      // STEP 1: Upload document to Vercel Blob via backend
      setUploadStatus("Uploading document to cloud storage...");
      const blobResponse = await uploadDocumentToVercelBlob(
        bookFile,
        folder,
        (progress) => {
          setUploadProgress(progress);
        },
      );

      console.log(
        "✅ Document uploaded to Vercel Blob:",
        blobResponse.blob_url,
      );

      // STEP 2: Upload cover image (if provided)
      let coverImageUrl = null;
      if (coverImage) {
        setUploadStatus("Uploading cover image...");
        const coverResponse = await uploadCoverImageToVercelBlob(coverImage);
        coverImageUrl = coverResponse.blob_url;
        console.log("✅ Cover image uploaded to Vercel Blob:", coverImageUrl);
      }

      // STEP 3: Prepare title based on upload type
      let finalTitle = academicData.title;
      if (
        bookType === "academic" &&
        uploadType === "chapter_wise" &&
        academicData.chapter_number &&
        academicData.chapter_name &&
        academicData.subject
      ) {
        // Format: "Chapter 1 - Basic Web Application | Web Application Programming"
        finalTitle = `Chapter ${academicData.chapter_number} - ${academicData.chapter_name} | ${academicData.subject}`;
      }

      // STEP 4: Send metadata and URLs to backend
      setUploadStatus("Saving book details...");
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://adhyaan.up.railway.app/api/v1";
      let endpoint;
      let requestBody;

      if (bookType === "indie") {
        endpoint = `${apiUrl}/books/indie`;
        requestBody = {
          book_name: indieData.title,
          author_name: indieData.author_name,
          genre: indieData.genre,
          published_year: indieData.published_year,
          publication_name: indieData.publication_name,
          description: indieData.description,
          file_url: blobResponse.blob_url,
          cover_image_url: coverImageUrl,
        };
      } else {
        endpoint = `${apiUrl}/books/academic`;
        requestBody = {
          board: academicData.board,
          book_name: finalTitle,
          course_name: academicData.course_name || null,
          year: academicData.year ? parseInt(academicData.year) : null,
          part: academicData.part || null,
          semester: academicData.semester
            ? parseInt(academicData.semester)
            : null,
          subject_name: academicData.subject,
          chapter_name: academicData.chapter_name || null,
          file_url: blobResponse.blob_url,
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

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save book");
      }

      setUploadStatus("✅ Book uploaded successfully!");
      console.log("✅ Book saved to database:", data);

      onSuccess && onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Select book type
  if (!bookType) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Upload New Book</h2>
            <button className={styles.closeBtn} onClick={onClose}>
              &times;
            </button>
          </div>
          <div className={styles.typeSelection}>
            <h3>Select Book Type</h3>
            <div className={styles.typeButtons}>
              <button
                className={styles.typeBtn}
                onClick={() => setBookType("indie")}
              >
                <div className={styles.typeIcon}>📚</div>
                <h4>Indie Book</h4>
                <p>Fiction, novels, general reading</p>
              </button>
              <button
                className={styles.typeBtn}
                onClick={() => setBookType("academic")}
              >
                <div className={styles.typeIcon}>🎓</div>
                <h4>Academic Book</h4>
                <p>Educational, textbooks, study materials</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Select upload type (for academic books)
  if (bookType === "academic" && !uploadType) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Academic Content Upload</h2>
            <button className={styles.closeBtn} onClick={() => setBookType("")}>
              &times;
            </button>
          </div>
          <div className={styles.typeSelection}>
            <h3>Select Upload Type</h3>
            <div className={styles.typeButtons}>
              <button
                className={styles.typeBtn}
                onClick={() => setUploadType("chapter_wise")}
              >
                <div className={styles.typeIcon}>📄</div>
                <h4>Chapter-Wise Upload</h4>
                <p>Upload individual chapters with chapter number</p>
              </button>
              <button
                className={styles.typeBtn}
                onClick={() => setUploadType("full_book")}
              >
                <div className={styles.typeIcon}>📖</div>
                <h4>Full Book Upload</h4>
                <p>Upload complete book</p>
              </button>
              <button
                className={styles.typeBtn}
                onClick={() => setUploadType("research_paper")}
              >
                <div className={styles.typeIcon}>📝</div>
                <h4>Research Paper</h4>
                <p>Upload research papers (no course details required)</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Upload form
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>
            {bookType === "indie"
              ? "Upload Indie Book"
              : uploadType === "chapter_wise"
                ? "Upload Chapter"
                : uploadType === "full_book"
                  ? "Upload Full Book"
                  : "Upload Research Paper"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          {bookType === "indie" ? (
            <>
              {/* INDIE BOOK FORM */}
              <div className={styles.formGroup}>
                <label htmlFor="title">Book Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={indieData.title}
                  onChange={handleIndieChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Book Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={indieData.description}
                  onChange={handleIndieChange}
                  placeholder="Brief description of the book..."
                  rows="4"
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="genre">Genre *</label>
                  <input
                    type="text"
                    id="genre"
                    name="genre"
                    value={indieData.genre}
                    onChange={handleIndieChange}
                    placeholder="e.g., Fiction, Romance, Thriller"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="author_name">Author Name *</label>
                  <input
                    type="text"
                    id="author_name"
                    name="author_name"
                    value={indieData.author_name}
                    onChange={handleIndieChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="publication_name">Publication Name *</label>
                  <input
                    type="text"
                    id="publication_name"
                    name="publication_name"
                    value={indieData.publication_name}
                    onChange={handleIndieChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="published_year">Published Year *</label>
                  <input
                    type="number"
                    id="published_year"
                    name="published_year"
                    value={indieData.published_year}
                    onChange={handleIndieChange}
                    min="1800"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="author_contact">
                  Author/Supplier Contact (Optional)
                </label>
                <input
                  type="text"
                  id="author_contact"
                  name="author_contact"
                  value={indieData.author_contact}
                  onChange={handleIndieChange}
                  placeholder="Phone or email"
                />
              </div>
            </>
          ) : uploadType === "research_paper" ? (
            <>
              {/* RESEARCH PAPER FORM */}
              <div className={styles.formGroup}>
                <label htmlFor="title">Research Paper Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={academicData.title}
                  onChange={handleAcademicChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="authors">Authors</label>
                <input
                  type="text"
                  id="authors"
                  name="authors"
                  value={academicData.authors || ""}
                  onChange={handleAcademicChange}
                  placeholder="e.g., John Doe, Jane Smith"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="publication_year">Publication Year</label>
                  <input
                    type="number"
                    id="publication_year"
                    name="publication_year"
                    value={academicData.publication_year || ""}
                    onChange={handleAcademicChange}
                    min="1900"
                    max="2100"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject/Field</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={academicData.subject || ""}
                    onChange={handleAcademicChange}
                    placeholder="e.g., Computer Science, Physics"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="keywords">Keywords</label>
                <input
                  type="text"
                  id="keywords"
                  name="keywords"
                  value={academicData.keywords || ""}
                  onChange={handleAcademicChange}
                  placeholder="e.g., Machine Learning, Neural Networks, AI"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Paper Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={academicData.description}
                  onChange={handleAcademicChange}
                  placeholder="Brief description of the research paper..."
                  rows="4"
                  className={styles.textarea}
                />
              </div>
            </>
          ) : (
            <>
              {/* ACADEMIC BOOK FORM (Chapter-wise or Full Book) */}

              {/* Level Selection - FIRST FIELD */}
              <div className={styles.formGroup}>
                <label htmlFor="level">Education Level *</label>
                <select
                  id="level"
                  name="level"
                  value={academicData.level}
                  onChange={handleAcademicChange}
                  required
                >
                  <option value="">Select Level</option>
                  <option value="primary">Primary (Class 1-8)</option>
                  <option value="secondary">Secondary (Class 9-12)</option>
                  <option value="undergraduate">
                    Undergraduate (Bachelor)
                  </option>
                  <option value="masters">Masters</option>
                  <option value="diploma">Diploma</option>
                </select>
              </div>

              {/* Show fields based on level */}
              {academicData.level && (
                <>
                  {/* Board and Class */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="board">Board *</label>
                      <input
                        type="text"
                        id="board"
                        name="board"
                        value={academicData.board}
                        onChange={handleAcademicChange}
                        disabled={
                          academicData.level === "primary" ||
                          academicData.level === "secondary"
                        }
                        placeholder={
                          ["undergraduate", "masters", "diploma"].includes(
                            academicData.level,
                          )
                            ? "Enter Board"
                            : "NEB"
                        }
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="class">Class *</label>
                      {academicData.level === "primary" ? (
                        <select
                          id="class"
                          name="class"
                          value={academicData.class}
                          onChange={handleAcademicChange}
                          required
                        >
                          <option value="">Select Class</option>
                          {getPrimaryClassOptions().map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      ) : academicData.level === "secondary" ? (
                        <select
                          id="class"
                          name="class"
                          value={academicData.class}
                          onChange={handleAcademicChange}
                          required
                        >
                          <option value="">Select Class</option>
                          {getSecondaryClassOptions().map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          id="class"
                          name="class"
                          value={academicData.class}
                          onChange={handleAcademicChange}
                          placeholder={
                            academicData.level === "undergraduate"
                              ? "Bachelor"
                              : academicData.level === "masters"
                                ? "Masters"
                                : "Diploma"
                          }
                          required
                        />
                      )}
                    </div>
                  </div>

                  {/* Year, Part, Semester - For undergraduate, masters, diploma */}
                  {["undergraduate", "masters", "diploma"].includes(
                    academicData.level,
                  ) && (
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="year">Year</label>
                        <input
                          type="number"
                          id="year"
                          name="year"
                          value={academicData.year}
                          onChange={handleAcademicChange}
                          min="1"
                          max="6"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="part">Part</label>
                        <select
                          id="part"
                          name="part"
                          value={academicData.part}
                          onChange={handleAcademicChange}
                        >
                          <option value="">Select</option>
                          <option value="I">Part I</option>
                          <option value="II">Part II</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="semester">Semester</label>
                        <input
                          type="number"
                          id="semester"
                          name="semester"
                          value={academicData.semester}
                          onChange={handleAcademicChange}
                          min="1"
                          max="8"
                        />
                      </div>
                    </div>
                  )}

                  {/* Course Name - For undergraduate, masters, diploma */}
                  {["undergraduate", "masters", "diploma"].includes(
                    academicData.level,
                  ) && (
                    <div className={styles.formGroup}>
                      <label htmlFor="course_name">Course Name *</label>
                      <input
                        type="text"
                        id="course_name"
                        name="course_name"
                        value={academicData.course_name}
                        onChange={handleAcademicChange}
                        placeholder={
                          academicData.level === "undergraduate"
                            ? "e.g., Bachelor of Computer Application (BCA)"
                            : academicData.level === "masters"
                              ? "e.g., Master of Business Administration (MBA)"
                              : "e.g., Diploma in Computer Engineering"
                        }
                        required
                      />
                    </div>
                  )}

                  {/* Subject Name */}
                  <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject Name *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={academicData.subject}
                      onChange={handleAcademicChange}
                      placeholder="e.g., Web Application Programming"
                      required
                    />
                  </div>

                  {/* Chapter Number and Name - Only for chapter-wise upload */}
                  {uploadType === "chapter_wise" && (
                    <>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label htmlFor="chapter_number">
                            Chapter Number *
                          </label>
                          <input
                            type="number"
                            id="chapter_number"
                            name="chapter_number"
                            value={academicData.chapter_number}
                            onChange={handleAcademicChange}
                            min="1"
                            placeholder="e.g., 1"
                            required
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="chapter_name">Chapter Name *</label>
                          <input
                            type="text"
                            id="chapter_name"
                            name="chapter_name"
                            value={academicData.chapter_name}
                            onChange={handleAcademicChange}
                            placeholder="e.g., Basic Web Application"
                            required
                          />
                        </div>
                      </div>
                      <div className={styles.infoBox}>
                        <p>
                          <strong>Display Format:</strong> Chapter{" "}
                          {academicData.chapter_number || "1"} -{" "}
                          {academicData.chapter_name || "Chapter Name"} |{" "}
                          {academicData.subject || "Subject Name"}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Book Name - Only for full book upload */}
                  {uploadType === "full_book" && (
                    <div className={styles.formGroup}>
                      <label htmlFor="title">Book Name *</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={academicData.title}
                        onChange={handleAcademicChange}
                        placeholder="e.g., Complete Web Development Guide"
                        required
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* File Upload Fields */}
          <div className={styles.formGroup}>
            <label htmlFor="book_file">
              Book File * (PDF or DOCX - Max 30MB)
            </label>
            <input
              type="file"
              id="book_file"
              accept=".pdf,.docx"
              onChange={(e) => setBookFile(e.target.files[0])}
              required
            />
            {bookFile && (
              <div className={styles.fileName}>📄 {bookFile.name}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cover_image">
              Cover Image (Optional - JPG, PNG - Max 15MB)
            </label>
            <input
              type="file"
              id="cover_image"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => setCoverImage(e.target.files[0])}
            />
            {coverImage && (
              <div className={styles.fileName}>🖼️ {coverImage.name}</div>
            )}
          </div>

          {/* Upload Progress */}
          {loading && (
            <div className={styles.uploadProgress}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className={styles.progressText}>
                {uploadStatus} {uploadProgress > 0 && `(${uploadProgress}%)`}
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() =>
                bookType === "academic" && uploadType
                  ? setUploadType("")
                  : setBookType("")
              }
              disabled={loading}
            >
              Back
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedBookUploadForm;
