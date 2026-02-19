import apiService from './api';

export const studyRoomService = {
  async getAllRooms() {
    return await apiService.get('/study-rooms');
  },

  async getRoomByCode(roomCode) {
    return await apiService.get(`/study-rooms/code/${roomCode}`);
  },

  async createRoom(roomData) {
    return await apiService.post('/study-rooms', roomData);
  },

  async joinRoom(roomCode, userId) {
    return await apiService.post(`/study-rooms/${roomCode}/join`, { userId });
  },

  async leaveRoom(roomCode, userId) {
    return await apiService.post(`/study-rooms/${roomCode}/leave`, { userId });
  },

  async updateRoom(roomId, roomData) {
    return await apiService.put(`/study-rooms/${roomId}`, roomData);
  },

  async deleteRoom(roomId) {
    return await apiService.delete(`/study-rooms/${roomId}`);
  },

  async getUserRooms(userId) {
    return await apiService.get(`/study-rooms/user/${userId}`);
  },
};
