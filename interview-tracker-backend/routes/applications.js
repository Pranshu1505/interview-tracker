const express = require('express')
const router = express.Router()
const Application = require('../models/Application')

// Get all
router.get('/', async (req, res) => {
  try {
    const apps = await Application.find().sort({ createdAt: -1 })
    res.json(apps)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Create
router.post('/', async (req, res) => {
  try {
    const app = new Application(req.body)
    await app.save()
    res.json(app)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// Update
router.put('/:id', async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(req.body.id || req.params.id, req.body, { new: true })
    res.json(app)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router