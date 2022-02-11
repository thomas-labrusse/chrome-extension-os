import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'An item must have a name'],
		},
		nb: {
			type: Number,
			required: [true, 'An item requires a number'],
		},
		// TODO: embedded In the Collection or child referenced in the Collection ?
		attributes: {
			type: Array,
		},
		rarityScore: Number,
		rarityRank: Number,
		// Parent Referencing
		nftCollection: {
			type: mongoose.Schema.ObjectId,
			ref: 'Collection',
			required: [true, 'An item must belong to a collection'],
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

const Item = mongoose.model('Item', itemSchema)

export default Item

// Examples :
// {"description":"A collection of 7,777 Lil' Heroes living in the Metaverse. Made by contemporary artist Edgar Plans","image":"https://assets.lilheroes.io/nft/qKSZk4H2cujmDX5Rwb7x/1000.jpg","name":"#1000","attributes":[{"trait_type":"Hat","value":"none"},{"trait_type":"Eyes","value":"vegas_glasses"},{"trait_type":"Ears","value":"bunny"},{"trait_type":"Mouth","value":"malicious"},{"trait_type":"Nose","value":"pink"},{"trait_type":"Hair","value":"blond_short"},{"trait_type":"Helmet","value":"yellow"},{"trait_type":"Clothes","value":"ghost"},{"trait_type":"Skin","value":"black"},{"trait_type":"Back","value":"none"},{"trait_type":"Background","value":"yellow"}]}

// {
//     "name": "HAPE #238",
//     "description": "8192 next-generation, high-fashion HAPES.",
//     "image": "https://meta.hapeprime.com/238.png",
//     "external_url": "https://hapeprime.com",
//     "attributes": [
//         {
//             "trait_type": "Fur",
//             "value": "Red"
//         },
//         {
//             "trait_type": "Head",
//             "value": "HAPE"
//         },
//         {
//             "trait_type": "Eyes",
//             "value": "Ultimate Grey"
//         },
//         {
//             "trait_type": "Clothing",
//             "value": "Essential T-Shirt (Pistachio)"
//         },
//         {
//             "trait_type": "Accessory",
//             "value": "Backpack (White)"
//         },
//         {
//             "trait_type": "Jewellery",
//             "value": "Cuban Link (Silver)"
//         },
//         {
//             "trait_type": "Headwear",
//             "value": "Boonie (Red Camo)"
//         },
//         {
//             "trait_type": "Birthday",
//             "value": "03/11"
//         },
//         {
//             "trait_type": "Heart Number",
//             "value": "016916743643"
//         }
//     ]
// }

// {"name": "Asuna #1000", "description": "Glimpse into 10,000 unique lives lived by Asuna through this collection of hand-drawn, anime-inspired NFTs by Zumi and Hagglefish.", "image": "ipfs://QmfDxCgZ7gKwPrDMHs9jS3HAkH8GAysCWBZTMoSqPqgUDV/1000.jpg", "external_url": "https://livesofasuna.com", "attributes": [{"trait_type": "Background", "value": "Yellow"}, {"trait_type": "Weapon", "value": "Long Sword"}, {"trait_type": "Hair Color", "value": "Midnight Blue"}, {"trait_type": "Hair Back", "value": "Wavy Long"}, {"trait_type": "Skin Tone", "value": "Neutral"}, {"trait_type": "Outfit", "value": "Purple Space Monk Outfit"}, {"trait_type": "Mouth", "value": "Hair Band"}, {"trait_type": "Nose", "value": "Base"}, {"trait_type": "Eye Color", "value": "Red"}, {"trait_type": "Eyes", "value": "Almond"}, {"trait_type": "Eyebrows", "value": "Neutral"}, {"trait_type": "Face Accessory", "value": "Red Rectangle Glasses"}, {"trait_type": "Head Accessory", "value": "Gold Spike Tiara"}, {"trait_type": "Hair Front", "value": "Parted Fringe"}]}
