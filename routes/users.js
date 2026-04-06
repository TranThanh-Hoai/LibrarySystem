const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controller/userController');
const { authenticateToken, authorizeRole } = require('../utils/auth');

router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const result = await createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const result = await updateUser(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const result = await deleteUser(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

module.exports = router;