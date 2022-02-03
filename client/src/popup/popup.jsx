import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import './popup.css'

// CONTRACTS EXAMPLES
// const contractAddress = "0xE3234e57ac38890a9136247EAdFE1860316Ff6ab"; //Mood Rollers
// const contractAddress = "0x2931b181ae9dc8f8109ec41c42480933f411ef94"; //Slimhoods
// const contractAddress = "0xD78b76Fcc33cd416dA9d3D42f72649a23D7AC647"; //Lil Heroes by Edgar Plans
// const contractAddress = "0xed5af388653567af2f388e6224dc7c4b3241c544"; //Azuki
// const contractAddress = "0x4Db1f25D3d98600140dfc18dEb7515Be5Bd293Af"; //Hape Prime
// const contractAddress = "0xAf615B61448691fC3E4c61AE4F015d6e77b6CCa8"; //Lives of Asuna

const url = 'http://localhost:3001/api/v1/collection'

const App = function () {
	const [collections, setCollections] = useState([])
	const [contract, setContract] = useState('')

	const createNewCollection = async function () {
		if (contract === '') return
		console.log(
			`Sending a request to the server to create a new collection with contract ${contract}`
		)
		try {
			const res = await axios({
				method: 'post',
				url: url,
				data: {
					contractAddress: contract,
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
			console.log(res)
		} catch (err) {
			console.log(err)
		}
	}

	const renderCollectionCard = (collection) => {
		return (
			<li>
				<div className='card-container grid grid--3-cols'>
					<p>{collection.name}</p>
					<p>{collection.maxSupply}</p>
					<p>
						<button
							onClick={() => getCollectionItems(collection.contractAddress)}
						>
							Get items
						</button>
					</p>
				</div>
			</li>
		)
	}

	useEffect(() => {
		console.log('Use effect running')
		;(async function () {
			const updatedCollections = await getAllCollections()
			console.log('Updated collections:', updatedCollections)
			setCollections(updatedCollections)
			console.log(collections)
		})()
	}, [])

	return (
		<>
			<header className='header'>
				<h1 className='heading-primary'>NFT Traits Extension</h1>
			</header>
			<div className='container new-collection-container'>
				<input
					type='text'
					value={contract}
					placeholder='0xed5af388653567af2f388e6224dc7c4b3241c544'
					onChange={(event) => setContract(event.target.value)}
				/>
				<button className='btn' onClick={createNewCollection}>
					Add Collection to DB
				</button>
			</div>
			<div className='container'>
				<h2 className='heading-secondary collections-header'>My Collections</h2>
				<ul>
					{collections.map((collection) => renderCollectionCard(collection))}
				</ul>
			</div>
		</>
	)
}

// const getCollectionBtn = document.getElementById('get-collection-btn')
// const inputEl = document.getElementById('contract-input')

// // 127.0.0.1:3001/api/v1/collection

// const createNewCollection = function (contract) {
// 	try {
// 		axios({
// 			method: 'post',
// 			url: 'http://localhost:3001/api/v1/collection',
// 			data: {
// 				contractAddress: contract,
// 			},
// 		}).then((res) => console.log(res))
// 	} catch (err) {
// 		console.log(err)
// 	}
// }

// getCollectionBtn.addEventListener('click', createNewCollection(inputEl.value))

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)

// chrome.storage.sync.get("color", ({ color }) => {
// 	changeColor.style.backgroundColor = color;
// });

// changeColor.addEventListener("click", async () => {
// 	// selecting active tab as tab
// 	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

// 	chrome.scripting.executeScript({
// 		target: { tabId: tab.id },
// 		// use "files" if script is in a different file
// 		files: ["contentScript.js"],
// 		// passing arguments to a function
// 		// args:[color],
// 		// Invoking a function directly
// 		// function: setPageBackgroundColor,
// 	});
// });

// the script can be in a different file

// function setPageBackgroundColor() {
// 	chrome.storage.sync.get("color", ({ color }) => {
// 		document.body.style.backgroundColor = color;
// 	});
// }
