import { UiLayout } from "./UiLayout";

console.log('eToro Delta loaded.');

const uiLayout = new UiLayout(document.querySelector(UiLayout.selector));

uiLayout.portfolioListViewAdded.attach(plv => {
	console.log("Portfolio added: ", plv);
})

uiLayout.portfolioListViewRemoved.attach(plv => {
	console.log("Portfolio removed: ", plv);
})
