import { UiLayout } from "./UiLayout";
import { Portfolio } from "./Portfolio";
import { storage, Snapshot } from "./Storage";
import { Header } from "./Header";

console.log('eToro Delta loaded.');

const uiLayout = new UiLayout(document.querySelector(UiLayout.selector)!);
let header: Header;
let portfolio: Portfolio | null = null;
let selectedSnapshot: Snapshot | null = null;

uiLayout.portfolioAdded.attach(async (p: Portfolio) => {
	console.debug("Portfolio added.");
	console.assert(header, "Portfolio mounted before the header.");
	portfolio = p;
	portfolio.compareSnapshot = selectedSnapshot === null ? null : selectedSnapshot.portfolio;
});
uiLayout.portfolioRemoved.attach(() => {
	console.debug("Portfolio removed.");
	portfolio = null;
});

uiLayout.headerAdded.attach(async (h: Header) => {
	console.debug("Header added.");
	header = h;

	const selectedSnapshotDate = await storage.getSelectedSnapshotDate();

	header.controlPanel.snapshotDates = await storage.getSnapshotDates();
	header.controlPanel.selectedSnapshotDate = selectedSnapshotDate;
	header.controlPanel.onCreateSnapshotRequest.attach(() => onCreateSnapshotRequest());
	header.controlPanel.onSelectedSnapshotDateChange.attach(d => onSelectedSnapshotDateChange(d));
	
	await onSelectedSnapshotDateChange(selectedSnapshotDate, false);
});
uiLayout.headerRemoved.attach(() => { 
	console.debug("Header removed.")
});

async function onCreateSnapshotRequest() {
	console.debug("Create snapshot requested.");
	if (!portfolio) {
		console.log("Creating snapshot on pages other than portfolio is not supported.");
		return;
	}

	const snapshot: Snapshot = {
		portfolio: portfolio.createSnapshot()
	};
	const snapshotDate = await storage.addSnapshot(snapshot);
	header.controlPanel.addSnapshotDate(snapshotDate);
	console.debug(`Snapshot saved (${snapshotDate.toLocaleString()}):`, snapshot);
}

async function onSelectedSnapshotDateChange(date: Date | null, save: boolean = true) {
	console.debug("Selected snapshot date:", date === null ? null : date.toLocaleString());

	const snapshot = date === null ? null : await storage.getSnapshot(date);
	if (snapshot === undefined)
		throw new Error(`No snapshot found for date: ${date!.toLocaleString()}`);

	selectedSnapshot = snapshot;

	if (portfolio)
		portfolio.compareSnapshot = selectedSnapshot === null ? null : selectedSnapshot.portfolio;

	if (save)
		await storage.setSelectedSnapshotDate(date);
}
