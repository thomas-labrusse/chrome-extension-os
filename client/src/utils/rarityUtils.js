// ///////////////////////////////////////
// GETTING COLLECTION TRAITS /////////////

// TODO: pass Current Collection Items (Array)

// Example of one item :
// {
//     "id": 1,
//     "token": {
//         "description": "A collection of 7,777 Lil' Heroes living in the Metaverse. Made by contemporary artist Edgar Plans",
//         "image": "https://assets.lilheroes.io/nft/qKSZk4H2cujmDX5Rwb7x/1.jpg",
//         "name": "#1",
//         "attributes": [
//             {
//                 "trait_type": "Hat",
//                 "value": "none"
//             },
//             {
//                 "trait_type": "Eyes",
//                 "value": "3d_glasses"
//             },
//             {
//                 "trait_type": "Ears",
//                 "value": "regular"
//             },
//             {
//                 "trait_type": "Mouth",
//                 "value": "rabbit"
//             },
//             {
//                 "trait_type": "Nose",
//                 "value": "black"
//             },
//             {
//                 "trait_type": "Hair",
//                 "value": "none"
//             },
//             {
//                 "trait_type": "Helmet",
//                 "value": "purple"
//             },
//             {
//                 "trait_type": "Clothes",
//                 "value": "gentleman"
//             },
//             {
//                 "trait_type": "Skin",
//                 "value": "nude"
//             },
//             {
//                 "trait_type": "Back",
//                 "value": "black_wings"
//             },
//             {
//                 "trait_type": "Background",
//                 "value": "grey"
//             }
//         ]
//     }
// }

// EXAMPLE OF ATTRIBUTES LIST:
// [
// 	{
// 		hat: [
// 			{
// 				value: 'none',
// 				nb: 3,
// 				rarity: 50,
// 			},
// 			{
// 				value: 'helmet',
// 				nb: 10,
// 				rarity: 20,
// 			},
// 		],
// 	},
// 	{
// 		hat: [
// 			{
// 				value: 'none',
// 				nb: 3,
// 				rarity: 50,
// 			},
// 			{
// 				value: 'helmet',
// 				nb: 10,
// 				rarity: 20,
// 			},
// 		],
// 	},
// ]

export const getCollectionAttributes = function (collection) {
	let itemsNb = collection.length
	let allAttributes = []
	// let allAttributes = {}; // Case for of loop method

	// TEST ARRAY METHODS//////////////////////
	// Looping through every item in the collection
	collection.forEach((item) => {
		// Looping through every trait in the item
		// TODO: replace item.data.attributes by item.token.attributes
		// item.data.attributes.forEach((trait) => {
		item.token.attributes.forEach((trait) => {
			const { trait_type, value: trait_value } = trait
			// check if trait type is in the allAttributes array
			const indexAttribute = allAttributes.findIndex((el) => el[trait_type])
			if (indexAttribute < 0) {
				// if no trait_type found, create new trait type
				allAttributes.push({
					[trait_type]: [
						{
							value: trait_value,
							nb: 1,
							rarity: 0,
						},
					],
				})
				// if trait_type exist
			} else {
				// 1) if value doesn't exist add value object
				const indexValue = allAttributes[indexAttribute][trait_type].findIndex(
					(el) => el.value === trait_value
				)
				indexValue < 0
					? allAttributes[indexAttribute][trait_type].push({
							value: trait_value,
							nb: 1,
							rarity: 0,
					  })
					: // 2) if value exist add +1 to value nb
					  (allAttributes[indexAttribute][trait_type][indexValue].nb += 1)
			}
		})
	})

	// Setting property "no_traits_defined" to allAttributes for empty traits

	// 1)Looping through allAttributes
	const fullAttributes = allAttributes
		.map((item) => {
			// 1) Access list of trait object as Array
			let attributeName = Object.keys(item)
			let traitList = Object.values(item)[0]
			// 2)For each attribute, get sum of traitsNb
			let traitsCount = traitList.reduce((acc, cur) => {
				return acc + cur.nb
			}, 0)
			// 3)Test if sum of all trait.nb < itemsNb
			if (traitsCount < itemsNb) {
				// 4)If true, set a new trait "no_traits_defined" with a nb of itemsNb - traitsCount
				return {
					[attributeName]: [
						...traitList,
						{
							value: 'no_traits_defined',
							nb: itemsNb - traitsCount,
							rarity: 0,
						},
					],
				}
			} else return item
		})
		// Give a rarity score to every trait value
		// Rarity Score for a Trait Value = 1 / ([Number of Items with that Trait Value] / [Total Number of Items in Collection])
		.map((item) => {
			let attributeName = Object.keys(item)
			item[attributeName].forEach(
				(trait) =>
					(trait.rarity = Number((1 / (trait.nb / itemsNb)).toFixed(2)))
			)
			return item
		})

	return fullAttributes
}

