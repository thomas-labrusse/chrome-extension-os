import mongoose from "mongoose";

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
		required: [true, "A collection must have a name"],
		unique: true,
	},
	slug: {
		type: String,
		required: [true, "A collection must have a slug"],
		unique: true,
	},
	contractAddress: {
		type: String,
		required: [true, "A collection must have a contract address"],
		unique: true,
	},
	maxSupply: {
		type: Number,
	},
	baseURI: {
		type: String,
		required: [true, "A collection must have a baseURI"],
	},
	tokens: {},
});

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
