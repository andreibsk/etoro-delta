import { UiLayout } from "./UiLayout";

console.log('eToro Delta loaded.');

const uiLayout = new UiLayout(document.querySelector(UiLayout.selector)!);

uiLayout.portfolioAdded.attach(() => {
	console.debug("Portfolio added.");
})

uiLayout.portfolioRemoved.attach(() => {
	console.debug("Portfolio removed.");
})
