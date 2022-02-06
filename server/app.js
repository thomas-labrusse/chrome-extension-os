import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

// Import Routers
import collectionRouter from './routes/collectionRoutes.js'

const app = express()

// // Initialize database (JSON file so far)
// const collection = JSON.parse(fs.readFileSync(`./data/collection.json`));

// MIDDLEWARES
app.use(morgan('dev'))
app.use(cors())
// Adding body to req.body
app.use(express.json())

// ROUTES & HANDLERS
app.use('/api/v1/collection', collectionRouter)

// HANDLING UNHANDLED ROUTES
app.all('*', (req, res, next) => {
	res.status(404).json({
		status: 'fail',
		message: `Can't find ${req.originalUrl} on this server`,
	})
	next()
})

export default app
