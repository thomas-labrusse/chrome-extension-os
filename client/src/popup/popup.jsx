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
// "0xFeb56AAF59F8c17300F4D8306365a491b05B6602" ; The Beeings
// "0x59468516a8259058baD1cA5F8f4BFF190d30E066" ; Invisible Friends

const url = 'http://localhost:3001/api/v1/collections'

const App = function () {
	const [collections, setCollections] = useState([])
	const [newContract, setNewContract] = useState('')
	const [currContract, setCurrContract] = useState('')
	const [currCollItems, setCurrCollItems] = useState([])
	const [spinner, setSpinner] = useState(false)

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
			getAllCollections()
		} catch (err) {
			console.log(err.response)
			alert(err.response.data.message)
		}
	}

	const getAllCollections = async function () {
		try {
			const res = await axios({
				method: 'get',
				url: url,
				params: {
					fields: 'name,maxSupply,contractAddress,attributes',
				},
			})
			const allCollections = res.data.data
			setCollections(allCollections)
			return allCollections
		} catch (err) {
			console.log(err)
		}
	}

	const getCollectionItems = async (contract) => {
		// TODO: start spinner
		setSpinner(true)

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

			createCollectionItems(resultsArray, contract)
		} catch (err) {
			// stop spinner if error
			setSpinner(false)
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

	const updateCollectionAttributesDB = async (attributes, contract) => {
		console.log('update collection route :', `${url}/update/${contract}`)
		try {
			const res = await axios({
				method: 'patch',
				url: `${url}/update/${contract}`,
				data: { attributes: attributes },
			})
			console.log('Response from updateCollectionAttributesDB', res)
		} catch (err) {
			console.log(err)
		}
	}

	const renderCollectionCard = (collection, id) => {
		return (
			<li key={id}>
				<div className='card-container'>
					<p className='collection-name'>{collection.name}</p>
					<p>{collection.maxSupply}</p>
					{collection.attributes.length > 1 ? (
						<div className='card-last-item'>
							<span>Available </span>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='ionicon check-icon'
								viewBox='0 0 512 512'
							>
								<title>Checkmark Circle</title>
								<path
									d='M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z'
									fill='none'
									stroke='currentColor'
									strokeMiterlimit='10'
									strokeWidth='32'
								/>
								<path
									fill='none'
									stroke='currentColor'
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='32'
									d='M352 176L217.6 336 160 272'
								/>
							</svg>
						</div>
					) : (
						<p className='card-last-item'>
							<button
								className='btn'
								onClick={() => getCollectionItems(collection.contractAddress)}
							>
								Get Rarity
							</button>
						</p>
					)}
				</div>
			</li>
		)
	}

	useEffect(() => {
		console.log('Use effect running')
		;(async function () {
			await getAllCollections()
		})()
	}, [])

	useEffect(() => {
		console.log('Current collection Items in State:', currCollItems)

		// Getting all collection attributes in an Array:
		const currCollAttributes = getCollectionAttributes(currCollItems)

		// Saving attributes to DB
		console.log('currCollAttributes:', currCollAttributes)
		updateCollectionAttributesDB(currCollAttributes, currContract)

		// Updating all items with attributes
		const updatedCollItems = updateCollectionItems(
			currCollItems,
			currCollAttributes
		)
		console.log('updatedCollectionItems', updatedCollItems)

		// Ranking all items in the collection
		const rankedColl = calcRarityScore(updatedCollItems, currCollAttributes)
		console.log(rankedColl)

		// Saving all ranked items in the DB
		saveCollItemsDB(rankedColl, currContract)

		// Stoping the spinner
		setSpinner(false)

		// Refreshing all collection to update buttons
		getAllCollections()
	}, [currCollItems])

	return (
		<>
			<header className='header'>
				<h1 className='heading-primary'>NFT rarity</h1>
			</header>
			{spinner ? (
				<div className='spinner-global-container'>
					<p className='spinner-text'>
						Retrieving all collection items, this can take a few minutes
					</p>
					<div className='spinner-container'>
						<div className='dot-flashing'></div>
					</div>
				</div>
			) : (
				<div>
					<h2 className='heading-secondary'>Collections</h2>
					<div className='collections-container-header'>
						<ul>
							<li>
								<div className='card-container card-container-header'>
									<p>Name</p>
									<p># items</p>
									<p className='card-last-item'>Rarity </p>
								</div>
							</li>
						</ul>
					</div>
					<div className='collections-container'>
						<ul>
							{collections.map((collection, id) =>
								renderCollectionCard(collection, id)
							)}
						</ul>
					</div>
					<div className='container new-collection-container'>
						<p className='new-collection-text'>
							Can't find the collection you're looking for ? Add it by pasting
							the contract address below and clicking "Add"
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
					{/* SPINNER */}
					{/* <div>
					<p>{spinner ? 'spinning' : 'not spinning'}</p>
				</div> */}
				</div>
			)}
			<div className='footer'>
				<p className='footer-text'>
					By Thomas Labrusse, copyright 2022 - for personnal use only
				</p>
			</div>
		</>
	)
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
