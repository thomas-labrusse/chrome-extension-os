import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import './popup.css'

// Import utils
import {
	calcRarityScore,
	getCollectionAttributes,
	updateCollectionItems,
} from './../utils/rarityUtils.js'

// CONTRACTS EXAMPLES
// const contractAddress = "0xE3234e57ac38890a9136247EAdFE1860316Ff6ab"; //Mood Rollers
// const contractAddress = "0x2931b181ae9dc8f8109ec41c42480933f411ef94"; //Slimhoods
// const contractAddress = "0xD78b76Fcc33cd416dA9d3D42f72649a23D7AC647"; //Lil Heroes by Edgar Plans
// const contractAddress = "0xed5af388653567af2f388e6224dc7c4b3241c544"; //Azuki
// const contractAddress = "0x4Db1f25D3d98600140dfc18dEb7515Be5Bd293Af"; //Hape Prime
// const contractAddress = "0xAf615B61448691fC3E4c61AE4F015d6e77b6CCa8"; //Lives of Asuna

const url = 'http://localhost:3001/api/v1/collections'

const App = function () {
	const [collections, setCollections] = useState([])
	const [newContract, setNewContract] = useState('')
	const [currContract, setCurrContract] = useState('')
	const [currCollItems, setCurrCollItems] = useState([])

	const createNewCollection = async function () {
		if (newContract === '') return
		console.log(
			`Sending a request to the server to create a new collection with contract ${newContract}`
		)
		try {
			const res = await axios({
				method: 'post',
				url: url,
				data: {
					contractAddress: newContract,
				},
			})
			console.log('Response from the server', res)
		} catch (err) {
			console.log(err)
		}
	}

	const getAllCollections = async function () {
		try {
			const res = await axios({
				method: 'get',
				url: url,
				params: {
					fields: 'name,maxSupply,contractAddress',
				},
			})
			const collections = res.data.data
			console.log('Collections : ', collections)
			return collections
		} catch (err) {
			console.log(err)
		}
	}

	const getCollectionItems = async (contract) => {
		try {
			console.log('Trying to update collection item of contract :', contract)
			const res = await axios({
				method: 'patch',
				url: `${url}/${contract}`,
			})
			console.log('RES', res)
			const resultsArray = res.data.data.results
			console.log('resultsArray:', resultsArray)
			setCurrContract(contract)
			setCurrCollItems(resultsArray)

			// createCollectionItems(resultsArray, contract)
		} catch (err) {
			console.log(err)
		}
	}

	const saveCollItemsDB = async (items, contract) => {
		try {
			const res = await axios({
				method: 'post',
				url: `${url}/${contract}/items`,
				data: items,
			})
			console.log('Res from saveCollItemsDB', res)
		} catch (err) {
			console.log(err)
		}
	}

	const renderCollectionCard = (collection) => {
		return (
			<li>
				<div className='card-container grid grid--3-cols'>
					<p className='collection-name'>{collection.name}</p>
					<p># {collection.maxSupply} items</p>
					<p>
						<button
							className='btn'
							onClick={() => getCollectionItems(collection.contractAddress)}
						>
							Get traits
						</button>
					</p>
				</div>
			</li>
		)
	}

	useEffect(() => {
		console.log('Use effect running')
		;(async function () {
			const allCollections = await getAllCollections()
			console.log('Updated collections:', allCollections)
			setCollections(allCollections)
			console.log(collections)
		})()
	}, [])

	useEffect(() => {
		console.log('Current collection Items in State:', currCollItems)
		// Getting all collection attributes in an Array:
		const currCollAttributes = getCollectionAttributes(currCollItems)
		// TODO: save Attributes to state
		console.log('currCollAttributes:', currCollAttributes)
		const updatedCollItems = updateCollectionItems(
			currCollItems,
			currCollAttributes
		)
		// TODO: update Collection Items to state
		console.log('updatedCollectionItems', updatedCollItems)
		const rankedColl = calcRarityScore(updatedCollItems, currCollAttributes)
		console.log(rankedColl)
		saveCollItemsDB(rankedColl, currContract)
	}, [currCollItems])

	return (
		<>
			<header className='header'>
				<h1 className='heading-primary'>NFT Traits Extension</h1>
			</header>
			<h2 className='heading-secondary'>Collections</h2>
			<div className='collections-container'>
				<ul>
					{collections.map((collection) => renderCollectionCard(collection))}
				</ul>
			</div>
			<div className='container new-collection-container'>
				<p className='new-collection-text'>
					Can't find a collection ? Add it by pasting the contract address below
					and clicking "Add"
				</p>
				<div>
					<input
						type='text'
						value={newContract}
						placeholder='0xed5af388653567af2f388e6224dc7c4b3241c544'
						onChange={(event) => setNewContract(event.target.value)}
					/>
					<button className='btn' onClick={createNewCollection}>
						Add
					</button>
				</div>
			</div>
		</>
	)
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
