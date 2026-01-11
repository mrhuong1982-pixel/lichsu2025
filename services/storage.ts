import { User, Question, GameConfig, DEFAULT_CONFIG } from '../types';
import { INITIAL_QUESTIONS } from '../constants';

const KEYS = {
  USERS: 'vn_history_users',
  QUESTIONS: 'vn_history_questions',
  CONFIG: 'vn_history_config',
  CURRENT_USER_ID: 'vn_history_current_user_id'
};

// --- Config ---
export const getGameConfig = (): GameConfig => {
  const stored = localStorage.getItem(KEYS.CONFIG);
  if (!stored) {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    return DEFAULT_CONFIG;
  }
  return JSON.parse(stored);
};

export const saveGameConfig = (config: GameConfig) => {
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
};

// --- Questions ---
export const getQuestions = (): Question[] => {
  const stored = localStorage.getItem(KEYS.QUESTIONS);
  if (!stored) {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    return INITIAL_QUESTIONS;
  }
  return JSON.parse(stored);
};

export const saveQuestions = (questions: Question[]) => {
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
};

// --- Users ---
export const getUsers = (): User[] => {
  const stored = localStorage.getItem(KEYS.USERS);
  return stored ? JSON.parse(stored) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
  } else {
    users.push(user);
  }
  saveUsers(users);
};

export const deleteUser = (userId: string) => {
    const users = getUsers().filter(u => u.id !== userId);
    saveUsers(users);
}

// --- Session ---
export const getCurrentUserId = (): string | null => {
  return localStorage.getItem(KEYS.CURRENT_USER_ID);
};

export const setCurrentUserId = (id: string | null) => {
  if (id) {
    localStorage.setItem(KEYS.CURRENT_USER_ID, id);
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER_ID);
  }
};