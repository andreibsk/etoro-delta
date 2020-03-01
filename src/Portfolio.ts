import { PortfolioListRow, PortfolioListRowSnapshot } from "./PortfolioListRow";
import { PortfolioHeader } from "./PortfolioHeader";

type PortfolioListRows = {
    [key: string]: PortfolioListRow
};

export type PortfolioListViewSnapshot = {
    [P in keyof PortfolioListRows]: PortfolioListRowSnapshot;
}

export class Portfolio {
    public static readonly selector: string = ".p-portfolio";

    public readonly element: Element;
    public readonly header: PortfolioHeader;

    private readonly rows: PortfolioListRows;

    constructor(element: Element) {
        if (!element.matches(Portfolio.selector))
            throw new Error("Element doesn't match a PortfolioListView.");

        this.element = element;
        this.header = new PortfolioHeader(element.querySelector(PortfolioHeader.elementSelector)!);

        this.rows = {};
        const rowElements = element.querySelectorAll("ui-table-body > " + PortfolioListRow.elementSelector);
        for (const elem of rowElements) {
            const row = new PortfolioListRow(elem);
            this.rows[row.marketName] = row;
        }
    }

    public set compareSnapshot(snapshot: PortfolioListViewSnapshot | null) {
        var key: keyof PortfolioListRows;
        for (key in this.rows)
            this.rows[key].compareSnapshot = snapshot == null ? null : snapshot[key];
    }

    public createSnapshot(): PortfolioListViewSnapshot {
        var snapshot: Partial<PortfolioListViewSnapshot> = {};

        var key: keyof PortfolioListRows;
        for (key in this.rows)
            snapshot[key] = this.rows[key].createSnapshot();

        return snapshot as PortfolioListViewSnapshot;
    }
}