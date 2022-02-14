import express from 'express'

// Importing handlers
import {
	getAllItems,
	createItem,
	getItem,
	deleteCollectionItems,
} from './../controllers/itemController.js'

import { getCollectionId } from './../controllers/collectionController.js'

// Routes
const router = express.Router({ mergeParams: true })

router
	.route('/')
	.get(getAllItems)
	.post(getCollectionId, createItem)
	.delete(getCollectionId, deleteCollectionItems)

router.route('/:itemNb').get(getCollectionId, getItem)

export default router
