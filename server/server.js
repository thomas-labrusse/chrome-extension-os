import dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config({ path: './config.env' })
import app from './app.js'

// CONNECTING TO DB
const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
)

mongoose.connect(DB, {}).then(() => console.log('App connected to DB 🎉 !'))

// STARTING THE SERVER
const port = 3001
app.listen(port, () => {
	console.log(`NFT Trait app running on port ${port}`)
})
