'use client';

import { useState, useEffect } from 'react';
import { generateJoinCode } from '@/utils/generateJoinCode';

export const useStudyRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  const createRoom = async (roomData) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const newRoom = {
        id: Date.now().toString(),
        roomCode: generateJoinCode(),
        ...roomData,
        isActive: true,
        participants: [],
        createdAt: new Date(),
      };
      
      setRooms([...rooms, newRoom]);
      setCurrentRoom(newRoom);
      return newRoom;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomCode) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const room = rooms.find(r => r.roomCode === roomCode);
      if (room) {
        setCurrentRoom(room);
        return room;
      }
      throw new Error('Room not found');
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
  };

  return {
    rooms,
    currentRoom,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
  };
};
