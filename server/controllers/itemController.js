import Item from './../models/itemModel.js'
import Collection from './../models/collectionModel.js'

// GETTING ALL ITEMS
export const getAllItems = async (req, res, next) => {
	try {
		const items = await Item.find()
		res.status(200).json({
			status: 'success',
			results: items.length,
			data: {
				items,
			},
		})
	} catch (err) {
		console.log(err)
		res.status(400).json({
			status: 'fail',
			message: err,
		})
	}
}

// GET ONE ITEM
export const getItem = async (req, res, next) => {
	try {
		let item
		let collectionId
		console.log('req.params:', req.params)
		if (req.collectionId) collectionId = req.collectionId
		// ContractAddress params collected from nested route

		console.log('collectionId:', collectionId)
		if (req.params.itemNb) {
			item = await Item.findOne({
				nb: req.params.itemNb,
				nftCollection: collectionId,
			})
		}
		console.log('ITEM FOUND:', item)
		res.status(200).json({
			status: 'success',
			data: {
				item,
			},
		})
	} catch (err) {
		console.log(err)
		res.status(400).json({
			status: 'fail',
			message: err,
		})
	}
}

// CREATE A NEW ITEM
export const createItem = async (req, res, next) => {
	try {
		console.log('req.body: ', req.body)
		console.log('req.params: ', req.params)
		let newItems, newItem
		// Create in bulk if more than one item to create
		if (req.body.length > 1) {
			let itemsArray = req.body
			if (!req.body.nftCollection) {
				itemsArray.forEach((el) => (el.nftCollection = req.collectionId))
			}
			newItems = await Item.insertMany(itemsArray)
			// Create only one item otherwise
		} else {
			if (!req.body.nftCollection) req.body.nftCollection = req.collectionId

			newItem = await Item.create(req.body)
		}

		res.status(201).json({
			status: 'success',
			data: {
				item: newItem ? newItem : newItems,
			},
		})
	} catch (err) {
		console.log(err)
		res.status(400).json({
			status: 'fail',
			message: err,
		})
	}
}
