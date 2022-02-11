import express from 'express'

// Importing handlers
import {
	getAllItems,
	createItem,
	getItem,
} from './../controllers/itemController.js'

import { getCollectionId } from './../controllers/collectionController.js'

// Routes
const router = express.Router({ mergeParams: true })

router.route('/').get(getAllItems).post(getCollectionId, createItem)

router.route('/:itemNb').get(getCollectionId, getItem)

export default router
