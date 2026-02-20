"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import BoardCard from "@/components/ui/BoardCard";
import CourseCard from "@/components/ui/CourseCard";
import SemCard from "@/components/ui/SemCard";
import StepCounter from "@/components/ui/StepCounter";
import BookCard from "@/components/book/BookCard";
import { formatGenre } from "@/utils/formatGenre";
import styles from "./page.module.css";

export default function StudentSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentStep, setCurrentStep] = useState(0); // 0: board, 1: course, 2: year/semester, 3: books
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [studyBooks, setStudyBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comprehensive board and course data - USER's PREFERRED VERSION
  const boardData = {
    NEB: {
      name: "National Examination Board",
      short: "NEB",
      type: "school",
      courses: [
        { name: "+2 Science", short: "Science", code: "Science" },
        { name: "+2 Management", short: "Management", code: "Management" },
        { name: "+2 Humanities", short: "Humanities", code: "Humanities" },
        { name: "+2 Education", short: "Education", code: "Education" },
        { name: "+2 Law", short: "Law", code: "Law" },
      ],
      years: ["Grade 11", "Grade 12"],
    },
    TU: {
      name: "Tribhuvan University (General Faculties)",
      short: "TU",
      type: "university",
      courses: [
        { name: "Bachelor of Arts", short: "BA", code: "BA" },
        {
          name: "Bachelor of Business Administration",
          short: "BBA",
          code: "BBA",
        },
        { name: "Bachelor of Business Studies", short: "BBS", code: "BBS" },
        { name: "Bachelor of Computer Application", short: "BCA", code: "BCA" },
        { name: "Bachelor of Education", short: "BEd", code: "BEd" },
        { name: "Bachelor of Hotel Management", short: "BHM", code: "BHM" },
        {
          name: "Bachelor of Information Management",
          short: "BIM",
          code: "BIM",
        },
        { name: "Bachelor of Laws", short: "LLB", code: "LLB" },
        { name: "Bachelor of Pharmacy", short: "BPharm", code: "BPharm" },
        { name: "Bachelor of Science", short: "BSc", code: "BSc" },
        {
          name: "BSc Computer Science and Information Technology",
          short: "BSc CSIT",
          code: "BSc CSIT",
        },
        {
          name: "Masters in Business Administration",
          short: "MBA",
          code: "MBA",
        },
        { name: "Masters in Computer Science", short: "Mcs", code: "Mcs" },
      ],
      years: [1, 2, 3, 4],
      parts: ["I", "II"],
      semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    TU_IOE: {
      name: "Tribhuvan University - Institute of Engineering",
      short: "IOE",
      type: "engineering",
      courses: [
        {
          name: "Bachelor of Aerospace Engineering",
          short: "BAE",
          code: "BAE",
        },
        {
          name: "Bachelor of Agricultural Engineering",
          short: "BAG",
          code: "BAG",
        },
        { name: "Bachelor of Architecture", short: "BArch", code: "BAR" },
        {
          name: "Bachelor of Automobile Engineering",
          short: "BAM",
          code: "BAM",
        },
        { name: "Bachelor of Chemical Engineering", short: "BCH", code: "BCH" },
        { name: "Bachelor of Civil Engineering", short: "BCE", code: "BCE" },
        { name: "Bachelor of Computer Engineering", short: "BCT", code: "BCT" },
        {
          name: "Bachelor of Electrical Engineering",
          short: "BEL",
          code: "BEL",
        },
        {
          name: "Bachelor of Electronics and Communication Engineering",
          short: "BEI",
          code: "BEI",
        },
        {
          name: "Bachelor of Geomatics Engineering",
          short: "BGE",
          code: "BGE",
        },
        {
          name: "Bachelor of Industrial Engineering",
          short: "BIE",
          code: "BIE",
        },
        {
          name: "Bachelor of Mechanical Engineering",
          short: "BME",
          code: "BME",
        },
      ],
      years: [1, 2, 3, 4],
      parts: ["I", "II"],
      semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    TU_IOST: {
      name: "Tribhuvan University - Institute of Science and Technology",
      short: "IOST",
      type: "science",
      courses: [
        {
          name: "Bachelor in Information Technology",
          short: "BIT",
          code: "BIT",
        },
        {
          name: "Bachelor of Science in Biotechnology",
          short: "BSc Biotech",
          code: "BSc Biotech",
        },
        {
          name: "Bachelor of Science in Computer Science and Information Technology",
          short: "BSc CSIT",
          code: "BSc CSIT",
        },
        {
          name: "Bachelor of Science in Environmental Science",
          short: "BSc Env",
          code: "BSc Env",
        },
        {
          name: "Bachelor of Science in Microbiology",
          short: "BSc Micro",
          code: "BSc Micro",
        },
      ],
      years: [1, 2, 3, 4],
      parts: ["I", "II"],
      semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    TU_IOM: {
      name: "Tribhuvan University - Institute of Medicine",
      short: "IOM",
      type: "medicine",
      courses: [
        {
          name: "Bachelor of Audiology and Speech Language Pathology",
          short: "BASLP",
          code: "BASLP",
        },
        { name: "Bachelor of Dental Surgery", short: "BDS", code: "BDS" },
        {
          name: "Bachelor of Medicine, Bachelor of Surgery",
          short: "MBBS",
          code: "MBBS",
        },
        { name: "Bachelor of Nursing Science", short: "BNS", code: "BNS" },
        { name: "Bachelor of Optometry", short: "BOptom", code: "BOPTOM" },
        { name: "Bachelor of Pharmacy", short: "BPharm", code: "BPHARM" },
        { name: "Bachelor of Public Health", short: "BPH", code: "BPH" },
        {
          name: "Bachelor of Science in Medical Imaging Technology",
          short: "BSc MIT",
          code: "BSc MIT",
        },
        {
          name: "Bachelor of Science in Medical Laboratory Technology",
          short: "BSc MLT",
          code: "BSc MLT",
        },
        {
          name: "Bachelor of Science in Nursing",
          short: "BSc Nursing",
          code: "BSc Nursing",
        },
      ],
      years: [1, 2, 3, 4, 5],
      parts: ["I", "II"],
      semesters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    KU: {
      name: "Kathmandu University",
      short: "KU",
      type: "university",
      courses: [
        {
          name: "Bachelor in Information Technology",
          short: "BIT",
          code: "BIT",
        },
        { name: "Bachelor of Architecture", short: "BArch", code: "BARCH" },
        {
          name: "Bachelor of Business Administration",
          short: "BBA",
          code: "BBA",
        },
        {
          name: "Bachelor of Business Information Systems",
          short: "BBIS",
          code: "BBIS",
        },
        { name: "Bachelor of Dental Surgery", short: "BDS", code: "BDS" },
        {
          name: "Bachelor of Engineering in Chemical Engineering",
          short: "BE Chemical",
          code: "BE Chemical",
        },
        {
          name: "Bachelor of Engineering in Civil Engineering",
          short: "BE Civil",
          code: "BE Civil",
        },
        {
          name: "Bachelor of Engineering in Computer Engineering",
          short: "BE Computer",
          code: "BE Computer",
        },
        {
          name: "Bachelor of Engineering in Electrical and Electronics Engineering",
          short: "BE Electrical",
          code: "BE Electrical",
        },
        {
          name: "Bachelor of Engineering in Mechanical Engineering",
          short: "BE Mechanical",
          code: "BE Mechanical",
        },
        { name: "Bachelor of Pharmacy", short: "BPharm", code: "BPHARM" },
        {
          name: "Bachelor of Science in Computer Science",
          short: "BSc CS",
          code: "BSc CS",
        },
        {
          name: "Bachelor of Science in Nursing",
          short: "BSc Nursing",
          code: "BSc Nursing",
        },
      ],
      years: [1, 2, 3, 4],
      parts: ["I", "II"],
      semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    PU_POKHARA: {
      name: "Pokhara University",
      short: "PoU",
      type: "university",
      courses: [
        {
          name: "Bachelor of Business Administration",
          short: "BBA",
          code: "BBA",
        },
        { name: "Bachelor of Computer Application", short: "BCA", code: "BCA" },
        {
          name: "Bachelor of Civil Engineering",
          short: "BE Civil",
          code: "BE Civil",
        },
        {
          name: "Bachelor of Computer Engineering",
          short: "BE Computer",
          code: "BE Computer",
        },
        {
          name: "Bachelor of Electrical and Electronics Engineering",
          short: "BE EEE",
          code: "BE EEE",
        },
        {
          name: "Bachelor of Electronics and Communication Engineering",
          short: "BE EI",
          code: "BE EI",
        },
        {
          name: "Bachelor of Software Engineering",
          short: "BE Software",
          code: "BE Software",
        },
        {
          name: "Bachelor of Health Care Management",
          short: "BHCM",
          code: "BHCM",
        },
        { name: "Bachelor of Hotel Management", short: "BHM", code: "BHM" },
        { name: "Bachelor of Pharmacy", short: "BPharm", code: "BPHARM" },
        {
          name: "Bachelor of Science in Biochemistry",
          short: "BSc Biochem",
          code: "BSc Biochem",
        },
        {
          name: "Bachelor of Science in Nursing",
          short: "BSc Nursing",
          code: "BSc Nursing",
        },
      ],
      years: [1, 2, 3, 4],
      parts: ["I", "II"],
      semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    PU_PURBANCHAL: {
      name: "Purbanchal University",
      short: "PU",
      type: "university",
      courses: [
        {
          name: "Bachelor in Information Technology",
          short: "BIT",
          code: "BIT",
        },
        { name: "Bachelor of Arts", short: "BA", code: "BA" },
        {
          name: "Bachelor of Biomedical Engineering",
          short: "BE Biomedical",
          code: "BE Biomedical",
        },
        {
          name: "Bachelor of Business Administration",
          short: "BBA",
          code: "BBA",
        },
        { name: "Bachelor of Business Studies", short: "BBS", code: "BBS" },
        {
          name: "Bachelor of Civil Engineering",
          short: "BE Civil",
          code: "BE Civil",
        },
        { name: "Bachelor of Computer Application", short: "BCA", code: "BCA" },
        {
          name: "Bachelor of Computer Engineering",
          short: "BE Computer",
          code: "BE Computer",
        },
        {
          name: "Bachelor of Electronics, Communication and Automation Engineering",
          short: "BE ECA",
          code: "BE ECA",
        },
        { name: "Bachelor of Pharmacy", short: "BPharm", code: "BPHARM" },
        {
          name: "Bachelor of Science in Agriculture",
          short: "BSc Agri",
          code: "BSc Agri",
        },
        {
          name: "Bachelor of Science in Nursing",
          short: "BSc Nursing",
          code: "BSc Nursing",
        },
        {
          name: "Bachelor of Veterinary Science and Animal Husbandry",
          short: "BVSc & AH",
          code: "BVSC",
        },
      ],
      years: [1, 2, 3, 4],
      parts: ["I", "II"],
      semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    CTEVT: {
      name: "Council for Technical Education and Vocational Training",
      short: "CTEVT",
      type: "diploma",
      courses: [
        {
          name: "Diploma in Automobile Engineering",
          short: "Automobile",
          code: "Automobile",
        },
        { name: "Diploma in Civil Engineering", short: "Civil", code: "Civil" },
        {
          name: "Diploma in Computer Engineering",
          short: "Computer",
          code: "Computer",
        },
        {
          name: "Diploma in Electrical Engineering",
          short: "Electrical",
          code: "Electrical",
        },
        {
          name: "Diploma in Electronics Engineering",
          short: "Electronics",
          code: "Electronics",
        },
        {
          name: "Diploma in Hotel Management",
          short: "Hotel Management",
          code: "Hotel Management",
        },
        { name: "Diploma in Information Technology", short: "IT", code: "IT" },
        {
          name: "Diploma in Mechanical Engineering",
          short: "Mechanical",
          code: "Mechanical",
        },
        { name: "Diploma in Nursing", short: "Nursing", code: "Nursing" },
        { name: "Diploma in Pharmacy", short: "Pharmacy", code: "Pharmacy" },
      ],
      years: [1, 2, 3],
      semesters: [1, 2, 3, 4, 5, 6],
    },
    OTHERS: {
      name: "Other Universities / Boards",
      short: "Others",
      type: "other",
      courses: [],
      years: ["Year 1", "Year 2", "Year 3", "Year 4"],
    },
  };

  const [filters, setFilters] = useState({
    boards: Object.keys(boardData),
    courses: [],
    subjects: [],
    years: [],
    semesters: [],
  });

  const steps = [
    {
      id: 0,
      title: "Select Board",
      description: "Choose your educational board or university",
    },
    {
      id: 1,
      title: "Choose Course",
      description: "Select your course or program",
    },
    {
      id: 2,
      title: "Pick Year & Semester",
      description: "Choose your academic year and semester",
    },
    {
      id: 3,
      title: "Browse Books",
      description: "Find specific study materials",
    },
  ];

  // Helper to get course code (which aligns with DB short_code)
  const getCourseCode = (boardName, courseName) => {
    if (!boardName || !courseName) return courseName;
    const boardEntry = Object.values(boardData).find(
      (b) => b.name === boardName,
    );
    if (!boardEntry) return courseName;
    const courseEntry = boardEntry.courses.find((c) => c.name === courseName);
    // Prefer code, then short, then name
    return courseEntry
      ? courseEntry.code || courseEntry.short || courseName
      : courseName;
  };

  // Fetch available filters on component mount
  useEffect(() => {
    fetchFilters();
  }, []);

  // Fetch books when we reach the books step
  useEffect(() => {
    if (currentStep === 3) {
      if (
        !selectedCourse &&
        selectedBoard !== "Other Universities / Boards" &&
        boardData[
          Object.keys(boardData).find(
            (k) => boardData[k].name === selectedBoard,
          )
        ]?.short !== "Others"
      ) {
        // If course is required but not selected (and not 'Other'), don't fetch yet?
        // Actually, if we are in Step 3, we expect to fetch.
      }
      fetchStudyMaterial(
        selectedBoard,
        selectedCourse,
        selectedYear,
        selectedSemester,
      );
    }
  }, [
    currentStep,
    selectedBoard,
    selectedCourse,
    selectedYear,
    selectedSemester,
  ]);

  // Get API base URL from environment
  const getApiBaseUrl = () => {
    return (
      process.env.NEXT_PUBLIC_API_URL || "https://adhyaan.up.railway.app/api/v1"
    );
  };

  const getBoardKey = (boardName) => {
    return (
      Object.keys(boardData).find((key) => boardData[key].name === boardName) ||
      boardName
    );
  };

  const fetchFilters = async () => {
    const baseUrl = getApiBaseUrl();
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/books/academic/boards`);
      if (response.ok) {
        const data = await response.json();

        // Enhance backend boards by mapping keys to full names if possible
        const backendBoards = data.boards.map((b) => {
          // If the backend returns a Key like "TU_IOE", map it to the full name
          if (boardData[b.name]) {
            return boardData[b.name].name;
          }
          return b.name;
        });

        // Use Names from local data instead of Keys
        const localBoardNames = Object.values(boardData).map((b) => b.name);

        // This set will naturally de-duplicate "Tribhuvan University..."
        const allBoards = Array.from(
          new Set([...backendBoards, ...localBoardNames]),
        );

        setFilters((prev) => ({
          ...prev,
          boards: allBoards,
        }));
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesForBoard = async (board) => {
    const baseUrl = getApiBaseUrl();
    try {
      setLoading(true);
      const response = await fetch(
        `${baseUrl}/books/academic/courses?board=${encodeURIComponent(board)}`,
      );
      if (response.ok) {
        const data = await response.json();

        // Find local courses by matching board name
        let localCourses = [];
        // Try direct key access
        if (boardData[board]) {
          localCourses = boardData[board].courses?.map((c) => c.name) || [];
        } else {
          // Try finding by name property
          const foundKey = Object.keys(boardData).find(
            (k) => boardData[k].name === board,
          );
          if (foundKey) {
            localCourses =
              boardData[foundKey].courses?.map((c) => c.name) || [];
          }
        }

        // Merge local and backend courses
        const allCourses = Array.from(
          new Set([...localCourses, ...data.courses]),
        );
        setFilters((prev) => ({
          ...prev,
          courses: allCourses,
        }));
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearSemesterForCourse = async (board, course) => {
    const baseUrl = getApiBaseUrl();
    // Use FULL COURSE NAME as backend expects it for structure queries
    try {
      setLoading(true);
      const response = await fetch(
        `${baseUrl}/books/academic/year-semester?board=${encodeURIComponent(board)}&course=${encodeURIComponent(course)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setFilters((prev) => ({
          ...prev,
          yearSemData: data,
        }));
      }
    } catch (error) {
      console.error("Error fetching year/semester:", error);
    } finally {
      setLoading(false);
    }
  };

  // Replaced fetchStudyBooks with fetchStudyMaterial as requested
  // Removed fetchSubjects entirely
  const fetchStudyMaterial = async (board, course, year, semester) => {
    const baseUrl = getApiBaseUrl();
    try {
      setLoading(true);
      const params = new URLSearchParams();

      const boardKey = getBoardKey(board);
      if (board) params.append("board", boardKey);

      // Send FULL NAME because books are indexed by Full Name in academic_books
      if (course) params.append("course_name", course);

      if (year) params.append("year", year);
      if (semester) params.append("semester", semester);
      // No subject param

      const response = await fetch(
        `${baseUrl}/books/academic?${params}&limit=100`,
      );
      if (response.ok) {
        const data = await response.json();
        setStudyBooks(data.books || []);
      }
    } catch (error) {
      console.error("Error fetching study materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardSelect = (board) => {
    setSelectedBoard(board);
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedSemester("");

    const isOtherBoard =
      board === "Other Universities / Boards" ||
      (boardData["OTHERS"] && boardData["OTHERS"].name === board);

    if (isOtherBoard) {
      setCurrentStep(3);
    } else {
      fetchCoursesForBoard(board);
      setCurrentStep(1);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedYear("");
    setSelectedSemester("");
    fetchYearSemesterForCourse(selectedBoard, course);
    setCurrentStep(2);
  };

  const handleYearSemesterSelect = (year, semester) => {
    setSelectedYear(year);
    setSelectedSemester(semester);
    // We skip subject selection and go straight to books
    setCurrentStep(3);
  };

  // handleSubjectSelect removed as it's no longer used

  const goToPreviousStep = () => {
    if (
      selectedBoard === "Other Universities / Boards" ||
      (boardData["OTHERS"] && boardData["OTHERS"].name === selectedBoard)
    ) {
      if (currentStep === 3) {
        setCurrentStep(0);
        return;
      }
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetNavigation = () => {
    setCurrentStep(0);
    setSelectedBoard("");
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedSemester("");
    setStudyBooks([]);
  };

  const filteredBooks = studyBooks.filter((book) => {
    const matchesSearch =
      !searchQuery ||
      book.book_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.subject_name &&
        book.subject_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.course_name &&
        book.course_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const mostReadBooks = studyBooks.slice(0, 4);

  const renderStepIndicator = () => (
    <StepCounter
      currentStep={currentStep}
      onStepClick={(stepIndex) => {
        if (stepIndex < currentStep) {
          setCurrentStep(stepIndex);
        }
      }}
    />
  );

  const renderBoardSelection = () => (
    <div className={styles.selectionContainer}>
      <h2 className={styles.selectionTitle}>Choose Your Board/University</h2>
      <p className={styles.selectionDescription}>
        Select the educational board or university you're studying under
      </p>

      <div className={styles.optionsGrid}>
        {filters.boards.map((boardName, index) => {
          let board = Object.values(boardData).find(
            (b) => b.name === boardName,
          );

          if (!board) {
            board = {
              name: boardName,
              short:
                boardData["OTHERS"] && boardName === boardData["OTHERS"].name
                  ? "Others"
                  : boardName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .substring(0, 4)
                      .toUpperCase(),
              type: "university",
            };
          }

          return (
            <BoardCard
              key={boardName}
              board={{ ...board, index }}
              onClick={() => handleBoardSelect(boardName)}
              isSelected={selectedBoard === boardName}
            />
          );
        })}
      </div>
    </div>
  );

  const renderCourseSelection = () => {
    const boardKey = Object.keys(boardData).find(
      (k) => boardData[k].name === selectedBoard,
    );
    const boardInfo = boardKey ? boardData[boardKey] : null;

    return (
      <div className={styles.selectionContainer}>
        <div className={styles.selectionHeader}>
          <Button
            variant="ghost"
            onClick={goToPreviousStep}
            className={styles.backButton}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbItem}>
              {boardInfo?.short || selectedBoard}
            </span>
            <span className={styles.breadcrumbSeparator}>→</span>
            <span className={styles.breadcrumbItem}>Courses</span>
          </div>
        </div>

        <h2 className={styles.selectionTitle}>Choose Your Course/Program</h2>
        <p className={styles.selectionDescription}>
          Select the course or program you're enrolled in
        </p>

        <div className={styles.optionsGrid}>
          {filters.courses.map((courseName, index) => {
            const courseInfo = boardInfo?.courses?.find(
              (c) => c.name === courseName,
            ) || {
              name: courseName,
              short: courseName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 4),
              code: courseName.replace(/\s+/g, "_"),
            };

            return (
              <CourseCard
                key={courseInfo.code + index}
                course={{
                  ...courseInfo,
                  type: boardInfo?.type || "university",
                }}
                onClick={() => handleCourseSelect(courseName)}
                isSelected={selectedCourse === courseName}
                index={index}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearSemesterSelection = () => {
    const boardKey = Object.keys(boardData).find(
      (k) => boardData[k].name === selectedBoard,
    );
    const boardInfo = boardKey ? boardData[boardKey] : null;

    if (boardInfo?.type === "school") {
      return (
        <div className={styles.selectionContainer}>
          <div className={styles.selectionHeader}>
            <Button
              variant="ghost"
              onClick={goToPreviousStep}
              className={styles.backButton}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbItem}>{boardInfo.short}</span>
              <span className={styles.breadcrumbSeparator}>→</span>
              <span className={styles.breadcrumbItem}>{selectedCourse}</span>
              <span className={styles.breadcrumbSeparator}>→</span>
              <span className={styles.breadcrumbItem}>Grade</span>
            </div>
          </div>

          <h2 className={styles.selectionTitle}>Choose Your Grade</h2>
          <p className={styles.selectionDescription}>
            Select your current grade level
          </p>

          <div className={styles.optionsGrid}>
            {boardInfo.years.map((grade) => (
              <Card
                key={grade}
                hover
                className={`${styles.optionCard} ${selectedYear === grade ? styles.selected : ""}`}
                onClick={() => handleYearSemesterSelect(grade, "")}
              >
                <div className={styles.optionIcon}>
                  <div className={styles.gradeNumber}>
                    {grade.replace("Grade ", "")}
                  </div>
                </div>
                <div className={styles.optionContent}>
                  <h3 className={styles.optionTitle}>{grade}</h3>
                  <p className={styles.optionDescription}>
                    {grade === "Grade 11" && "11th Grade - First Year"}
                    {grade === "Grade 12" && "12th Grade - Final Year"}
                  </p>
                </div>
                {selectedYear === grade && (
                  <div className={styles.checkIcon}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      );
    }

    const years = boardInfo?.years || [1, 2, 3, 4];
    const parts = boardInfo?.parts || ["I", "II"];
    const semesters = boardInfo?.semesters || [1, 2, 3, 4, 5, 6, 7, 8];

    return (
      <div className={styles.selectionContainer}>
        <div className={styles.selectionHeader}>
          <Button
            variant="ghost"
            onClick={goToPreviousStep}
            className={styles.backButton}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbItem}>
              {boardInfo?.short || selectedBoard}
            </span>
            <span className={styles.breadcrumbSeparator}>→</span>
            <span className={styles.breadcrumbItem}>{selectedCourse}</span>
            <span className={styles.breadcrumbSeparator}>→</span>
            <span className={styles.breadcrumbItem}>Year/Semester</span>
          </div>
        </div>

        <h2 className={styles.selectionTitle}>
          Choose Your Year, Part & Semester
        </h2>
        <p className={styles.selectionDescription}>
          Select your current academic year, part, and semester
        </p>

        <div className={styles.yearSemesterContainer}>
          {filters.yearSemData?.type === "grades" ? (
            <div className={styles.optionsGrid}>
              {filters.yearSemData.grades.map((gradeNum) => {
                const gradeLabel = `Grade ${gradeNum}`;
                return (
                  <Card
                    key={gradeNum}
                    hover
                    className={`${styles.optionCard} ${selectedYear === gradeNum.toString() ? styles.selected : ""}`}
                    onClick={() =>
                      handleYearSemesterSelect(gradeNum.toString(), "")
                    }
                  >
                    <div className={styles.optionIcon}>
                      <div className={styles.gradeNumber}>{gradeNum}</div>
                    </div>
                    <div className={styles.optionContent}>
                      <h3 className={styles.optionTitle}>{gradeLabel}</h3>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : filters.yearSemData?.type === "year_semester" ? (
            Object.entries(filters.yearSemData.data).map(([year, data]) => (
              <div key={year} className={styles.yearSection}>
                <div className={styles.yearTitle}>Year {year}</div>
                <div className={styles.partsGrid}>
                  {data.parts ? (
                    data.parts.map((part) => (
                      <div
                        key={`${year}-${part}`}
                        className={styles.partColumn}
                      >
                        <div className={styles.partHeader}>Part {part}</div>
                        {data.semesters
                          ?.filter((sem) => sem % 2 === (part === "I" ? 1 : 0))
                          .map((semester) => (
                            <SemCard
                              key={`${year}-${part}-${semester}`}
                              year={year}
                              part={part}
                              semester={semester}
                              onClick={() =>
                                handleYearSemesterSelect(
                                  year.toString(),
                                  semester.toString(),
                                )
                              }
                              isSelected={
                                selectedYear === year.toString() &&
                                selectedSemester === semester.toString()
                              }
                            />
                          ))}
                      </div>
                    ))
                  ) : (
                    <div className={styles.partColumn}>
                      {data.semesters?.map((semester) => (
                        <SemCard
                          key={`${year}-all-${semester}`}
                          year={year}
                          part=""
                          semester={semester}
                          onClick={() =>
                            handleYearSemesterSelect(
                              year.toString(),
                              semester.toString(),
                            )
                          }
                          isSelected={
                            selectedYear === year.toString() &&
                            selectedSemester === semester.toString()
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : /* Fallback to local boardInfo if API data is missing */
          boardInfo && boardInfo.years && boardInfo.years[0] !== "Grade 11" ? (
            boardInfo.years.map((year) => (
              <div key={year} className={styles.yearSection}>
                <div className={styles.yearTitle}>Year {year}</div>
                <div className={styles.partsGrid}>
                  {boardInfo.parts ? (
                    boardInfo.parts.map((part) => (
                      <div
                        key={`${year}-${part}`}
                        className={styles.partColumn}
                      >
                        <div className={styles.partHeader}>Part {part}</div>
                        {boardInfo.semesters
                          .filter((sem) => {
                            // Simple heuristic: Odd sems in Part I, Even in Part II
                            const semNum = parseInt(sem);
                            const yearNum = parseInt(year);
                            const targetSem1 = (yearNum - 1) * 2 + 1;
                            const targetSem2 = (yearNum - 1) * 2 + 2;

                            if (part === "I" || part === "A")
                              return semNum === targetSem1;
                            if (part === "II" || part === "B")
                              return semNum === targetSem2;
                            return false;
                          })
                          .map((semester) => (
                            <SemCard
                              key={`${year}-${part}-${semester}`}
                              year={year}
                              part={part}
                              semester={semester}
                              onClick={() =>
                                handleYearSemesterSelect(
                                  year.toString(),
                                  semester.toString(),
                                )
                              }
                              isSelected={
                                selectedYear === year.toString() &&
                                selectedSemester === semester.toString()
                              }
                            />
                          ))}
                      </div>
                    ))
                  ) : (
                    /* No parts, just semesters for the year */
                    <div className={styles.partColumn}>
                      {boardInfo.semesters
                        .filter((sem) => {
                          const semNum = parseInt(sem);
                          const yearNum = parseInt(year);
                          return (
                            semNum === yearNum * 2 - 1 || semNum === yearNum * 2
                          );
                        })
                        .map((semester) => (
                          <SemCard
                            key={`${year}-all-${semester}`}
                            year={year}
                            part=""
                            semester={semester}
                            onClick={() =>
                              handleYearSemesterSelect(
                                year.toString(),
                                semester.toString(),
                              )
                            }
                            isSelected={
                              selectedYear === year.toString() &&
                              selectedSemester === semester.toString()
                            }
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              No year/semester data available
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSubjectSelection = () => (
    <div className={styles.selectionContainer}>
      {/* Unused step currently, merged logic */}
    </div>
  );

  const renderBooksView = () => (
    <div className={styles.booksContainer}>
      <div className={styles.booksHeader}>
        <div className={styles.booksNavigation}>
          <Button
            variant="ghost"
            onClick={goToPreviousStep}
            className={styles.backButton}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <Button
            variant="outline"
            onClick={resetNavigation}
            className={styles.resetButton}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Start Over
          </Button>
        </div>

        <div className={styles.booksBreadcrumb}>
          <span className={styles.breadcrumbItem}>{selectedBoard}</span>
          {selectedCourse && (
            <>
              <span className={styles.breadcrumbSeparator}>→</span>
              <span className={styles.breadcrumbItem}>{selectedCourse}</span>
            </>
          )}
          {selectedYear && (
            <>
              <span className={styles.breadcrumbSeparator}>→</span>
              <span className={styles.breadcrumbItem}>
                Year {selectedYear} Sem {selectedSemester}
              </span>
            </>
          )}
        </div>
      </div>

      <div className={styles.booksContent}>
        <h2 className={styles.booksTitle}>Study Materials</h2>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading study materials...</p>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className={styles.booksGrid}>
            {filteredBooks.map((book, index) => (
              <BookCard
                key={book.id || `study-book-${index}`}
                book={{
                  ...book,
                  title: book.book_name,
                  subject: book.subject_name,
                  level: book.course_name,
                  board: book.board,
                  class: book.year
                    ? `Year ${book.year} - Sem ${book.semester}`
                    : "",
                  cover: "#4F46E5",
                  rating: 4.5,
                }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>Materials Not found</h3>
            <p>We couldn't find any study materials for your selection.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className="container">
        <h1 className={styles.pageTitle}>Student Section</h1>
        <p className={styles.pageSubtitle}>
          Academic curriculum-based study materials
        </p>

        {currentStep !== 3 ? (
          <div className={styles.stepIndicatorContainer}>
            {renderStepIndicator()}
          </div>
        ) : null}

        <Card className={styles.mainCard}>
          {currentStep === 0 && renderBoardSelection()}
          {currentStep === 1 && renderCourseSelection()}
          {currentStep === 2 && renderYearSemesterSelection()}
          {currentStep === 3 && renderBooksView()}
        </Card>
      </div>
    </div>
  );
}
