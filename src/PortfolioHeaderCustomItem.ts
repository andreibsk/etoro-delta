import styles from "./main.scss"
import { SyncEvent } from "ts-events";

export class PortfolioHeaderCustomItem {
    public readonly element: Element;
    public readonly onCreateSnapshotRequest = new SyncEvent<void>();
    public readonly onSelectedSnapshotDateChange = new SyncEvent<Date | null>();

    private readonly snapshotDateSelectElement: HTMLSelectElement;
    private readonly snapshotDateDefaultOptionElement: HTMLOptionElement;

    constructor() {
        this.snapshotDateDefaultOptionElement = document.createElement("option");
        this.snapshotDateDefaultOptionElement.selected = true;
        this.snapshotDateDefaultOptionElement.value = "";
        this.snapshotDateDefaultOptionElement.text = "No delta";

        this.snapshotDateSelectElement = document.createElement("select");
        this.snapshotDateSelectElement.appendChild(this.snapshotDateDefaultOptionElement);
        this.snapshotDateSelectElement.onchange = () => this.snapshotDateSelectElementValueChanged();

        const createSnapshotButton = document.createElement("button");
        createSnapshotButton.innerText = "NEW";
        createSnapshotButton.onclick = () => this.onCreateSnapshotRequest.post();

        this.element = document.createElement("div");
        this.element.className = styles.portfolioHeaderCustomItem;
        this.element.appendChild(this.snapshotDateSelectElement);
        this.element.appendChild(createSnapshotButton);
    }

    public set selectedSnapshotDate(date: Date | null) {
        const val = date === null ? "" : date.getTime().toString();
        
        for (let i = 0; i < this.snapshotDateSelectElement.options.length; i++) {
            const opt = this.snapshotDateSelectElement.options[i];
            
            if (opt.value === val) {
                this.snapshotDateSelectElement.selectedIndex = i;
                this.snapshotDateSelectElementValueChanged();
                break;
            }
        }
    }

    public set snapshotDates(dates: Date[]) {
        while (this.snapshotDateSelectElement.lastChild != this.snapshotDateDefaultOptionElement)
            this.snapshotDateSelectElement.lastChild!.remove();

        for (const date of dates.sort().reverse()) {
            const option = document.createElement("option");
            option.value = date.getTime().toString();
            option.text = date.toLocaleString();
            this.snapshotDateSelectElement.appendChild(option);
        }
    }

	public addSnapshotDate(date: Date) {
        const option = document.createElement("option");
        option.value = date.getTime().toString();
        option.text = date.toLocaleString();

		this.snapshotDateSelectElement.insertBefore(option, this.snapshotDateDefaultOptionElement.nextSibling);
	}

    private snapshotDateSelectElementValueChanged() {
        this.onSelectedSnapshotDateChange.post(
            this.snapshotDateSelectElement.value
                ? new Date(parseInt(this.snapshotDateSelectElement.value))
                : null
        );
    }
}