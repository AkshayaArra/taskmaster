const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});
const User = mongoose.model('User', UserSchema);

// Task Schema
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  userId: mongoose.Schema.Types.ObjectId
});
const Task = mongoose.model('Task', TaskSchema);

// User Registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });
  await user.save();
  res.status(201).send('User registered');
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user._id });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Fetch Tasks
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Create Task
app.post('/tasks', async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  io.emit('taskUpdate', task);
  res.status(201).json(task);
});

// Update Task
app.put('/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  io.emit('taskUpdate', task);
  res.json(task);
});

// Delete Task
app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  io.emit('taskDeleted', req.params.id);
  res.status(204).send();
});

server.listen(5000, () => console.log('Server running on port 5000'));