import express from 'express'
// Importing handlers
import {
	getAllCollections,
	createNewCollection,
	getCollection,
	deleteCollection,
	updateCollectionItems,
	updateCollection,
} from './../controllers/collectionController.js'

// Importing nested routes
import itemRouter from './itemRoutes.js'

// Routes
const router = express.Router()

// Mounting nested route for items
router.use('/:contractAddress/items', itemRouter)

router.route('/').get(getAllCollections).post(createNewCollection)

router
	.route('/:contractAddress')
	.get(getCollection)
	.patch(updateCollectionItems)
	.delete(deleteCollection)

router.route('/update/:contractAddress').patch(updateCollection)

export default router
