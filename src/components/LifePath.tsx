// src/components/LifePath.tsx

import React, { useState } from 'react'; // ★ useState をインポート
import type { LifeData, AgeEvent } from '../types';

interface Props {
  lifeData: LifeData;
  onAgeEventClick: (event: AgeEvent) => void;
  
  // ★ 編集モード用のprops
  isEditing: boolean;
  onAddEvent: (age: number, title: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdateEvent: (eventId: string, newAge: number, newTitle: string) => void;
}

// ★ 新規イベント追加フォームのコンポーネント (LifePath内に定義)
interface AddEventFormProps {
  onAddEvent: (age: number, title: string) => void;
}
const AddEventForm: React.FC<AddEventFormProps> = ({ onAddEvent }) => {
  const [age, setAge] = useState(25); // デフォルト年齢
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') return;
    onAddEvent(age, title);
    setTitle(''); // フォームをリセット
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-200 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">新しいイベントを追加</h3>
      <div className="flex flex-col sm:flex-row gap-2">
        <input 
          type="number" 
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          min="0"
          max="120"
          className="w-full sm:w-20 p-2 border rounded"
          placeholder="年齢"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-grow p-2 border rounded"
          placeholder="イベント名（例: 就職）"
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">
          追加
        </button>
      </div>
    </form>
  );
};


export const LifePath: React.FC<Props> = ({ 
  lifeData, 
  onAgeEventClick,
  isEditing,
  onAddEvent,
  onDeleteEvent,
  onUpdateEvent
}) => {
  
  // ★ どのイベントを編集中かIDで管理する state
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  // ★ 編集中のフォームデータを保持する state
  const [editFormData, setEditFormData] = useState({ age: 0, title: '' });

  const { currentAge, lifeExpectancy, events, futurePaths } = lifeData;
  const viewHeight = 1000;
  const yearHeight = viewHeight / lifeExpectancy;
  const currentAgeY = currentAge * yearHeight;
  const centerX = 150; 

  // ★ 編集開始処理
  const handleStartEditing = (event: AgeEvent) => {
    setEditingEventId(event.id);
    setEditFormData({ age: event.age, title: event.title });
  };
  
  // ★ 編集キャンセル処理
  const handleCancelEditing = () => {
    setEditingEventId(null);
  };

  // ★ 編集実行処理
  const handleUpdateSubmit = () => {
    if (editingEventId === null) return;
    onUpdateEvent(editingEventId, editFormData.age, editFormData.title);
    setEditingEventId(null); // 編集モードを終了
  };
  
  // ★ フォーム入力のハンドラ
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value
    }));
  };

  return (
    // ★ 全体のコンテナ (レスポンシブ対応)
    <div className="w-full max-w-md">
      
      {/* ★ 編集モードがONの時だけ、追加フォームを表示 */}
      {isEditing && <AddEventForm onAddEvent={onAddEvent} />}

      {/* ★ 道の描画エリア */}
      <div className="relative w-[300px] h-[1000px] bg-gray-100 overflow-hidden mx-auto border border-gray-300">
        
        {/* SVGで道を描画 (変更なし) */}
        <svg width="300" height="1000" className="absolute top-0 left-0">
          <path d={`M ${centerX},0 L ${centerX},${currentAgeY}`} stroke="black" strokeWidth="10" fill="none" />
          {futurePaths.length === 0 && (
            <path d={`M ${centerX},${currentAgeY} L ${centerX},${viewHeight}`} stroke="black" strokeWidth="10" strokeDasharray="10 10" fill="none" />
          )}
          {futurePaths.map((path, index) => {
            const futurePathX = centerX + (index - (futurePaths.length - 1) / 2) * 60;
            return (
              <path key={path.id} d={`M ${centerX},${currentAgeY} L ${futurePathX},${viewHeight}`} stroke="gray" strokeWidth="10" strokeDasharray="10 10" fill="none" className="hover:stroke-blue-500 cursor-pointer"
                onClick={() => !isEditing && alert(`道: ${path.title}\nメモ: ${path.memos}`)} // 編集モード中はアラートも出さない
              />
            );
          })}
        </svg>

        {/* 3. 年齢イベントボタンの配置 */}
        {events.map((event) => {
          const eventY = event.age * yearHeight;
          
          return (
            <div
              key={event.id}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full px-2" // 幅を広げて重なりを許容
              style={{ top: `${eventY}px` }}
            >
              {/* ★ 編集中か、通常表示かで切り替え */}
              {isEditing && editingEventId === event.id ? (
                // (A) このイベントを編集中
                <div className="p-2 bg-white border-2 border-blue-500 rounded shadow-lg">
                  <input
                    type="number"
                    name="age"
                    value={editFormData.age}
                    onChange={handleEditFormChange}
                    className="w-16 p-1 border rounded mb-1 text-sm"
                  />
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditFormChange}
                    className="w-full p-1 border rounded mb-2 text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={handleCancelEditing} className="text-xs text-gray-600 hover:text-gray-900">キャンセル</button>
                    <button onClick={handleUpdateSubmit} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700">保存</button>
                  </div>
                </div>
              ) : (
                // (B) 通常表示（編集モード中 or 通常モード）
                <div className="flex items-center justify-center">
                  <button
                    className={`bg-blue-500 text-white 
                               font-bold py-1 px-3 rounded-full text-sm
                               ${isEditing ? 'cursor-default' : 'hover:bg-blue-700'}
                               whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]`} // タイトルが長い場合...で省略
                    title={`${event.age}歳: ${event.title}`} // ホバーでフル表示
                    // ★ 編集モード中はTodoページに遷移させない
                    onClick={() => !isEditing && onAgeEventClick(event)}
                  >
                    {event.age}歳: {event.title}
                  </button>

                  {/* ★ 編集モード中のみ「編集」「削除」ボタンを表示 */}
                  {isEditing && (
                    <div className="ml-2 flex gap-1 flex-shrink-0">
                      <button 
                        onClick={() => handleStartEditing(event)}
                        className="p-1 bg-yellow-400 rounded text-xs hover:bg-yellow-500"
                      >
                        編集
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`「${event.title}」を削除しますか？\n(関連するTodoもすべて削除されます)`)) {
                            onDeleteEvent(event.id);
                          }
                        }}
                        className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* 現在年齢のマーカー (変更なし) */}
        <div 
          className="absolute left-0 w-full z-20"
          style={{ top: `${currentAgeY}px` }}
        >
          <div className="relative">
            <hr className="border-t-2 border-red-500" />
            <span className="absolute -top-3 left-2 bg-red-500 text-white text-xs px-1 rounded">
              {currentAge}歳 (現在)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};