// Study Room Type Definition
export const StudyRoomType = {
  id: 'string',
  roomCode: 'string',
  title: 'string',
  subject: 'string',
  description: 'string',
  authorId: 'string',
  authorName: 'string',
  isActive: 'boolean',
  participants: 'array',
  materials: 'array',
  createdAt: 'date',
  startTime: 'date',
  endTime: 'date',
};

export const createStudyRoom = (data) => ({
  id: data.id || '',
  roomCode: data.roomCode || '',
  title: data.title || '',
  subject: data.subject || '',
  description: data.description || '',
  authorId: data.authorId || '',
  authorName: data.authorName || '',
  isActive: data.isActive || false,
  participants: data.participants || [],
  materials: data.materials || [],
  createdAt: data.createdAt || new Date(),
  startTime: data.startTime || null,
  endTime: data.endTime || null,
});
