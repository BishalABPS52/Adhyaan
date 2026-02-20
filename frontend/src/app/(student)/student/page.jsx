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
  const [currentStep, setCurrentStep] = useState(0); // 0: board, 1: course, 2: year/semester, 3: subject, 4: books
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [studyBooks, setStudyBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comprehensive board and course data
  const boardData = {
    NEB: {
      name: "National Examination Board",
      short: "NEB",
      type: "school",
      courses: [
        { name: "+2 Science", short: "Science", code: "SCI" },
        { name: "+2 Management", short: "Management", code: "MGT" },
        { name: "+2 Humanities", short: "Humanities", code: "HUM" },
        { name: "+2 Education", short: "Education", code: "EDU" },
        { name: "+2 Law", short: "Law", code: "LAW" },
      ],
      years: ["Grade 11", "Grade 12"],
    },
    TU: {
      name: "Tribhuvan University (General Faculties)",
      short: "TU",
      type: "university",
      courses: [
        { name: "Bachelor of Arts", short: "BA", code: "BA" },
        { name: "Bachelor of Business Studies", short: "BBS", code: "BBS" },
        {
          name: "Bachelor of Business Administration",
          short: "BBA",
          code: "BBA",
        },
        {
          name: "Bachelor of Information Management",
          short: "BIM",
          code: "BIM",
        },
        { name: "Bachelor of Computer Application", short: "BCA", code: "BCA" },
        { name: "Bachelor of Science", short: "BSc", code: "BSc" },
        {
          name: "Bachelor of Science in Computer Science and Information Technology",
          short: "BSc CSIT",
          code: "CSIT",
        },
        { name: "Bachelor of Education", short: "BEd", code: "BEd" },
        { name: "Bachelor of Laws", short: "LLB", code: "LLB" },
        { name: "Bachelor of Pharmacy", short: "BPharm", code: "BPharm" },
        { name: "Bachelor of Hotel Management", short: "BHM", code: "BHM" },
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
          name: "Bachelor of Mechanical Engineering",
          short: "BME",
          code: "BME",
        },
        {
          name: "Bachelor of Automobile Engineering",
          short: "BAM",
          code: "BAM",
        },
        {
          name: "Bachelor of Industrial Engineering",
          short: "BIE",
          code: "BIE",
        },
        {
          name: "Bachelor of Geomatics Engineering",
          short: "BGE",
          code: "BGE",
        },
        {
          name: "Bachelor of Agricultural Engineering",
          short: "BAG",
          code: "BAG",
        },
        { name: "Bachelor of Architecture", short: "BAR", code: "BAR" },
        {
          name: "Bachelor of Aerospace Engineering",
          short: "BAE",
          code: "BAE",
        },
        { name: "Bachelor of Chemical Engineering", short: "BCH", code: "BCH" },
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
          name: "Bachelor of Science in Computer Science and Information Technology",
          short: "BSc CSIT",
          code: "CSIT",
        },
        {
          name: "Bachelor of Science in Microbiology",
          short: "BSc Microbiology",
          code: "MICRO",
        },
        {
          name: "Bachelor of Science in Environmental Science",
          short: "BSc Environmental Science",
          code: "ENV",
        },
        {
          name: "Bachelor of Science in Biotechnology",
          short: "BSc Biotechnology",
          code: "BIOTECH",
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
          name: "Bachelor of Medicine, Bachelor of Surgery",
          short: "MBBS",
          code: "MBBS",
        },
        { name: "Bachelor of Dental Surgery", short: "BDS", code: "BDS" },
        {
          name: "Bachelor of Science in Nursing",
          short: "BSc Nursing",
          code: "BSCN",
        },
        { name: "Bachelor of Nursing Science", short: "BNS", code: "BNS" },
        {
          name: "Bachelor of Audiology and Speech Language Pathology",
          short: "BASLP",
          code: "BASLP",
        },
        { name: "Bachelor of Optometry", short: "BOptom", code: "BOPTOM" },
        {
          name: "Bachelor of Science in Medical Laboratory Technology",
          short: "BSc MLT",
          code: "MLT",
        },
        {
          name: "Bachelor of Science in Medical Imaging Technology",
          short: "BSc MIT",
          code: "MIT",
        },
        { name: "Bachelor of Public Health", short: "BPH", code: "BPH" },
        { name: "Bachelor of Pharmacy", short: "BPharm", code: "BPHARM" },
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
          name: "Bachelor of Engineering in Civil Engineering",
          short: "BE Civil",
          code: "BECIVIL",
        },
        {
          name: "Bachelor of Engineering in Computer Engineering",
          short: "BE Computer",
          code: "BECOMP",
        },
        {
          name: "Bachelor of Engineering in Electrical and Electronics Engineering",
          short: "BE Electrical",
          code: "BEEE",
        },
        {
          name: "Bachelor of Engineering in Mechanical Engineering",
          short: "BE Mechanical",
          code: "BEMECH",
        },
        {
          name: "Bachelor of Engineering in Chemical Engineering",
          short: "BE Chemical",
          code: "BECHEM",
        },
        { name: "Bachelor of Architecture", short: "BArch", code: "BARCH" },
        {
          name: "Bachelor in Information Technology",
          short: "BIT",
          code: "BIT",
        },
        {
          name: "Bachelor of Science in Computer Science",
          short: "BSc Computer Science",
          code: "BSCS",
        },
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
          name: "Bachelor of Science in Nursing",
          short: "BSc Nursing",
          code: "BSCN",
        },
        { name: "Bachelor of Pharmacy", short: "BPharm", code: "BPHARM" },
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
          name: "Bachelor of Civil Engineering",
          short: "BE Civil",
          code: "BECIVIL",
        },
        {
          name: "Bachelor of Computer Engineering",
          short: "BE Computer",
          code: "BECOMP",
        },
        {
          name: "Bachelor of Software Engineering",
          short: "BE Software",
          code: "BESOFT",
        },
        {
          name: "Bachelor of Electrical and Electronics Engineering",
          short: "BE EEE",
          code: "BEEE",
        },
        {
          name: "Bachelor of Electronics and Communication Engineering",
          short: "BE EI",
          code: "BEEI",
        },
        { name: "Bachelor of Computer Application", short: "BCA", code: "BCA" },
        {
          name: "Bachelor of Business Administration",
          short: "BBA",
          code: "BBA",
        },
        { name: "Bachelor of Hotel Management", short: "BHM", code: "BHM" },
        { name: "Bachelor of Pharmacy", short: "BPharm", code: "BPHARM" },
        {
          name: "Bachelor of Science in Nursing",
          short: "BSc Nursing",
          code: "BSCN",
        },
        {
          name: "Bachelor of Health Care Management",
          short: "BHCM",
          code: "BHCM",
        },
        {
          name: "Bachelor of Science in Biochemistry",
          short: "BSc Biochemistry",
          code: "BSCBIO",
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
          name: "Bachelor of Civil Engineering",
          short: "BE Civil",
          code: "BECIVIL",
        },
        {
          name: "Bachelor of Computer Engineering",
          short: "BE Computer",
          code: "BECOMP",
        },
        {
          name: "Bachelor of Electronics, Communication and Automation Engineering",
          short: "BE ECA",
          code: "BECAE",
        },
        {
          name: "Bachelor of Biomedical Engineering",
          short: "BE Biomedical",
          code: "BEBIOMED",
        },
        { name: "Bachelor of Computer Application", short: "BCA", code: "BCA" },
        {
          name: "Bachelor of Business Administration",
          short: "BBA",
          code: "BBA",
        },
        { name: "Bachelor of Business Studies", short: "BBS", code: "BBS" },
        { name: "Bachelor of Arts", short: "BA", code: "BA" },
        {
          name: "Bachelor of Information Technology",
          short: "BIT",
          code: "BIT",
        },
        {
          name: "Bachelor of Science in Agriculture",
          short: "BSc Agriculture",
          code: "BSCAGRI",
        },
        { name: "Bachelor of Pharmacy", short: "BPharm", code: "BPHARM" },
        {
          name: "Bachelor of Science in Nursing",
          short: "BSc Nursing",
          code: "BSCN",
        },
        {
          name: "Bachelor of Veterinary Science and Animal Husbandry",
          short: "BVSc & AH",
          code: "BVSCAH",
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
          name: "Diploma in Civil Engineering",
          short: "Civil Engineering",
          code: "DCE",
        },
        {
          name: "Diploma in Computer Engineering",
          short: "Computer Engineering",
          code: "DCOE",
        },
        {
          name: "Diploma in Electrical Engineering",
          short: "Electrical Engineering",
          code: "DEE",
        },
        {
          name: "Diploma in Mechanical Engineering",
          short: "Mechanical Engineering",
          code: "DME",
        },
        {
          name: "Diploma in Electronics Engineering",
          short: "Electronics Engineering",
          code: "DEELEC",
        },
        {
          name: "Diploma in Automobile Engineering",
          short: "Automobile Engineering",
          code: "DAE",
        },
        {
          name: "Diploma in Information Technology",
          short: "Information Technology",
          code: "DIT",
        },
        { name: "Diploma in Pharmacy", short: "Pharmacy", code: "DPHARM" },
        { name: "Diploma in Nursing", short: "Nursing", code: "DNURS" },
        {
          name: "Diploma in Hotel Management",
          short: "Hotel Management",
          code: "DHM",
        },
      ],
      years: [1, 2, 3],
      semesters: [1, 2, 3, 4, 5, 6],
    },
  };

  const [filters, setFilters] = useState({
    boards: Object.keys(boardData),
    courses: [],
    subjects: [],
    years: [],
    semesters: [],
  });

  // Navigation steps
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
      title: "Select Subject",
      description: "Choose the subject you want to study",
    },
    {
      id: 4,
      title: "Browse Books",
      description: "Explore available study materials",
    },
  ];

  // Fetch available filters on component mount
  useEffect(() => {
    fetchFilters();
  }, []);

  // Fetch books when we reach the books step
  useEffect(() => {
    if (currentStep === 4) {
      fetchStudyBooks();
    }
  }, [
    currentStep,
    selectedBoard,
    selectedCourse,
    selectedYear,
    selectedSemester,
    selectedSubject,
  ]);

  // Get API base URL from environment
  const getApiBaseUrl = () => {
    return (
      process.env.NEXT_PUBLIC_API_URL || "https://adhyaan.up.railway.app/api/v1"
    );
  };

  const fetchFilters = async () => {
    const baseUrl = getApiBaseUrl();
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/books/academic/boards`);
      if (response.ok) {
        const data = await response.json();
        // data.boards is an array of {name, type}
        setFilters((prev) => ({
          ...prev,
          boards: data.boards.map((b) => b.name),
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
        setFilters((prev) => ({
          ...prev,
          courses: data.courses,
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
    try {
      setLoading(true);
      const response = await fetch(
        `${baseUrl}/books/academic/year-semester?board=${encodeURIComponent(board)}&course=${encodeURIComponent(course)}`,
      );
      if (response.ok) {
        const data = await response.json();
        // data has {type: 'grades', grades: []} or {type: 'year_semester', data: {}}
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

  const fetchSubjects = async (board, course, year, semester) => {
    const baseUrl = getApiBaseUrl();
    try {
      setLoading(true);
      let url = `${baseUrl}/books/academic/subjects?board=${encodeURIComponent(board)}&course=${encodeURIComponent(course)}`;
      if (year) url += `&year=${year}`;
      if (semester) url += `&semester=${semester}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFilters((prev) => ({
          ...prev,
          subjects: data.subjects,
        }));
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudyBooks = async () => {
    const baseUrl = getApiBaseUrl();
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedBoard) params.append("board", selectedBoard);
      if (selectedCourse) params.append("course_name", selectedCourse);
      if (selectedYear) params.append("year", selectedYear);
      if (selectedSemester) params.append("semester", selectedSemester);
      if (selectedSubject) params.append("subject_name", selectedSubject);

      const response = await fetch(
        `${baseUrl}/books/academic?${params}&limit=100`,
      );
      if (response.ok) {
        const data = await response.json();
        setStudyBooks(data.books || []);
      }
    } catch (error) {
      console.error("Error fetching study books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardSelect = (board) => {
    setSelectedBoard(board);
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedSemester("");
    setSelectedSubject("");
    fetchCoursesForBoard(board);
    setCurrentStep(1);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedYear("");
    setSelectedSemester("");
    setSelectedSubject("");
    fetchYearSemesterForCourse(selectedBoard, course);
    setCurrentStep(2);
  };

  const handleYearSemesterSelect = (year, semester) => {
    setSelectedYear(year);
    setSelectedSemester(semester);
    setSelectedSubject("");
    fetchSubjects(selectedBoard, selectedCourse, year, semester);
    setCurrentStep(3);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setCurrentStep(4);
  };

  const goToPreviousStep = () => {
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
    setSelectedSubject("");
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
        // Allow going back to previous steps, but not forward
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
        {filters.boards.map((boardKey, index) => {
          const board = boardData[boardKey] || {
            name: boardKey,
            short: boardKey,
            type: "university",
          };

          return (
            <BoardCard
              key={boardKey}
              board={{ ...board, index }}
              onClick={() => handleBoardSelect(boardKey)}
              isSelected={selectedBoard === boardKey}
            />
          );
        })}
      </div>
    </div>
  );

  const renderCourseSelection = () => {
    // Get courses for the selected board
    const boardInfo = boardData[selectedBoard];
    const availableCourses = boardInfo ? boardInfo.courses : [];

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
            // Check if we have additional info in boardData (fallback)
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
    const boardInfo = boardData[selectedBoard];

    // For NEB (school level), show grades
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

    // For other boards, show year/semester/part structure
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
          <span className={styles.breadcrumbItem}>{selectedBoard}</span>
          <span className={styles.breadcrumbSeparator}>→</span>
          <span className={styles.breadcrumbItem}>{selectedCourse}</span>
          <span className={styles.breadcrumbSeparator}>→</span>
          <span className={styles.breadcrumbItem}>
            Year {selectedYear} Sem {selectedSemester}
          </span>
          <span className={styles.breadcrumbSeparator}>→</span>
          <span className={styles.breadcrumbItem}>Subjects</span>
        </div>
      </div>

      <h2 className={styles.selectionTitle}>Choose Your Subject</h2>
      <p className={styles.selectionDescription}>
        Select the subject you want to study materials for
      </p>

      <div className={styles.optionsGrid}>
        {filters.subjects.map((subject) => (
          <Card
            key={subject}
            hover
            className={`${styles.optionCard} ${selectedSubject === subject ? styles.selected : ""}`}
            onClick={() => handleSubjectSelect(subject)}
          >
            <div className={styles.optionIcon}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className={styles.optionContent}>
              <h3 className={styles.optionTitle}>{subject}</h3>
              <p className={styles.optionDescription}>
                Study materials and resources for {subject}
              </p>
            </div>
            {selectedSubject === subject && (
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
          <span className={styles.breadcrumbSeparator}>→</span>
          <span className={styles.breadcrumbItem}>{selectedCourse}</span>
          <span className={styles.breadcrumbSeparator}>→</span>
          <span className={styles.breadcrumbItem}>
            Year {selectedYear} Sem {selectedSemester}
          </span>
          <span className={styles.breadcrumbSeparator}>→</span>
          <span className={styles.breadcrumbItem}>{selectedSubject}</span>
        </div>

        <div className={styles.booksSearch}>
          <div className={styles.searchBar}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.booksContent}>
        <h2 className={styles.booksTitle}>
          {selectedSubject} Books - {selectedCourse}
        </h2>
        <p className={styles.booksSubtitle}>
          Year {selectedYear}, Semester {selectedSemester} • {selectedBoard}
        </p>

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
                  class: `Year ${book.year} - Sem ${book.semester}`,
                  cover: "#4F46E5",
                  rating: 4.5,
                  students: Math.floor(Math.random() * 1000) + 100,
                }}
                formatGenre={formatGenre}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <h3>No books found</h3>
            <p>
              No study materials are currently available for this selection.
            </p>
            <Button variant="primary" onClick={goToPreviousStep}>
              Choose Different Subject
            </Button>
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

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Current Step Content */}
        <Card className={styles.mainCard}>
          {currentStep === 0 && renderBoardSelection()}
          {currentStep === 1 && renderCourseSelection()}
          {currentStep === 2 && renderYearSemesterSelection()}
          {currentStep === 3 && renderSubjectSelection()}
          {currentStep === 4 && renderBooksView()}
        </Card>
      </div>
    </div>
  );
}
