// NOTE: run in the terminal with "node importNewCollection --import"

import axios from "axios";
const contract = "0xAf615B61448691fC3E4c61AE4F015d6e77b6CCa8"; // Lives of Asuna
const url = "http://localhost:3001/api/v1/collection";

const createNewCollection = async function () {
	try {
		// Creating a new collection in the DB
		const collection = await axios({
			method: "post",
			url: url,
			data: {
				contractAddress: contract,
			},
		});

		console.log(collection);
		// const slug = await res.data.newCollection.slug;
		// console.log("New Collection slug: ", slug);

		// const updatedCollection = await axios.patch(`${url}/${slug}`);
		// console.log("updatedCollection", updatedCollection.data.collection);
	} catch (err) {
		console.log(err);
	}
};

if (process.argv[2] === "--import") {
	createNewCollection();
}
