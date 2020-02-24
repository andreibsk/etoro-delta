import { PortfolioListRow } from "./PortfolioListRow";
import { filter } from "./Utils";

const selector = {
    portfolioListView: "portfolio-list-view",
    uiTable: "ui-table",
    uiTableBody: "ui-table-body",
}

export class PortfolioListView {
    public static readonly selector: string = selector.portfolioListView;

    public readonly element: Element;
    private readonly uiTableElement: Element;
    private uiTableBodyElement: Element;
    private readonly observer: MutationObserver;

    private rows: PortfolioListRow[];

    constructor(element: Element) {
        if (!element.matches(PortfolioListView.selector))
            throw new Error("Element doesn't match a PortfolioListView.");

        this.element = element;
        this.uiTableElement = element.querySelector(selector.uiTable);
        this.uiTableBodyElement = element.querySelector(selector.uiTableBody);
        this.observer = new MutationObserver(m => this.onMutationObserved(m));
        this.observer.observe(this.uiTableElement, { childList: true });

        this.initChildren();
    }

    private initChildren() {
        this.rows = Array.from(
            this.element.querySelectorAll(`${selector.uiTableBody} > ${PortfolioListRow.elementSelector}`),
            elem => new PortfolioListRow(elem));
    }

    private onMutationObserved(mutations: MutationRecord[]) {
        for (const mutation of filter(mutations, selector.uiTableBody)) {
            if (mutation?.added == true) {
                this.uiTableBodyElement = mutation.element;
                this.initChildren();
                console.debug("Table body added.");
            }
            else if (mutation?.added == false) {
                if (this.uiTableBodyElement == mutation.element)
                    this.uiTableBodyElement = null;
                console.debug("Table body removed.");
            }
        }
    }
}