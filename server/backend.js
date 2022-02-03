import axios from "axios";
import pMap, { pMapSkip } from "p-map";
import fs from "fs";

// TODO: leave in Backend the logic to get the Collection array
// TODO: Move to frontend the logic to calculate the attributes, rarity, etc.

// Lil heroes : "https://api.lilheroes.io/latest/metadata/nft/999"
//  Azuki : "https://ikzttp.mypinata.cloud/ipfs/QmeBWSnYPEnUimvpPfNHuvgcK9wFH9Sa6cZ4KDfgkfJJis/1000"
//SlimHoods : https://slimhoods.com/api/

// const baseURL = "https://slimhoods.com/api";
const baseURL = "https://api.lilheroes.io/latest/metadata/nft";
// const baseURL =
// 	"https://ikzttp.mypinata.cloud/ipfs/QmeBWSnYPEnUimvpPfNHuvgcK9wFH9Sa6cZ4KDfgkfJJis";

// ///////////////////////////////
// HELPER FUNCTIONS ///////////////
const getAttributes = async function (id) {
	return axios({
		method: "get",
		url: `/${id}`,
		baseURL: baseURL,
	});
};

const mapper = async (id) => {
	try {
		const item = await getAttributes(id);
		return {
			id: id,
			data: item.data,
		};
	} catch (error) {
		return pMapSkip;
	}
};

// ///////////////////////////////////////
// GETTING COLLECTION DATA /////////////
const getCollection = async function (itemNb) {
	// TODO: anticipate collection that starts at 0 (like Azuki for instance)
	let ids = [];
	for (let i = 1; i <= itemNb; i++) {
		ids.push(i);
	}
	console.log(ids);
	const results = await pMap(ids, mapper, {
		concurrency: 50,
		stopOnError: false,
	});
	console.log("Results : ", results);

	fs.writeFile(`./data/collection.json`, JSON.stringify(results), (err) => {
		console.log("Your collection has been retreived 😀");
	});

	return results;
};