// ///////////////////////////////////////
// UPDATING COLLECTION TRAITS ////////////
export const updateCollectionItems = function (
	collection,
	collectionAttributes
) {
	let collectionCopy = [...collection]
	const updatedCollection = collectionCopy.map((item) => {
		// loop through collectionAttributes
		collectionAttributes.forEach((attribute) => {
			let attributeName = Object.keys(attribute)[0]
			let index = item.token.attributes.findIndex(
				(i) => i.trait_type === attributeName
			)
			if (index < 0) {
				// if not, add attribute with value of "no_traits_defined"
				item.token.attributes.push({
					trait_type: attributeName,
					value: 'no_traits_defined',
				})
			}
		})
		return item
	})
	return updatedCollection
}
// FORMAT COLLECTION FOR DB METHOD

const formatItemForDB = (item) => {
	let formatedItem = {
		name: item.token.name,
		nb: item.id,
		attributes: item.token.attributes,
		rarityScore: item.token.rarityScore,
		rarityRank: item.token.rarityRank,
	}
	return formatedItem
}

// ///////////////////////////////
// CALCULATE RARITY /////////////
export const calcRarityScore = function (collection, collectionAttributes) {
	// making a copy of the collection to avoid mutation
	let collectionCopy = [...collection]

	collectionCopy.forEach((item) => {
		let itemScore = 0
		item.token.attributes.forEach((attribute) => {
			let { trait_type, value } = attribute
			let attributeIndex = collectionAttributes.findIndex((i) => i[trait_type])
			// let index = collectionAttributes[attributeIndex].findIndex(
			// 	(i) => i[value]
			// );
			let { rarity } = collectionAttributes[attributeIndex][trait_type].find(
				(el) => el.value === value
			)
			// let traitScore = collectionAttributes[collectionIndex][index].rarity;
			itemScore += rarity
		})
		item.token.rarityScore = itemScore
	})

	// Sorting collection by rarity and add rank to each collection item
	const rankedCollection = collectionCopy
		// Sorting collection by rarity and rank each item
		.sort((a, b) => b.token.rarityScore - a.token.rarityScore)
		.map((item, id) => {
			item.token.rarityRank = id + 1
			return { ...item }
		})
	// Sorting collection by ID again
	// .sort((a, b) => a.id - b.id);

	let formatedCollection = []
	rankedCollection.forEach((item) =>
		formatedCollection.push(formatItemForDB(item))
	)

	return formatedCollection
}

