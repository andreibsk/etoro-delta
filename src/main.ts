import { UiLayout } from "./UiLayout";

console.log('eToro Delta loaded.');

const uiLayout = new UiLayout(document.querySelector(UiLayout.selector)!);

uiLayout.portfolioListViewAdded.attach(() => {
	console.debug("Portfolio added.");
})

uiLayout.portfolioListViewRemoved.attach(() => {
	console.debug("Portfolio removed.");
})
