// //////////////////////
// SELECTORS

import axios, { Axios } from 'axios'

const url = 'http://localhost:3001/api/v1/collections'

// Title
const title = document.querySelector('.gdbPwf')
console.log(title)

// NFT items container ".bwCDxg"
let assetsDivsArray = Array.from(document.querySelectorAll('.bwCDxg'))
console.log(assetsDivsArray)

// ////////////////////////
// GENERATING HTML TO INJECT
// TODO: pass contract address to the function to retreive ranking from API
const generateHTML = (item) =>
	// TODO: retreive ranking from API using the contract address
	`
<div class="ranking">
	<p>#${item.name} ranking ${item.rarityRank}</p>
</div>
`

//
const injectingHTML = function (target, content) {
	// Injecting HTML
	if (!target.lastChild.classList.contains('ranking'))
		target.insertAdjacentHTML('beforeend', content)
}

// ////////////////////////
// DOM MANIPULATION (TEST)

title.style.color = 'red'

// ////////////////////////
// LISTENING FOR DOM CHANGES

// DOM node to be monitored
const targetNode = document.querySelector('div[role="grid"]')

console.log(targetNode)

let observer = new MutationObserver((mutations) => {
	mutations.forEach(async (mutation) => {
		if (mutation.addedNodes.length > 0) {
			let target = mutation.addedNodes[0]
			console.log('Target:', target)
			let link = target.querySelector('a').getAttribute('href')
			console.log('Link:', link)
			let contract = link.split('/')[2]
			let itemId = link.split('/')[3]
			let item
			try {
				console.log('REACHES HERE FIRST')
				res = await axios({
					method: 'get',
					url: `${url}/${contract}/items/${itemId}`,
				})
				console.log('REACHES HER SECOND')
				console.log('RES FROM DB:', res)
				item = res.data.item
			} catch (err) {
				console.log(err)
				item = {
					name: 'not found in DB',
					rarityRank: 'unknown',
				}
			}

			// TODO: retreive contract address from the link and pass it to generateHTML()
			// console.log('Item id:', itemId[3])
			let html = generateHTML(item)
			// Get item id from <a> tag in node mutated
			// Display correct id in the HTML injected (below card)
			injectingHTML(target, html)
		}
	})
	// console.log(mutations);
	// mutations.forEach((mutation, index) => {
	// 	console.log(`Mutation #${index}`);
	// 	console.log(mutation);
	// });
})

observer.observe(targetNode, { childList: true })

// TO DO
