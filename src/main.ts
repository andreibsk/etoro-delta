import { UiLayout } from "./UiLayout";
import { Portfolio } from "./Portfolio";

console.log('eToro Delta loaded.');

const uiLayout = new UiLayout(document.querySelector(UiLayout.selector)!);

uiLayout.portfolioAdded.attach((p: Portfolio) => {
	console.debug("Portfolio added.");
	const snapshot = p.createSnapshot();
	p.compareSnapshot = snapshot;
})

uiLayout.portfolioRemoved.attach(() => {
	console.debug("Portfolio removed.");
})
