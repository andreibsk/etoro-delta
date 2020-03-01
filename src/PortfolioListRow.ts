import { PortfolioListCell, PortfolioListCellSnapshot } from "./PortfolioListCell";

type PortfolioListRowCells = {
    marketName: PortfolioListCell,
    profit: PortfolioListCell,
    gain: PortfolioListCell
};

export type PortfolioListRowSnapshot = Omit<{
    [P in keyof PortfolioListRowCells]: PortfolioListCellSnapshot;
}, "marketName">;

export class PortfolioListRow {
    public static readonly elementSelector: string = ".ui-table-row-container";

    private readonly element: Element;
    private readonly cells: Readonly<PortfolioListRowCells>;

    constructor(element: Element) {
        if (!element.matches(PortfolioListRow.elementSelector))
            throw new Error("Element doesn't match a PortfolioListRow.");

        this.element = element;
        this.cells = {
            marketName: new PortfolioListCell(this.element, "action", "market-name", false),
            profit: new PortfolioListCell(this.element, "container-profit", "profit"),
            gain: new PortfolioListCell(this.element, "gain")
        };
    }

    public set compareSnapshot(snapshot: PortfolioListRowSnapshot | null) {
        var cellKey: keyof PortfolioListRowCells;
        for (cellKey in this.cells)
        {
            if (cellKey == "marketName")
                continue;

            this.cells[cellKey].compareSnapshot = snapshot == null ? null : snapshot[cellKey];
        }
    }

    public get marketName(): string {
        return this.cells.marketName.valueString;
    }

    public createSnapshot(): PortfolioListRowSnapshot {
        var snapshot: Partial<PortfolioListRowSnapshot> = {};

        var key: keyof PortfolioListRowCells;
        for (key in this.cells) {
            if (key == "marketName")
                continue;

            snapshot[key] = this.cells[key].createSnapshot();
        }

        return snapshot as PortfolioListRowSnapshot;
    }
}