import express from 'express'
// Importing handlers
import {
	getAllCollections,
	createNewCollection,
	getCollection,
	deleteCollection,
	updateCollectionItems,
} from './../controllers/collectionController.js'

// Importing nested routes
import itemRouter from './itemRoutes.js'

// Routes
const router = express.Router()

// Mounting nested route for items
router.use('/:collectionId/items', itemRouter)

router.route('/').get(getAllCollections).post(createNewCollection)
router
	.route('/:contractAddress')
	.get(getCollection)
	.patch(updateCollectionItems)
	.delete(deleteCollection)

export default router
