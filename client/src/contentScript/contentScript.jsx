// //////////////////////
// SELECTORS

// Title
const title = document.querySelector(".gdbPwf");
console.log(title);

// NFT items container ".bwCDxg"
let assetsDivsArray = Array.from(document.querySelectorAll(".bwCDxg"));
console.log(assetsDivsArray);

// ////////////////////////
// GENERATING HTML TO INJECT
// TODO: pass contract address to the function to retreive ranking from API
const generateHTML = (itemId) =>
	// TODO: retreive ranking from API using the contract address
	`
<div class="ranking">
	<p>#${itemId} ranking</p>
</div>
`;

//
const injectingHTML = function (target, content) {
	// Injecting HTML
	if (!target.lastChild.classList.contains("ranking"))
		target.insertAdjacentHTML("beforeend", content);
};

// ////////////////////////
// DOM MANIPULATION (TEST)

title.style.color = "red";

// ////////////////////////
// LISTENING FOR DOM CHANGES

// DOM node to be monitored
const targetNode = document.querySelector('div[role="grid"]');

console.log(targetNode);

let observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		if (mutation.addedNodes.length > 0) {
			let target = mutation.addedNodes[0];
			console.log(target);
			let link = target.querySelector("a").getAttribute("href");
			console.log(link);
			let itemId = link.split("/")[3];

			// TODO: retreive contract address from the link and pass it to generateHTML()
			console.log(itemId[3]);
			let html = generateHTML(itemId);
			// Get item id from <a> tag in node mutated
			// Display correct id in the HTML injected (below card)
			injectingHTML(target, html);
		}
	});
	// console.log(mutations);
	// mutations.forEach((mutation, index) => {
	// 	console.log(`Mutation #${index}`);
	// 	console.log(mutation);
	// });
});

observer.observe(targetNode, { childList: true });

// TO DO
