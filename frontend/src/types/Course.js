// Course Type Definition
export const CourseType = {
  id: 'string',
  board: 'string', // NEB, TU, PU, KU, IOE
  level: 'string', // Primary, Secondary, Undergraduate
  classYear: 'string',
  subject: 'string',
  syllabus: 'string',
  books: 'array',
  createdAt: 'date',
};

export const createCourse = (data) => ({
  id: data.id || '',
  board: data.board || '',
  level: data.level || '',
  classYear: data.classYear || '',
  subject: data.subject || '',
  syllabus: data.syllabus || '',
  books: data.books || [],
  createdAt: data.createdAt || new Date(),
});

export const BOARDS = ['NEB', 'TU', 'PU', 'KU', 'IOE'];
export const LEVELS = ['Primary', 'Secondary', 'Undergraduate'];
export const PRIMARY_CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'];
export const SECONDARY_CLASSES = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
export const UNDERGRADUATE_YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