// ///////////////////////////////////////
// GETTING COLLECTION TRAITS /////////////
const getCollectionAttributes = function (collection) {
	let itemsNb = collection.length;
	let allAttributes = [];
	// let allAttributes = {}; // Case for of loop method

	// TEST ARRAY METHODS//////////////////////
	// Looping through every item in the collection
	collection.forEach((item) => {
		// Looping through every trait in the item
		item.data.attributes.forEach((trait) => {
			const { trait_type, value: trait_value } = trait;
			// check if trait type is in the allAttributes array
			const indexAttribute = allAttributes.findIndex((el) => el[trait_type]);
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
				});
				// if trait_type exist
			} else {
				// 1) if value doesn't exist add value object
				const indexValue = allAttributes[indexAttribute][trait_type].findIndex(
					(el) => el.value === trait_value
				);
				indexValue < 0
					? allAttributes[indexAttribute][trait_type].push({
							value: trait_value,
							nb: 1,
							rarity: 0,
					  })
					: // 2) if value exist add +1 to value nb
					  (allAttributes[indexAttribute][trait_type][indexValue].nb += 1);
			}
		});
	});

	// Setting property "no_traits_defined" to allAttributes for empty traits

	// 1)Looping through allAttributes
	const fullAttributes = allAttributes
		.map((item) => {
			// 1) Access list of trait object as Array
			let attributeName = Object.keys(item);
			let traitList = Object.values(item)[0];
			// 2)For each attribute, get sum of traitsNb
			let traitsCount = traitList.reduce((acc, cur) => {
				return acc + cur.nb;
			}, 0);
			// 3)Test if sum of all trait.nb < itemsNb
			if (traitsCount < itemsNb) {
				// 4)If true, set a new trait "no_traits_defined" with a nb of itemsNb - traitsCount
				return {
					[attributeName]: [
						...traitList,
						{
							value: "no_traits_defined",
							nb: itemsNb - traitsCount,
							rarity: 0,
						},
					],
				};
			} else return item;
		})
		.map((item) => {
			let attributeName = Object.keys(item);
			item[attributeName].forEach(
				(trait) =>
					(trait.rarity = Number((1 / (trait.nb / itemsNb)).toFixed(2)))
			);
			return item;
		});

	// for (const attributeName in allAttributes) {
	// 	for (const trait in allAttributes[attributeName]) {
	// 		let traitTypeValue = `${trait.toLowerCase().split(" ").join("_")}`;
	// 		// Rarity Score for a Trait Value = 1 / ([Number of Items with that Trait Value] / [Total Number of Items in Collection])
	// 		allAttributes[attributeName][traitTypeValue].rarity =
	// 			1 / (allAttributes[attributeName][traitTypeValue].nb / itemsNb);
	// 	}
	// }

	return fullAttributes;

	[
		{
			hat: [
				{
					value: "none",
					nb: 3,
					rarity: 50,
				},
				{
					value: "helmet",
					nb: 10,
					rarity: 20,
				},
			],
		},
		{
			hat: [
				{
					value: "none",
					nb: 3,
					rarity: 50,
				},
				{
					value: "helmet",
					nb: 10,
					rarity: 20,
				},
			],
		},
	];
	//// END OF TEST//////////////////////

	// Looping over each item to list all trait types
	collection.forEach((item) => {
		item.data.attributes.forEach((attribute) => {
			allAttributes[attribute.trait_type] = {};
		});
	});

	// Looping every item of the collection
	for (let item of collection) {
		// Looping over each attribute of the item
		for (let attribute of item.data.attributes) {
			let traitTypeName = attribute.trait_type;
			let traitTypeValue = `${attribute.value
				.toLowerCase()
				.split(" ")
				.join("_")}`;
			if (!allAttributes[traitTypeName].hasOwnProperty(traitTypeValue)) {
				// If trait doesn't exist, add new trait value to the attribute
				allAttributes[traitTypeName][traitTypeValue] = {
					nb: 1,
					rarity: 0,
				};
			} else {
				// If trait already exists, add 1 to trait value
				allAttributes[traitTypeName][traitTypeValue].nb += 1;
			}
		}
	}

	// Setting property "no_traits_defined" to allAttributes for empty traits
	for (let attribute in allAttributes) {
		let traitsCount = 0;
		for (let traitType in allAttributes[attribute]) {
			let traitsNb = allAttributes[attribute][traitType].nb;
			traitsCount += traitsNb;
		}
		if (traitsCount < itemsNb) {
			allAttributes[attribute].no_traits_defined = {
				nb: itemsNb - traitsCount,
				rarity: 0,
			};
		}
	}

	// Rating all traits rarity
	for (const attributeName in allAttributes) {
		for (const trait in allAttributes[attributeName]) {
			let traitTypeValue = `${trait.toLowerCase().split(" ").join("_")}`;
			// Rarity Score for a Trait Value = 1 / ([Number of Items with that Trait Value] / [Total Number of Items in Collection])
			allAttributes[attributeName][traitTypeValue].rarity =
				1 / (allAttributes[attributeName][traitTypeValue].nb / itemsNb);
		}
	}

	return allAttributes;
};

// ///////////////////////////////////////
// UPDATING COLLECTION TRAITS ////////////
const updateCollection = function (collection, collectionAttributes) {
	let collectionCopy = [...collection];
	const updatedCollection = collectionCopy.map((item) => {
		// loop through collectionAttributes
		collectionAttributes.forEach((attribute) => {
			let attributeName = Object.keys(attribute)[0];
			let index = item.data.attributes.findIndex(
				(i) => i.trait_type === attributeName
			);
			if (index < 0) {
				// if not, add attribute with value of "no_traits_defined"
				item.data.attributes.push({
					trait_type: attributeName,
					value: "no_traits_defined",
				});
			}
		});
		return item;
	});
	return updatedCollection;
};