/*
[
    {
        "Hat": [
            {
                "value": "none",
                "nb": 5104,
                "rarity": 1.52
            },
            {
                "value": "worker",
                "nb": 209,
                "rarity": 37.21
            },
            {
                "value": "sheriff",
                "nb": 139,
                "rarity": 55.95
            },
            {
                "value": "spikes",
                "nb": 99,
                "rarity": 78.56
            },
            {
                "value": "rainbow",
                "nb": 120,
                "rarity": 64.81
            },
            {
                "value": "pirate",
                "nb": 32,
                "rarity": 243.03
            },
            {
                "value": "sherlock",
                "nb": 179,
                "rarity": 43.45
            },
            {
                "value": "sailor",
                "nb": 231,
                "rarity": 33.67
            },
            {
                "value": "crazy",
                "nb": 108,
                "rarity": 72.01
            },
            {
                "value": "doctor",
                "nb": 230,
                "rarity": 33.81
            },
            {
                "value": "cap",
                "nb": 64,
                "rarity": 121.52
            },
            {
                "value": "cowboy",
                "nb": 227,
                "rarity": 34.26
            },
            {
                "value": "martian",
                "nb": 148,
                "rarity": 52.55
            },
            {
                "value": "cook",
                "nb": 128,
                "rarity": 60.76
            },
            {
                "value": "captain",
                "nb": 153,
                "rarity": 50.83
            },
            {
                "value": "punk",
                "nb": 84,
                "rarity": 92.58
            },
            {
                "value": "beanie",
                "nb": 70,
                "rarity": 111.1
            },
            {
                "value": "police",
                "nb": 165,
                "rarity": 47.13
            },
            {
                "value": "gentleman",
                "nb": 158,
                "rarity": 49.22
            },
            {
                "value": "angel",
                "nb": 12,
                "rarity": 648.08
            },
            {
                "value": "unicorn",
                "nb": 21,
                "rarity": 370.33
            },
            {
                "value": "electric",
                "nb": 26,
                "rarity": 299.12
            },
            {
                "value": "crown",
                "nb": 6,
                "rarity": 1296.17
            },
            {
                "value": "no_traits_defined",
                "nb": 64,
                "rarity": 121.52
            }
        ]
    },
    {
        "Eyes": [
            {
                "value": "3d_glasses",
                "nb": 193,
                "rarity": 40.3
            },
            {
                "value": "suspicious",
                "nb": 367,
                "rarity": 21.19
            },
            {
                "value": "wink",
                "nb": 530,
                "rarity": 14.67
            },
            {
                "value": "regular",
                "nb": 2117,
                "rarity": 3.67
            },
            {
                "value": "80s_glasses",
                "nb": 415,
                "rarity": 18.74
            },
            {
                "value": "vegas_glasses",
                "nb": 477,
                "rarity": 16.3
            },
            {
                "value": "monster",
                "nb": 169,
                "rarity": 46.02
            },
            {
                "value": "big_eyes",
                "nb": 265,
                "rarity": 29.35
            },
            {
                "value": "yellow_glasses",
                "nb": 454,
                "rarity": 17.13
            },
            {
                "value": "rogue",
                "nb": 215,
                "rarity": 36.17
            },
            {
                "value": "vampire",
                "nb": 198,
                "rarity": 39.28
            },
            {
                "value": "manga",
                "nb": 302,
                "rarity": 25.75
            },
            {
                "value": "pirate",
                "nb": 207,
                "rarity": 37.57
            },
            {
                "value": "insect",
                "nb": 97,
                "rarity": 80.18
            },
            {
                "value": "hopeful",
                "nb": 300,
                "rarity": 25.92
            },
            {
                "value": "professor",
                "nb": 320,
                "rarity": 24.3
            },
            {
                "value": "angry",
                "nb": 463,
                "rarity": 16.8
            },
            {
                "value": "retro_glasses",
                "nb": 354,
                "rarity": 21.97
            },
            {
                "value": "zombie",
                "nb": 85,
                "rarity": 91.49
            },
            {
                "value": "vr",
                "nb": 59,
                "rarity": 131.81
            },
            {
                "value": "cyborg",
                "nb": 35,
                "rarity": 222.2
            },
            {
                "value": "lazer",
                "nb": 25,
                "rarity": 311.08
            },
            {
                "value": "closed",
                "nb": 5,
                "rarity": 1555.4
            },
            {
                "value": "cyclop",
                "nb": 49,
                "rarity": 158.71
            },
            {
                "value": "alien",
                "nb": 10,
                "rarity": 777.7
            },
            {
                "value": "dots",
                "nb": 2,
                "rarity": 3888.5
            },
            {
                "value": "no_traits_defined",
                "nb": 64,
                "rarity": 121.52
            }
        ]
    },
    {
        "Ears": [
            {
                "value": "regular",
                "nb": 1384,
                "rarity": 5.62
            },
            {
                "value": "none",
                "nb": 2614,
                "rarity": 2.98
            },
            {
                "value": "pointy",
                "nb": 748,
                "rarity": 10.4
            },
            {
                "value": "small",
                "nb": 1402,
                "rarity": 5.55
            },
            {
                "value": "round",
                "nb": 989,
                "rarity": 7.86
            },
            {
                "value": "earrings",
                "nb": 25,
                "rarity": 311.08
            },
            {
                "value": "zombie",
                "nb": 179,
                "rarity": 43.45
            },
            {
                "value": "emperor",
                "nb": 59,
                "rarity": 131.81
            },
            {
                "value": "small_wings",
                "nb": 80,
                "rarity": 97.21
            },
            {
                "value": "bunny",
                "nb": 117,
                "rarity": 66.47
            },
            {
                "value": "demon_horns",
                "nb": 98,
                "rarity": 79.36
            },
            {
                "value": "shrek",
                "nb": 18,
                "rarity": 432.06
            },
            {
                "value": "no_traits_defined",
                "nb": 64,
                "rarity": 121.52
            }
        ]
    },
    {
        "Mouth": [
            {
                "value": "rabbit",
                "nb": 216,
                "rarity": 36
            },
            {
                "value": "walrus",
                "nb": 322,
                "rarity": 24.15
            },
            {
                "value": "chewing_gum",
                "nb": 193,
                "rarity": 40.3
            },
            {
                "value": "wow",
                "nb": 992,
                "rarity": 7.84
            },
            {
                "value": "smoking_pipe",
                "nb": 444,
                "rarity": 17.52
            },
            {
                "value": "moustache",
                "nb": 358,
                "rarity": 21.72
            },
            {
                "value": "small_beard",
                "nb": 254,
                "rarity": 30.62
            },
            {
                "value": "malicious",
                "nb": 792,
                "rarity": 9.82
            },
            {
                "value": "smile",
                "nb": 1181,
                "rarity": 6.59
            },
            {
                "value": "beard",
                "nb": 292,
                "rarity": 26.63
            },
            {
                "value": "big_smile",
                "nb": 615,
                "rarity": 12.65
            },
            {
                "value": "tongue_out",
                "nb": 381,
                "rarity": 20.41
            },
            {
                "value": "confident",
                "nb": 461,
                "rarity": 16.87
            },
            {
                "value": "sad",
                "nb": 499,
                "rarity": 15.59
            },
            {
                "value": "party_horn",
                "nb": 420,
                "rarity": 18.52
            },
            {
                "value": "bubbles",
                "nb": 77,
                "rarity": 101
            },
            {
                "value": "screaming",
                "nb": 100,
                "rarity": 77.77
            },
            {
                "value": "music",
                "nb": 59,
                "rarity": 131.81
            },
            {
                "value": "vampire",
                "nb": 39,
                "rarity": 199.41
            },
            {
                "value": "frankenstein",
                "nb": 18,
                "rarity": 432.06
            },
            {
                "value": "no_traits_defined",
                "nb": 64,
                "rarity": 121.52
            }
        ]
    },
    {
        "Nose": [
            {
                "value": "black",
                "nb": 823,
                "rarity": 9.45
            },
            {
                "value": "turquoise",
                "nb": 769,
                "rarity": 10.11
            },
            {
                "value": "yellow",
                "nb": 746,
                "rarity": 10.42
            },
            {
                "value": "pink",
                "nb": 760,
                "rarity": 10.23
            },
            {
                "value": "white",
                "nb": 795,
                "rarity": 9.78
            },
            {
                "value": "red",
                "nb": 1012,
                "rarity": 7.68
            },
            {
                "value": "blue",
                "nb": 1015,
                "rarity": 7.66
            },
            {
                "value": "heart",
                "nb": 382,
                "rarity": 20.36
            },
            {
                "value": "whiskers",
                "nb": 232,
                "rarity": 33.52
            },
            {
                "value": "green",
                "nb": 982,
                "rarity": 7.92
            },
            {
                "value": "carrot",
                "nb": 90,
                "rarity": 86.41
            },
            {
                "value": "booger",
                "nb": 37,
                "rarity": 210.19
            },
            {
                "value": "pig",
                "nb": 70,
                "rarity": 111.1
            },
            {
                "value": "no_traits_defined",
                "nb": 64,
                "rarity": 121.52
            }
        ]
    },
    {
        "Hair": [
            {
                "value": "none",
                "nb": 6213,
                "rarity": 1.25
            },
            {
                "value": "blond_long",
                "nb": 150,
                "rarity": 51.85
            },
            {
                "value": "black_short",
                "nb": 298,
                "rarity": 26.1
            },
            {
                "value": "ginger_short",
                "nb": 198,
                "rarity": 39.28
            },
            {
                "value": "brown_long",
                "nb": 150,
                "rarity": 51.85
            },
            {
                "value": "blond_short",
                "nb": 299,
                "rarity": 26.01
            },
            {
                "value": "black_long",
                "nb": 148,
                "rarity": 52.55
            },
            {
                "value": "dreadlocks",
                "nb": 78,
                "rarity": 99.71
            },
            {
                "value": "ginger_long",
                "nb": 100,
                "rarity": 77.77
            },
            {
                "value": "curly",
                "nb": 50,
                "rarity": 155.54
            },
            {
                "value": "white_long",
                "nb": 29,
                "rarity": 268.17
            },
            {
                "value": "no_traits_defined",
                "nb": 64,
                "rarity": 121.52
            }
        ]
    },
    {
        "Helmet": [
            {
                "value": "purple",
                "nb": 672,
                "rarity": 11.57
            },
            {
                "value": "turquoise",
                "nb": 761,
                "rarity": 10.22
            },
            {
                "value": "rainbow",
                "nb": 120,
                "rarity": 64.81
            },
            {
                "value": "blue",
                "nb": 599,
                "rarity": 12.98
            },
            {
                "value": "black",
                "nb": 496,
                "rarity": 15.68
            },
            {
                "value": "pink",
                "nb": 518,
                "rarity": 15.01
            },
            {
                "value": "orange",
                "nb": 793,
                "rarity": 9.81
            },
            {
                "value": "yellow",
                "nb": 570,
                "rarity": 13.64
            },
            {
                "value": "light_green",
                "nb": 618,
                "rarity": 12.58
            },
            {
                "value": "white",
                "nb": 471,
                "rarity": 16.51
            },
            {
                "value": "dark_green",
                "nb": 346,
                "rarity": 22.48
            },
            {
                "value": "light_blue",
                "nb": 644,
                "rarity": 12.08
            },
            {
                "value": "silver",
                "nb": 178,
                "rarity": 43.69
            },
            {
                "value": "red",
                "nb": 710,
                "rarity": 10.95
            },
            {
                "value": "cyborg",
                "nb": 80,
                "rarity": 97.21
            },
            {
                "value": "trippy",
                "nb": 45,
                "rarity": 172.82
            },
            {
                "value": "png",
                "nb": 60,
                "rarity": 129.62
            },
            {
                "value": "gold",
                "nb": 32,
                "rarity": 243.03
            },
            {
                "value": "no_traits_defined",
                "nb": 64,
                "rarity": 121.52
            }
        ]
    },
    {
        "Clothes": [
            {
                "value": "gentleman",
                "nb": 386,
                "rarity": 20.15
            },
            {
                "value": "chef",
                "nb": 367,
                "rarity": 21.19
            },
            {
                "value": "read_or_die",
                "nb": 448,
                "rarity": 17.36
            },
            {
                "value": "ghost",
                "nb": 474,
                "rarity": 16.41
            },
            {
                "value": "policeman",
                "nb": 428,
                "rarity": 18.17
            },
            {
                "value": "jersey",
                "nb": 95,
                "rarity": 81.86
            },
            {
                "value": "cyclist",
                "nb": 398,
                "rarity": 19.54
            },
            {
                "value": "ninja",
                "nb": 277,
                "rarity": 28.08
            },
            {
                "value": "drawing_my_life",
                "nb": 473,
                "rarity": 16.44
            },
            {
                "value": "ufo",
                "nb": 309,
                "rarity": 25.17
            },
            {
                "value": "worker",
                "nb": 376,
                "rarity": 20.68
            },
            {
                "value": "sailor",
                "nb": 180,
                "rarity": 43.21
            },
            {
                "value": "martian",
                "nb": 415,
                "rarity": 18.74
            },
            {
                "value": "plaid_shirt",
                "nb": 324,
                "rarity": 24
            },
            {
                "value": "ballet",
                "nb": 199,
                "rarity": 39.08
            },
            {
                "value": "cardigan",
                "nb": 363,
                "rarity": 21.42
            },
            {
                "value": "thriller",
                "nb": 145,
                "rarity": 53.63
            },
            {
                "value": "pilot",
                "nb": 218,
                "rarity": 35.67
            },
            {
                "value": "bling_bling",
                "nb": 299,
                "rarity": 26.01
            },
            {
                "value": "mechanic",
                "nb": 345,
                "rarity": 22.54
            },
            {
                "value": "doctor",
                "nb": 407,
                "rarity": 19.11
            },
            {
                "value": "tattoo",
                "nb": 154,
                "rarity": 50.5
            },
            {
                "value": "leather_jacket",
                "nb": 60,
                "rarity": 129.62
            },
            {
                "value": "grey_hoodie",
                "nb": 160,
                "rarity": 48.61
            },
            {
                "value": "astronaut",
                "nb": 80,
                "rarity": 97.21
            },
            {
                "value": "dollar_sign",
                "nb": 119,
                "rarity": 65.35
            },
            {
                "value": "tie_and_dye",
                "nb": 68,
                "rarity": 114.37
            },
            {
                "value": "skull",
                "nb": 50,
                "rarity": 155.54
            },
            {
                "value": "robot",
                "nb": 30,
                "rarity": 259.23
            },
            {
                "value": "black_suit",
                "nb": 41,
                "rarity": 189.68
            },
            {
                "value": "artist_in_me",
                "nb": 25,
                "rarity": 311.08
            },
            {
                "value": "no_traits_defined",
                "nb": 64,
                "rarity": 121.52
            }
        ]
    },
    {
        "Skin": [
            {
                "value": "nude",
                "nb": 5381,
                "rarity": 1.45
            },
            {
                "value": "black",
                "nb": 1489,
                "rarity": 5.22
            },
            {
                "value": "artist",
                "nb": 347,
                "rarity": 22.41
            },
            {
                "value": "alien",
                "nb": 60,
                "rarity": 129.62
            },
            {
                "value": "white",
                "nb": 198,
                "rarity": 39.28
            },
            {
                "value": "cyborg",
                "nb": 99,
                "rarity": 78.56
            },
            {
                "value": "radioactive",
                "nb": 39,
                "rarity": 199.41
            },
            {
                "value": "zombie",
                "nb": 80,
                "rarity": 97.21
            },
            {
                "value": "invisible",
                "nb": 20,
                "rarity": 388.85
            },
            {
                "value": "no_traits_defined",
                "nb": 64,
                "rarity": 121.52
            }
        ]
    },
    {
        "Back": [
            {
                "value": "black_wings",
                "nb": 20,
                "rarity": 388.85
            },
            {
                "value": "black_cape",
                "nb": 547,
                "rarity": 14.22
            },
            {
                "value": "none",
                "nb": 5383,
                "rarity": 1.44
            },
            {
                "value": "red_cape",
                "nb": 535,
                "rarity": 14.54
            },
            {
                "value": "skater",
                "nb": 191,
                "rarity": 40.72
            },
            {
                "value": "tennis",
                "nb": 382,
                "rarity": 20.36
            },
            {
                "value": "guitar",
                "nb": 269,
                "rarity": 28.91
            },
            {
                "value": "artist",
                "nb": 176,
                "rarity": 44.19
            },
            {
                "value": "jetpack",
                "nb": 93,
                "rarity": 83.62
            },
            {
                "value": "devil",
                "nb": 54,
                "rarity": 144.02
            },
            {
                "value": "angel_wings",
                "nb": 35,
                "rarity": 222.2
            },
            {
                "value": "shuriken",
                "nb": 28,
                "rarity": 277.75
            },
            {
                "value": "no_traits_defined",
                "nb": 64,
                "rarity": 121.52
            }
        ]
    },
    {
        "Background": [
            {
                "value": "grey",
                "nb": 747,
                "rarity": 10.41
            },
            {
                "value": "orange",
                "nb": 776,
                "rarity": 10.02
            },
            {
                "value": "red",
                "nb": 832,
                "rarity": 9.35
            },
            {
                "value": "cream",
                "nb": 730,
                "rarity": 10.65
            },
            {
                "value": "pink",
                "nb": 848,
                "rarity": 9.17
            },
            {
                "value": "green",
                "nb": 854,
                "rarity": 9.11
            },
            {
                "value": "turquoise",
                "nb": 914,
                "rarity": 8.51
            },
            {
                "value": "yellow",
                "nb": 853,
                "rarity": 9.12
            },
            {
                "value": "purple",
                "nb": 901,
                "rarity": 8.63
            },
            {
                "value": "dark_blue",
                "nb": 110,
                "rarity": 70.7
            },
            {
                "value": "artnotes",
                "nb": 50,
                "rarity": 155.54
            },
            {
                "value": "rainbow",
                "nb": 98,
                "rarity": 79.36
            },
            {
                "value": "no_traits_defined",
                "nb": 64,
                "rarity": 121.52
            }
        ]
    },
    {
        "Legendary": [
            {
                "value": "Item 124",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 397",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 667",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 680",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 686",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 876",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 1231",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 1482",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 1808",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 1858",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 1949",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 2066",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 2661",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 2756",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 2851",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 2974",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 3087",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 3377",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 3389",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 3644",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 3649",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 3794",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 3802",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 3967",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 4161",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 4197",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 4453",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 4550",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 4600",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 4887",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 5018",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 5268",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 5629",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 5790",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 5899",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 5944",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 6036",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 6121",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 6144",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 6265",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 6281",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 6464",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 6579",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 6610",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 6616",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 6892",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 6976",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 7210",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 7406",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "Item 7416",
                "nb": 1,
                "rarity": 7777
            },
            {
                "value": "no_traits_defined",
                "nb": 7727,
                "rarity": 1.01
            }
        ]
    },
    {
        "Hidden": [
            {
                "value": "Yes",
                "nb": 14,
                "rarity": 555.5
            },
            {
                "value": "no_traits_defined",
                "nb": 7763,
                "rarity": 1
            }
        ]
    }
]

// //////////COLLECTION ITEMS//////////////////////
*/

