const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()


const app = express()
app.use(cors({
    origin: 'https://luxury-tapioca-f29a84.netlify.app'
}))
app.use(express.json())

// Routes
app.use('/api/applications', require('./routes/applications'))

// MongoDB connect 

mongoose.connect(process.env.MONGO_URI)
   .then(() => console.log('MongoDB Connected'))
   .catch(err => console.log(err))


const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`))