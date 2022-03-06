import styles from "../main.scss";
import browser from "webextension-polyfill";
import { SnapshotList } from "./SnapshotList";
import { SnapshotItem } from "./SnapshotItem";
import { SyncEvent } from "ts-events";
import moment from "moment";
import { pastOnlyShortCalendarFormat } from "../Utils";
import { StorageInfo } from "./StorageInfo";

export class ControlMenu {
    private open: boolean = false;
    private readonly menuElement: HTMLElement;
    private readonly buttonElement: HTMLElement;
    private readonly createSnapshotButtonElement: HTMLElement;
    private readonly snapshotList: SnapshotList;
    private readonly storageInfo: StorageInfo;

    public readonly menuContainerElement: HTMLElement;

    public readonly onCreateSnapshotRequest = new SyncEvent<void>();
    public readonly onSelectedSnapshotDateChange = new SyncEvent<Date | null>();
    public onDeleteSnapshot: ((date: Date) => Promise<boolean>) | null = null;

    constructor() {
        this.createSnapshotButtonElement = this.createCreateSnapshotElement();
        this.buttonElement = this.createMenuButtonElement();
        this.snapshotList = new SnapshotList();
        this.storageInfo = new StorageInfo();
        this.menuElement = this.createMenuElement(this.snapshotList, this.storageInfo);

        const menuPositionerDiv = document.createElement("div");
        menuPositionerDiv.appendChild(this.menuElement);

        this.menuContainerElement = document.createElement("div");
        this.menuContainerElement.className = styles.controlMenuContainer;
        this.menuContainerElement.appendChild(this.buttonElement);
        this.menuContainerElement.appendChild(menuPositionerDiv);
    }

    public set createSnapshotEnabled(enabled: boolean) {
        this.createSnapshotButtonElement.style.display = enabled ? "" : "none";
    }

    public set selectedSnapshotDate(date: Date | null) {
        this.snapshotList.selectedItem = date ? this.snapshotList.get(date) : null;
        this.onSelectedSnapshotDateChange.post(this.snapshotList.selectedItem?.date ?? null);
    }

    public set snapshotDates(dates: Date[]) {
        if (this.snapshotList.selectedItem)
            this.onSelectedSnapshotDateChange.post(null);

        this.snapshotList.clear();
        this.snapshotList.add(...dates.map(d => this.newSnapshotItem(d)));
    }

    public addSnapshotDate(date: Date) {
        this.snapshotList.add(this.newSnapshotItem(date));
    }

    public updateStorageInfo(bytesInUse?: number, bytesTotal?: number) {
        this.storageInfo.bytesInUse = bytesInUse ?? null;
        this.storageInfo.bytesTotal = bytesTotal ?? null;
    }

    private createFooterElement(storageInfo: StorageInfo): HTMLElement {
        const footer = document.createElement("footer");
        footer.className = styles.controlMenuFooter;

        const manifest = browser.runtime.getManifest();

        const extensionInfo = document.createElement("div");
        footer.appendChild(extensionInfo);

        const extensionInfoLink = document.createElement("a");
        extensionInfoLink.href = manifest.homepage_url ?? "";
        extensionInfoLink.textContent = manifest.name + " v" + manifest.version;
        extensionInfo.appendChild(extensionInfoLink);

        footer.appendChild(storageInfo.element);
        return footer;
    }

    private createCreateSnapshotElement(): HTMLElement {
        const createSnapshotButton = document.createElement("div");
        createSnapshotButton.textContent = "Create"
        createSnapshotButton.classList.add(styles.controlMenuHeaderButton, styles.createIcon);
        createSnapshotButton.onclick = () => this.onCreateSnapshotRequest.post();

        return createSnapshotButton;
    }

    private createHeaderElement(): HTMLElement {
        const cancelButton = document.createElement("div");
        cancelButton.textContent = "Cancel";
        cancelButton.classList.add(styles.controlMenuHeaderButton, styles.cancelIcon);
        cancelButton.onclick = () => this.selectedSnapshotDate = null;
        cancelButton.style.display = "none";
        const cancelButtonShown = (shown: boolean) => cancelButton.style.display = shown ? "" : "none";
        this.onSelectedSnapshotDateChange.attach(d => cancelButtonShown(d != null))

        const header = document.createElement("header");
        header.className = styles.controlMenuHeader;
        header.appendChild(cancelButton);
        header.appendChild(this.createSnapshotButtonElement);
        return header;
    }

    private createMenuButtonElement(): HTMLElement {
        const logo = document.createElement("div");
        logo.classList.add(styles.controlMenuLogo, "i-head-button");
        logo.style.backgroundImage = `url("${browser.runtime.getURL("images/header_icon.png")}")`;

        const date = document.createElement("div");
        date.className = styles.controlMenuButtonDate;

        const updateDate = () =>
            date.textContent = this.snapshotList?.selectedItem
                ? "@" + moment(this.snapshotList.selectedItem.date).calendar(undefined, pastOnlyShortCalendarFormat)
                : "";

        updateDate();
        setInterval(updateDate, 60 * 1000);
        this.onSelectedSnapshotDateChange.attach(updateDate);

        const button = document.createElement("div");
        button.className = styles.controlMenuButton;
        button.appendChild(logo);
        button.appendChild(date);

        button.onclick = () => this.toggleMenuOpen();
        document.body.onclick = e => {
            if (!e.composedPath().includes(button))
                this.toggleMenuOpen(false);
        };

        return button;
    }

    private createMenuElement(snapshotList: SnapshotList, storageInfo: StorageInfo): HTMLElement {
        const menu = document.createElement("div");
        menu.className = styles.controlMenu;
        menu.appendChild(this.createHeaderElement());
        menu.appendChild(snapshotList.element);
        menu.appendChild(this.createFooterElement(storageInfo));
        return menu
    }

    private newSnapshotItem(date: Date): SnapshotItem {
        return new SnapshotItem(
            date,
            i => this.onSnapshotItemClick(i),
            i => this.onSnapshotItemDeleteClick(i));
    }

    private onSnapshotItemClick(item: SnapshotItem) {
        const oldItem = this.snapshotList.selectedItem;

        if (oldItem != (this.snapshotList.selectedItem = item)) {
            this.onSelectedSnapshotDateChange.post(item.date);
        }
    }

    private async onSnapshotItemDeleteClick(item: SnapshotItem) {
        if (this.onDeleteSnapshot && await this.onDeleteSnapshot(item.date))
            this.snapshotList.remove(item);
    }

    private toggleMenuOpen(forceOpen?: boolean) {
        const open = forceOpen ?? !this.open;
        if (open === this.open)
            return;

        this.open = open;
        this.buttonElement.classList.toggle(styles.controlMenuButtonActive, open);
        this.menuElement.classList.toggle(styles.controlMenuOpen, open);
    }
}
