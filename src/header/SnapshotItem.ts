import styles from "../main.scss";

export class SnapshotItem {
    public readonly element: HTMLLIElement;
    public readonly date: Date;

    constructor(date: Date, onclick: (i: SnapshotItem) => void) {
        this.date = date;
        this.element = document.createElement("li");
        this.element.className = styles.snapshotItem;
        this.element.textContent = date.toLocaleString();
        this.element.onclick = () => onclick(this);
    }

    public set selected(value: boolean) {
        this.element.classList.toggle(styles.snapshotItemSelected, value);
    }
}