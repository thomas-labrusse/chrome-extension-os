import mongoose from 'mongoose'
import slugify from 'slugify'

// TODO: How to deal with sub collections (for tokens = schema inception ? mixed array ?)
// const tokenSchema = new mongoose.Schema({
// 	id: {
// 		type: Number,
// 	},
// 	data: [],
// });

const collectionSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A collection must have a name'],
		unique: true,
	},
	slug: {
		type: String,
		// required: [true, 'A collection must have a slug'],
		unique: true,
	},
	contractAddress: {
		type: String,
		required: [true, 'A collection must have a contract address'],
		unique: true,
	},
	maxSupply: {
		type: Number,
	},
	baseURI: {
		type: String,
		required: [true, 'A collection must have a baseURI'],
	},
	tokens: {},
})

// Automatic slug proprety on document creation with a document MW
collectionSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true })
	next()
})

const Collection = mongoose.model('Collection', collectionSchema)

export default Collection
