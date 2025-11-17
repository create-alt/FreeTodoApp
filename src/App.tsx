// src/App.tsx

import { useState } from 'react';
import type { LifeData, AgeEvent, Todo } from './types'; 
import { useLocalStorage } from './hooks/useLocalStorage'; 
import { INITIAL_LIFE_DATA } from './initData'; 
import { LifePath } from './components/LifePath.tsx'; 
import { TodoPage } from './components/TodoPage.tsx'; 

function App() {
  const [lifeData, setLifeData] = useLocalStorage<LifeData>(
    'paveLifeData', 
    INITIAL_LIFE_DATA 
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // ★ 1. イベント編集モードの状態を追加
  const [isEventEditingMode, setIsEventEditingMode] = useState(false);

  const handleAgeEventClick = (event: AgeEvent) => {
    setSelectedEventId(event.id);
  };
  const handleBackToPath = () => {
    setSelectedEventId(null);
  };

  // --- Todo編集ロジック (変更なし) ---
  const updateTodosForEvent = (eventId: string, updatedTodos: Todo[]) => {
    setLifeData(prevLifeData => {
      const newEvents = prevLifeData.events.map(event => {
        if (event.id === eventId) {
          return { ...event, todos: updatedTodos };
        }
        return event; 
      });
      return { ...prevLifeData, events: newEvents };
    });
  };
  const handleAddNewTodo = (eventId: string, todoText: string) => {
    const newTodo: Todo = { id: crypto.randomUUID(), text: todoText, isCompleted: false };
    const currentEvent = lifeData.events.find(e => e.id === eventId);
    if (!currentEvent) return; 
    const updatedTodos = [...currentEvent.todos, newTodo]; 
    updateTodosForEvent(eventId, updatedTodos);
  };
  const handleToggleTodo = (eventId: string, todoId: string) => {
    const currentEvent = lifeData.events.find(e => e.id === eventId);
    if (!currentEvent) return;
    const updatedTodos = currentEvent.todos.map(todo => {
      if (todo.id === todoId) {
        return { ...todo, isCompleted: !todo.isCompleted };
      }
      return todo;
    });
    updateTodosForEvent(eventId, updatedTodos);
  };
  const handleDeleteTodo = (eventId: string, todoId: string) => {
    const currentEvent = lifeData.events.find(e => e.id === eventId);
    if (!currentEvent) return;
    const updatedTodos = currentEvent.todos.filter(todo => todo.id !== todoId);
    updateTodosForEvent(eventId, updatedTodos);
  };
  const handleUpdateTodoText = (eventId: string, todoId: string, newText: string) => {
    const currentEvent = lifeData.events.find(e => e.id === eventId);
    if (!currentEvent) return;
    const updatedTodos = currentEvent.todos.map(todo => {
      if (todo.id === todoId) {
        return { ...todo, text: newText }; 
      }
      return todo;
    });
    updateTodosForEvent(eventId, updatedTodos);
  };
  // --- Todo編集ロジックここまで ---

  // --- ★ 2. AgeEvent編集ロジック (ここから追加) ---

  // (A) AgeEventの追加
  const handleAddEvent = (age: number, title: string) => {
    if (title.trim() === '') return; 
    
    const newEvent: AgeEvent = {
      id: crypto.randomUUID(),
      age: age,
      title: title,
      todos: [], // 新しいイベントのTodoは空
    };
    
    setLifeData(prev => ({
      ...prev,
      // events配列の末尾に新しいイベントを追加し、年齢順にソートする
      events: [...prev.events, newEvent].sort((a, b) => a.age - b.age)
    }));
  };

  // (B) AgeEventの削除
  const handleDeleteEvent = (eventId: string) => {
    setLifeData(prev => ({
      ...prev,
      // 対象のID以外のイベントで新しい配列を作成
      events: prev.events.filter(event => event.id !== eventId)
    }));
  };

  // (C) AgeEventの更新
  const handleUpdateEvent = (eventId: string, newAge: number, newTitle: string) => {
    if (newTitle.trim() === '') return; 

    setLifeData(prev => ({
      ...prev,
      events: prev.events.map(event => {
        if (event.id === eventId) {
          // 対象のイベントを更新
          return { ...event, age: newAge, title: newTitle };
        }
        return event;
      }).sort((a, b) => a.age - b.age) // 更新後もソート
    }));
  };

  // --- ★ AgeEvent編集ロジックここまで ---

  // 最新のイベントデータを取得（変更なし）
  const currentEventData = selectedEventId 
    ? lifeData.events.find(e => e.id === selectedEventId) 
    : null;

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">PaveLife</h1>
      
      {/* ★ 3. 編集モード切替ボタンを追加 */}
      {/* Todoページ表示中は編集ボタンを隠す */}
      {selectedEventId === null && (
        <div className="mb-4">
          <button 
            onClick={() => setIsEventEditingMode(prev => !prev)}
            className={`px-4 py-2 rounded text-white font-bold
                        ${isEventEditingMode 
                          ? 'bg-red-500 hover:bg-red-700' 
                          : 'bg-indigo-500 hover:bg-indigo-700'}`}
          >
            {isEventEditingMode ? 'イベント編集を終了' : 'イベント（年齢）を追加・編集する'}
          </button>
        </div>
      )}
      
      {/* ★ 4. LifePath と TodoPage の表示分岐 */}
      {selectedEventId === null || !currentEventData ? (
        <LifePath 
          lifeData={lifeData} 
          onAgeEventClick={handleAgeEventClick}
          // ★ 編集用のpropsを LifePath に渡す
          isEditing={isEventEditingMode}
          onAddEvent={handleAddEvent}
          onDeleteEvent={handleDeleteEvent}
          onUpdateEvent={handleUpdateEvent}
        />
      ) : (
        <TodoPage 
          event={currentEventData} 
          onBack={handleBackToPath}
          // (Todoハンドラ...変更なし)
          onAddNewTodo={handleAddNewTodo}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
          onUpdateTodoText={handleUpdateTodoText}
        />
      )}
    </div>
  );
}

export default App;