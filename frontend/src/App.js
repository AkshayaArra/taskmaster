import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import io from 'socket.io-client';
import KanbanBoard from './components/KanbanBoard';
import Login from './components/Login';
import Register from './components/Register';

const socket = io('http://localhost:5000');

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    socket.on('taskUpdate', (task) => {
      setTasks((prev) => [...prev.filter(t => t._id !== task._id), task]);
    });
    socket.on('taskDeleted', (taskId) => {
      setTasks((prev) => prev.filter(t => t._id !== taskId));
    });
    return () => {
      socket.off('taskUpdate');
      socket.off('taskDeleted');
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path='/' element={<KanbanBoard tasks={tasks} />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </Router>
  );
}
export default App;