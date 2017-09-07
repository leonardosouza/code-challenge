'use strict'
const path = require('path')
const express = require('express')
const app = express()

app.use('/', express.static(path.join(__dirname, 'dist')))
app.set('PORT', 8080)
app.listen(app.get('PORT'), () => console.log(`Listening on http://localhost:${app.get('PORT')}`))
