import { UiLayout } from "./UiLayout";
import { Portfolio, PortfolioListViewSnapshot } from "./Portfolio";
import { storage } from "./Storage";

console.log('eToro Delta loaded.');

const uiLayout = new UiLayout(document.querySelector(UiLayout.selector)!);

uiLayout.portfolioAdded.attach(async (p: Portfolio) => {
	console.debug("Portfolio added.");

	p.header.customHeaderItem.onCreateSnapshotRequest.attach(() => onCreateSnapshotRequest(p));
	p.header.customHeaderItem.onSelectedSnapshotDateChange.attach(d => onSelectedSnapshotDateChange(p, d));
	p.header.customHeaderItem.snapshotDates = await storage.getSnapshotDates();
});

uiLayout.portfolioRemoved.attach(() => {
	console.debug("Portfolio removed.");
});

async function onCreateSnapshotRequest(portfolio: Portfolio) {
	console.debug("Create snapshot requested.");

	const snapshot = portfolio.createSnapshot();

	const snapshotDate = await storage.addSnapshot(snapshot);
	portfolio.header.customHeaderItem.addSnapshotDate(snapshotDate);
	console.debug("Snapshot saved:", snapshot);
}

async function onSelectedSnapshotDateChange(portfolio: Portfolio, date: Date | null) {
	console.debug("Selected snapshot date change:", date === null ? null : date.toLocaleString());

	const snapshot = date === null ? null : await storage.getSnapshot<PortfolioListViewSnapshot>(date);
	if (snapshot === undefined)
		throw new Error(`No snapshot found for date: ${date!.toLocaleString()}`);

	portfolio.compareSnapshot = snapshot;
}