/*
[
    {
        "id": 124,
        "token": {
            "description": "A collection of 7,777 Lil' Heroes living in the Metaverse. Made by contemporary artist Edgar Plans",
            "image": "https://assets.lilheroes.io/nft/qKSZk4H2cujmDX5Rwb7x/124.jpg",
            "name": "#124",
            "attributes": [
                {
                    "trait_type": "Legendary",
                    "value": "Item 124"
                },
                {
                    "trait_type": "Hat",
                    "value": "no_traits_defined"
                },
                {
                    "trait_type": "Eyes",
                    "value": "no_traits_defined"
                },
                {
                    "trait_type": "Ears",
                    "value": "no_traits_defined"
                },
                {
                    "trait_type": "Mouth",
                    "value": "no_traits_defined"
                },
                {
                    "trait_type": "Nose",
                    "value": "no_traits_defined"
                },
                {
                    "trait_type": "Hair",
                    "value": "no_traits_defined"
                },
                {
                    "trait_type": "Helmet",
                    "value": "no_traits_defined"
                },
                {
                    "trait_type": "Clothes",
                    "value": "no_traits_defined"
                },
                {
                    "trait_type": "Skin",
                    "value": "no_traits_defined"
                },
                {
                    "trait_type": "Back",
                    "value": "no_traits_defined"
                },
                {
                    "trait_type": "Background",
                    "value": "no_traits_defined"
                },
                {
                    "trait_type": "Hidden",
                    "value": "no_traits_defined"
                }
            ],
            "rarityScore": 9114.720000000005,
            "rarityRank": 1
        }
    },
 
]
*/
