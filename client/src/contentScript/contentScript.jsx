// //////////////////////
// SELECTORS

import axios from 'axios'

console.log('Content Script running')

// LISTENING TO URL CHANGE WITH MUTATION OBSERVER
// https://stackoverflow.com/questions/2844565/is-there-a-javascript-jquery-dom-change-listener/11546242#11546242
let lastUrl = location.href
new MutationObserver(() => {
	const url = location.href
	if (url !== lastUrl) {
		lastUrl = url
		onUrlChange()
	}
}).observe(document, { subtree: true, childList: true })

function onUrlChange() {
	console.log('URL changed!', location.href)
	if (location.href.includes('tab=activity')) {
		script('div[role="list"]', 'activity')
	} else script('div[role="grid"]', 'items')
}

const script = function (selector, page) {
	const url = 'http://localhost:3001/api/v1/collections'

	// Title
	const title = document.querySelector('.gdbPwf')
	console.log(title)

	// NFT items container ".bwCDxg"
	let assetsDivsArray = Array.from(document.querySelectorAll('.bwCDxg'))
	console.log(assetsDivsArray)

	// ////////////////////////
	// GENERATING HTML TO INJECT
	const generateHTML = (item, page) => {
		let rarityPercentage = Math.ceil(
			(item.rarityRank / item.nftCollection.maxSupply) * 100
		)
		// #fab005 #f76707 #fa5252 #c92a2a #0c8599 #1864ab
		let backgroundColor
		if (rarityPercentage <= 1) {
			backgroundColor = '#fab005'
		} else if (rarityPercentage <= 5) {
			backgroundColor = '#f76707'
		} else if (rarityPercentage <= 10) {
			backgroundColor = '#fa5252'
		} else if (rarityPercentage <= 20) {
			backgroundColor = '#c92a2a'
		} else if (rarityPercentage <= 50) {
			backgroundColor = '#0c8599'
		} else backgroundColor = '#1864ab'

		if (page === 'items')
			return `
<div class="ranking" style="display:flex; justify-content: space-around; align-items:center; background-color:${backgroundColor}; border-radius: 0 0 10px 10px">
	<div>
		<p style="margin:0 ; padding:6px">${item.name}</p>
	</div>
	<div>
		<p style="margin:6px"><span style="color:#343a40">Rank:</span> ${
			item.rarityRank
		} (${rarityPercentage}%)</p>
		<p style="margin:6px"><span style="color:#343a40">Score:</span> ${Math.round(
			item.rarityScore
		)}</p>
	</div>
</div>
`
		if (page === 'activity')
			return `
<div class="ranking" style="display:flex; justify-content: center; align-items:center; background-color:${backgroundColor}; border-radius:0 0 10px 10px; border-bottom: solid 1px black; margin-bottom:6px">
	<div style="margin:6px">
		<span>
			<span style="color:#343a40">Rank:</span> ${
				item.rarityRank
			} (${rarityPercentage}%)
		</span>
	</div>

	<div style="margin:6px">	
		<span>
			<span style="color:#343a40">Score:</span> ${Math.round(item.rarityScore)}
		</span>
	</div>
</div>
`
	}

	//
	const injectHTML = function (target, content) {
		// Injecting HTML
		if (!target.lastChild.classList.contains('ranking'))
			target.insertAdjacentHTML('beforeend', content)
	}

	// ////////////////////////
	// DOM MANIPULATION (TESTING EXTENSION ACTIVATION ON PAGE)

	title.style.color = 'red'

	// ////////////////////////
	// LISTENING FOR DOM CHANGES

	// DOM node to be monitored
	const targetNode = document.querySelector(selector)

	console.log(targetNode)

	// class="AssetCell--container"

	let observer = new MutationObserver((mutations) => {
		mutations.forEach(async (mutation) => {
			if (mutation.addedNodes.length > 0) {
				let target = mutation.addedNodes[0]
				console.log('Target:', target)
				let link = target.querySelector('a').getAttribute('href')
				console.log('Link:', link)
				let contract = link.split('/')[2]
				let itemId = link.split('/')[3]
				let item, insertionTarget
				insertionTarget = target

				try {
					const res = await axios({
						method: 'get',
						url: `${url}/${contract}/items/${itemId}`,
					})
					item = res.data.data.item
				} catch (err) {
					console.log(err)
					item = {
						name: 'not found in DB',
						rarityScore: 'unknown',
						rarityRank: 'unknown',
					}
				}
				console.log('Insertion Target:', insertionTarget)
				let html = generateHTML(item, page)
				injectHTML(insertionTarget, html)
			}
		})
	})

	observer.observe(targetNode, { childList: true })
}
