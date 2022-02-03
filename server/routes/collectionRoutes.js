import express from 'express'
// Importing handlers
import {
	getAllCollections,
	createNewCollection,
	getCollection,
	updateCollectionItems,
} from './../controllers/collectionController.js'

// Routes
const router = express.Router()

router.route('/').get(getAllCollections).post(createNewCollection)
router
	.route('/:contractAddress')
	.get(getCollection)
	.patch(updateCollectionItems)

export default router
