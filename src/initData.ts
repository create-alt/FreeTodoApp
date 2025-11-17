// src/initData.ts
import type { LifeData } from './types';

// localStorageにデータがない場合の初期データ
export const INITIAL_LIFE_DATA: LifeData = {
  birthDate: '2006-01-01', // スケッチの「18歳」から逆算
  currentAge: 18, // スケッチの「18歳」
  lifeExpectancy: 80, // スケッチの「80歳」
  events: [
    {
      id: 'evt-1',
      age: 16, // スケッチの「16歳」
      title: '高校時代',
      todos: [
        { id: 'todo-1', text: '部活を頑張る', isCompleted: true },
        { id: 'todo-2', text: '初めてのバイト', isCompleted: false },
      ],
    },
    {
      id: 'evt-2',
      age: 20, // スケッチの「20歳」
      title: '大学時代',
      todos: [
        { id: 'todo-3', text: 'プログラミングの勉強', isCompleted: false },
      ],
    },
  ],
  futurePaths: [
    { id: 'path-1', title: 'Aの道', memos: 'Aの道に進んだ場合のメモ' },
    { id: 'path-2', title: 'Bの道', memos: 'Bの道に進んだ場合のメモ' },
  ],
};