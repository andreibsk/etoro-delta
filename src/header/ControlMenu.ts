import styles from "../main.scss";
import { browser } from "webextension-polyfill-ts";
import { SnapshotList } from "./SnapshotList";
import { SnapshotItem } from "./SnapshotItem";
import { SyncEvent } from "ts-events";
import moment from "moment";
import { pastOnlyShortCalendarFormat } from "../Utils";

export class ControlMenu {
    private open: boolean = false;
    private readonly menuElement: HTMLElement;
    private readonly buttonElement: HTMLElement;
    private readonly buttonDateElement: HTMLElement;
    private readonly snapshotList: SnapshotList;
    private readonly cancelCompareButton: HTMLElement;

    public readonly menuContainerElement: HTMLElement;

    public readonly onCreateSnapshotRequest = new SyncEvent<void>();
    public readonly onSelectedSnapshotDateChange = new SyncEvent<Date | null>();
    public onDeleteSnapshot: ((date: Date) => Promise<boolean>) | null = null;

    constructor() {
        document.body.onclick = e => this.onBodyClick(e);

        this.menuContainerElement = document.createElement("div");
        this.menuContainerElement.className = styles.controlMenuContainer;

        this.buttonElement = document.createElement("div");
        this.buttonElement.classList.add(styles.controlMenuButton);
        this.buttonElement.onclick = () => this.toggleMenuOpen();
        this.menuContainerElement.appendChild(this.buttonElement);

        const buttonLogoElement = document.createElement("div");
        buttonLogoElement.classList.add(styles.controlMenuLogo);
        buttonLogoElement.classList.add("i-head-button");
        buttonLogoElement.style.backgroundImage = `url("${browser.runtime.getURL("images/header_icon.png")}")`;
        this.buttonElement.appendChild(buttonLogoElement);

        this.buttonDateElement = document.createElement("div");
        this.buttonDateElement.className = styles.controlMenuButtonDate;
        this.buttonElement.appendChild(this.buttonDateElement);

        const menuPositionerDiv = document.createElement("div");
        this.menuContainerElement.appendChild(menuPositionerDiv);

        this.menuElement = document.createElement("div");
        this.menuElement.className = styles.controlMenu;
        menuPositionerDiv.appendChild(this.menuElement);

        const menuHeaderElement = document.createElement("header");
        menuHeaderElement.className = styles.controlMenuHeader;
        this.menuElement.appendChild(menuHeaderElement);

        const createSnapshotButton = document.createElement("div");
        createSnapshotButton.textContent = "Create"
        createSnapshotButton.classList.add(styles.controlMenuHeaderButton, styles.createIcon);
        createSnapshotButton.onclick = () => this.onCreateSnapshotRequest.post();
        menuHeaderElement.appendChild(createSnapshotButton);

        this.cancelCompareButton = document.createElement("div");
        this.cancelCompareButton.textContent = "Cancel";
        this.cancelCompareButton.classList.add(styles.controlMenuHeaderButton, styles.cancelIcon);
        this.cancelCompareButton.onclick = () => this.selectedSnapshotDate = null;
        this.cancelCompareButtonShown = false;
        menuHeaderElement.appendChild(this.cancelCompareButton);

        this.snapshotList = new SnapshotList();
        this.menuElement.appendChild(this.snapshotList.element);
        
        this.updateButtonDateText();
        setInterval(() => this.updateButtonDateText(), 60 * 1000);
        this.onSelectedSnapshotDateChange.attach(() => this.updateButtonDateText());
    }

    public set selectedSnapshotDate(date: Date | null) {
        this.snapshotList.selectedItem = date ? this.snapshotList.get(date) : null;
        this.cancelCompareButtonShown = !!date;
        this.onSelectedSnapshotDateChange.post(this.snapshotList.selectedItem?.date ?? null);
    }

    public set snapshotDates(dates: Date[]) {
        this.snapshotList.clear();
        this.cancelCompareButtonShown = false;
        this.snapshotList.add(...dates.map(d => this.newSnapshotItem(d)));
    }

    private set cancelCompareButtonShown(shown: boolean) {
        this.cancelCompareButton.style.display = shown ? "" : "none";
    }

	public addSnapshotDate(date: Date) {
        this.snapshotList.add(this.newSnapshotItem(date));
    }

    private newSnapshotItem(date: Date): SnapshotItem {
        return new SnapshotItem(
            date,
            i => this.onSnapshotItemClick(i),
            i => this.onSnapshotItemDeleteClick(i));
    }
    
    private onBodyClick(e: MouseEvent) {
        if (!e.composedPath().includes(this.buttonElement))
            this.toggleMenuOpen(false);
    }

    private onSnapshotItemClick(item: SnapshotItem) {
        const oldItem = this.snapshotList.selectedItem;
        
        if (oldItem != (this.snapshotList.selectedItem = item)) {
            this.cancelCompareButtonShown = true;
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

    private updateButtonDateText() {
        if (!this.snapshotList.selectedItem) {
            this.buttonDateElement.textContent = "";
            return;
        }
        
        this.buttonDateElement.textContent = 
            "@" + moment(this.snapshotList.selectedItem.date).calendar(undefined, pastOnlyShortCalendarFormat);
    }
}
