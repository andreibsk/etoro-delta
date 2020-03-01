import styles from "./main.scss"
import { SyncEvent } from "ts-events";

export class PortfolioHeaderCustomItem {
    public readonly element: Element;

    public readonly onCreateSnapshotRequest: SyncEvent<void> = new SyncEvent();

    constructor() {
        this.element = document.createElement("div");
        this.element.className = styles.portfolioHeaderCustomItem;

        const snapshotSelect = document.createElement("select");
        snapshotSelect.appendChild(document.createElement("option"));
        this.element.appendChild(snapshotSelect);

        const createSnapshotButton = document.createElement("button");
        createSnapshotButton.innerText = "NEW";
        createSnapshotButton.onclick = () => this.onCreateSnapshotRequest.post();
        this.element.appendChild(createSnapshotButton);
    }
}