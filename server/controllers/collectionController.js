import dotenv from 'dotenv'
dotenv.config({ path: './config.env' })
import axios from 'axios'
import pMap, { pMapSkip } from 'p-map'
import { ethers } from 'ethers'
import { contractAbi } from './../ERC721ABI.js'
import Collection from './../models/collectionModel.js'
import APIFeatures from './../utils/apiFeatures.js'
import AppError from '../utils/appErrors.js'

// Initializing Ether Provider (with Infura)
const provider = new ethers.providers.JsonRpcProvider(
	`https://mainnet.infura.io/v3/${process.env.INFURIA_PASSWORD}`
)
console.log(provider)

// CONTRACTS EXAMPLES
// const contractAddress = "0xE3234e57ac38890a9136247EAdFE1860316Ff6ab"; //Mood Rollers
// const contractAddress = "0x2931b181ae9dc8f8109ec41c42480933f411ef94"; //Slimhoods
// const contractAddress = "0xD78b76Fcc33cd416dA9d3D42f72649a23D7AC647"; //Lil Heroes by Edgar Plans
// const contractAddress = "0xed5af388653567af2f388e6224dc7c4b3241c544"; //Azuki
// const contractAddress = "0x4Db1f25D3d98600140dfc18dEb7515Be5Bd293Af"; //Hape Prime
// const contractAddress = "0xAf615B61448691fC3E4c61AE4F015d6e77b6CCa8"; //Lives of Asuna

// CREATE NEW COLLECTION IN DB (BASED ON CONTRACT ADDRESS)
export const createNewCollection = async (req, res) => {
	try {
		const contractAddress = req.body.contractAddress
		const contract = new ethers.Contract(contractAddress, contractAbi, provider)

		// Getting collection basic info from Ethereum
		const name = await contract.name()
		// TODO: remove slug
		// const slug = name.toLowerCase().split(' ').join('-')
		const totalSupply = await contract.totalSupply()
		const maxSupply = totalSupply.toNumber()
		const tokenURI = await contract.tokenURI('999')
		const baseURI = tokenURI.split('999').join('')
		// TODO: remove slug
		const collection = { name, contractAddress, maxSupply, baseURI }
		// const collection = { name, slug, contractAddress, maxSupply, baseURI }

		// SAVING TO DB
		const newCollection = await Collection.create(collection)

		// RESPONSE
		res.status(200).json({
			status: 'success',
			message: 'New collection created',
			data: {
				newCollection,
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

// GET ALL COLLECTIONS
export const getAllCollections = async (req, res) => {
	try {
		console.log('reaches here')
		let features = new APIFeatures(Collection.find(), req.query).sort().fields()

		console.log(features)

		const allCollections = await features.query
		// const allCollections = await Collection.find(queryObj)
		res.status(200).json({
			status: 'success',
			data: allCollections,
		})
	} catch (err) {
		res.status(404).json({
			status: 'fail',
			message: err,
		})
	}
}

// GET ONE COLLECTION BY ITS NAME
export const getCollection = async (req, res, next) => {
	try {
		const collection = await Collection.findOne({
			contractAddress: req.params.contractAddress,
		})

		if (!collection) {
			console.log('Sending Error To Global Error handling MW...')
			return next(new AppError('No collection found with that ID', 404))
		}

		res.status(200).json({
			status: 'success',
			data: {
				collection,
			},
		})
	} catch (err) {
		res.status(404).json({
			status: 'fail',
			message: err,
		})
	}
}

// GET ALL ITEMS IN COLLECTION
export const updateCollectionItems = async (req, res) => {
	try {
		const collectionContractAddress = req.params.contractAddress
		const collectionTBU = await Collection.findOne({
			contractAddress: collectionContractAddress,
		})
		const maxSupply = collectionTBU.maxSupply
		console.log('Collection to be updated:', collectionTBU)
		const getAttributes = async function (id) {
			return axios({
				method: 'get',
				url: `/${id}`,
				baseURL: collectionTBU.baseURI,
			})
		}

		const mapper = async (id) => {
			try {
				const item = await getAttributes(id)
				return {
					id: id,
					token: item.data,
				}
			} catch (error) {
				return pMapSkip
			}
		}
		let ids = []
		for (let i = 1; i <= maxSupply; i++) {
			ids.push(i)
		}
		const results = await pMap(ids, mapper, {
			concurrency: 50,
			stopOnError: false,
		})

		// Update DB
		const collection = await Collection.findOneAndUpdate(
			{ contractAddress: collectionContractAddress },
			{
				tokens: results,
			}
		)

		res.status(200).json({
			status: 'success',
			data: {
				collection,
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
