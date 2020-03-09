import styles from "../main.scss";
import moment from "moment";

export class SnapshotItem {
    public readonly element: HTMLLIElement;
    public readonly dateElement: HTMLElement;
    public readonly date: Date;

    constructor(date: Date, onclick: (i: SnapshotItem) => void, ondelete: (i: SnapshotItem) => void) {
        this.date = date;
        this.element = document.createElement("li");
        this.element.className = styles.snapshotItem;

        this.dateElement = document.createElement("div");
        this.dateElement.className = styles.snapshotItemDate;
        this.dateElement.title = date.toLocaleString();
        this.dateElement.onclick = () => onclick(this);
        this.element.appendChild(this.dateElement);
        this.updateTextContent();
        setInterval(() => this.updateTextContent(), 60 * 1000);

        const deleteButton = document.createElement("div");
        deleteButton.className = styles.snapshotItemDeleteButton;
        deleteButton.title = "Delete snapshot";
        deleteButton.onclick = e => { e.stopPropagation(); ondelete(this); };
        this.element.appendChild(deleteButton);
    }

    public set selected(value: boolean) {
        this.element.classList.toggle(styles.snapshotItemSelected, value);
    }

    public updateTextContent() {
        this.dateElement.textContent = `${moment(this.date).calendar()} (${moment(this.date).fromNow()})`;
    }
}