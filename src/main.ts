import { UiLayout } from "./UiLayout";
import { Portfolio } from "./Portfolio";
import { storage } from "./Storage";

console.log('eToro Delta loaded.');

const uiLayout = new UiLayout(document.querySelector(UiLayout.selector)!);

uiLayout.portfolioAdded.attach((p: Portfolio) => {
	console.debug("Portfolio added.");
	const snapshot = p.createSnapshot();
	p.compareSnapshot = snapshot;

	p.header.customHeaderItem.onCreateSnapshotRequest.attach(() => onCreateSnapshotRequest(p));
});

uiLayout.portfolioRemoved.attach(() => {
	console.debug("Portfolio removed.");
});

async function onCreateSnapshotRequest(portfolio: Portfolio) {
	console.debug("Create snapshot requested.");

	const snapshot = portfolio.createSnapshot();
	
	await storage.addSnapshot(snapshot);
	console.debug("Snapshot saved:", snapshot);
}