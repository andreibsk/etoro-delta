import styles from "../main.scss";

export class SnapshotItem {
    public readonly element: HTMLLIElement;
    public readonly date: Date;

    constructor(date: Date, onclick: (i: SnapshotItem) => void, ondelete: (i: SnapshotItem) => void) {
        this.date = date;
        this.element = document.createElement("li");
        this.element.className = styles.snapshotItem;
        this.element.textContent = date.toLocaleString();
        this.element.onclick = () => onclick(this);

        const deleteButton = document.createElement("div");
        deleteButton.className = styles.snapshotItemDeleteButton;
        deleteButton.title = "Delete snapshot";
        deleteButton.onclick = e => { e.stopPropagation(); ondelete(this); };
        this.element.appendChild(deleteButton);
    }

    public set selected(value: boolean) {
        this.element.classList.toggle(styles.snapshotItemSelected, value);
    }
}