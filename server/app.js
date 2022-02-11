import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import globalErrorHandler from './controllers/errorController.js'
import AppError from './utils/appErrors.js'

// Import Routers
import collectionRouter from './routes/collectionRoutes.js'
import itemRouter from './routes/itemRoutes.js'

const app = express()

// // Initialize database (JSON file so far)
// const collection = JSON.parse(fs.readFileSync(`./data/collection.json`));

// MIDDLEWARES
app.use(morgan('dev'))
app.use(cors())
// Adding body to req.body
app.use(express.json({ limit: '10mb' }))

// MOUNTING ROUTES
app.use('/api/v1/collections', collectionRouter)
app.use('/api/v1/items', itemRouter)

// HANDLING UNHANDLED ROUTES
app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

// NOTE: Detected as an error handling MW because first parameter is "err"
app.use(globalErrorHandler)

export default app
