import { UiLayout } from "./UiLayout";
import { Portfolio } from "./portfolio";
import { storage, Snapshot } from "./Storage";
import { Header } from "./header";
import { EtAccountBalanceFooter } from "./footer";
import { filter } from "./Utils";
import { browser } from "webextension-polyfill-ts";

const manifest = browser.runtime.getManifest();
console.log(manifest.name + " v" + manifest.version + ' loaded.');

let uiLayout: UiLayout;
let header: Header;
let accountFooter: EtAccountBalanceFooter | null = null;
let portfolio: Portfolio | null = null;
let selectedSnapshot: Snapshot | null = null;

const uiLayoutElement = document.querySelector(UiLayout.selector);
if (uiLayoutElement) {
	initializeUiLayout(uiLayoutElement);
}
else {
	const uiLayoutObserver = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) => {
		const mutationResult = filter(mutations, UiLayout.selector).next();
		if (!mutationResult.value || mutationResult.value.added != true)
			return;
		
		console.debug("UiLayout added.");
		observer.disconnect();
		initializeUiLayout(mutationResult.value.element);
	});
	uiLayoutObserver.observe(document.body, { childList: true, subtree: true });
}

function initializeUiLayout(elem: Element) {
	uiLayout = new UiLayout(elem);

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
		const storageInfo = await storage.getBytesUsage();

		header.controlMenu.snapshotDates = await storage.getSnapshotDates();
		header.controlMenu.selectedSnapshotDate = selectedSnapshotDate;
		header.controlMenu.onCreateSnapshotRequest.attach(onCreateSnapshotRequest);
		header.controlMenu.onSelectedSnapshotDateChange.attach(onSelectedSnapshotDateChange);
		header.controlMenu.onDeleteSnapshot = onDeleteSnapshot;
		header.controlMenu.updateStorageInfo(storageInfo?.used, storageInfo?.total);

		await onSelectedSnapshotDateChange(selectedSnapshotDate, false);
	});
	uiLayout.headerRemoved.attach(() => {
		console.debug("Header removed.")
	});

	uiLayout.footerAdded.attach(async (f: EtAccountBalanceFooter) => {
		console.debug("Footer added.");
		console.assert(header, "Footer mounted before the header.");
		accountFooter = f;
		accountFooter.compareSnapshot = selectedSnapshot === null ? null : selectedSnapshot.account;
	});
	uiLayout.footerRemoved.attach(() => {
		console.debug("Footer removed.");
		accountFooter = null;
	});
}

async function onCreateSnapshotRequest() {
	console.debug("Create snapshot requested.");
	if (!portfolio || !accountFooter) {
		console.log("Creating snapshot on pages other than portfolio is not supported.");
		return;
	}

	const snapshot: Snapshot = {
		account: accountFooter.createSnapshot(),
		portfolio: portfolio.createSnapshot()
	};
	const snapshotDate = await storage.addSnapshot(snapshot);
	header.controlMenu.addSnapshotDate(snapshotDate);
	console.debug(`Snapshot saved (${snapshotDate.toLocaleString()}):`, snapshot);
}

async function onDeleteSnapshot(date: Date): Promise<boolean> {
	console.debug("Delete snapshot:", date);
	return await storage.removeSnapshot(date);
}

async function onSelectedSnapshotDateChange(date: Date | null, save: boolean = true) {
	console.debug("Selected snapshot date:", date === null ? null : date.toLocaleString());

	const snapshot = date === null ? null : await storage.getSnapshot(date);
	if (snapshot === undefined)
		throw new Error(`No snapshot found for date: ${date!.toLocaleString()}`);

	selectedSnapshot = snapshot;

	if (portfolio)
		portfolio.compareSnapshot = snapshot === null ? null : snapshot.portfolio;

	if (accountFooter)
		accountFooter.compareSnapshot = snapshot === null ? null : snapshot.account;

	if (save)
		await storage.setSelectedSnapshotDate(date);
}