// ///////////////////////////////
// CALCULATE RARITY /////////////
const calcRarityScore = function (collection, collectionAttributes) {
	// making a copy of the collection to avoid mutation
	let collectionCopy = [...collection];

	collectionCopy.forEach((item) => {
		let itemScore = 0;
		item.data.attributes.forEach((attribute) => {
			let { trait_type, value } = attribute;
			let attributeIndex = collectionAttributes.findIndex((i) => i[trait_type]);
			// let index = collectionAttributes[attributeIndex].findIndex(
			// 	(i) => i[value]
			// );
			let { rarity } = collectionAttributes[attributeIndex][trait_type].find(
				(el) => el.value === value
			);
			// let traitScore = collectionAttributes[collectionIndex][index].rarity;
			itemScore += rarity;
		});
		item.data.rarityScore = itemScore;
	});

	// Sorting collection by rarity and add rank to each collection item
	const rankedCollection = collectionCopy
		// Sorting collection by rarity and rank each item
		.sort((a, b) => b.data.rarityScore - a.data.rarityScore)
		.map((item, id) => {
			item.data.rarityRank = id + 1;
			return { ...item };
		});
	// Sorting collection by ID again
	// .sort((a, b) => a.id - b.id);

	return rankedCollection;
};
///////////////////////////////
// TEST ///////////////////////
const nbOfItemInCollection = 7777;
let start = new Date();
console.log("------ Getting Collection ------ ");
const collection1 = await getCollection(nbOfItemInCollection);
let timeCollection = new Date();
// console.log("COLLECTION:", collection1);
// console.log("COLLECTION FIRST ITEM :", collection1[0]);

// console.log("------ Getting Attributes ------ ");
// const collection1Attributes = getCollectionAttributes(collection1);
// let timeAttributes = new Date();
// console.log("ALL ATTRIBUTES :", collection1Attributes);

// console.log("------ Updating Collection with empty attributes ------ ");

// const updatedCollection = updateCollection(collection1, collection1Attributes);
// console.log(
// 	"UPDATED COLLECTION FIRST ITEM ATTRIBUTES",
// 	updatedCollection[0].data.attributes
// );

// console.log("------ GETTING COLLECTION RANKS ------ ");
// const rankedCollection = calcRarityScore(collection1, collection1Attributes);
// for (let i = 0; i < nbOfItemInCollection; i++) {
// 	console.log(rankedCollection[i]);
// }

// let id = 10;
// console.log(
// 	`${id}th item attributes :`,
// 	rankedCollection[rankedCollection.findIndex((i) => i.id === id)].data
// 		.attributes
// );
// console.log("ATTRIBUTE #1 :", collection1Attributes[0]);
// console.log("ATTRIBUTE #2 :", collection1Attributes[1]);
// console.log("ATTRIBUTE #3 :", collection1Attributes[2]);
// console.log("ATTRIBUTE #4 :", collection1Attributes[3]);
// console.log("ATTRIBUTE #5 :", collection1Attributes[4]);
// console.log("ATTRIBUTE #6 :", collection1Attributes[5]);
// console.log("ATTRIBUTE #7 :", collection1Attributes[6]);
// console.log("ATTRIBUTE #8 :", collection1Attributes[7]);
// console.log("ATTRIBUTE #9 :", collection1Attributes[8]);
// console.log("ATTRIBUTE #10 :", collection1Attributes[9]);
// console.log("ATTRIBUTE #11 :", collection1Attributes[10]);
// console.log("ATTRIBUTE #12 :", collection1Attributes[11]);
// console.log("ATTRIBUTE #13 :", collection1Attributes[12]);

// TIMERS
console.log("------ TIMERS ------ ");
console.log(
	"Collection retreived in :",
	`${(timeCollection - start) / 1000} seconds`
);
// console.log(
// 	"Attributes retreived in :",
// 	`${(timeAttributes - timeCollection) / 1000} seconds`
// );
