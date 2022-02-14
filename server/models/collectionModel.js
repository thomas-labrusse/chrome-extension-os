import mongoose from 'mongoose'
import slugify from 'slugify'

const collectionSchema = new mongoose.Schema(
	{
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
		attributes: [],
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

// Automatic slug proprety on document creation with a document MW
collectionSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true })
	next()
})

const Collection = mongoose.model('Collection', collectionSchema)

export default Collection
