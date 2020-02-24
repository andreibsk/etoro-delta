import { PortfolioListCell } from "./PortfolioListCell";

export class PortfolioListRow {
    public static readonly elementSelector: string = ".ui-table-row-container";

    private readonly element: Element;
    private readonly marketNameCell: PortfolioListCell;
    private readonly profitCell: PortfolioListCell;
    private readonly gainCell: PortfolioListCell;

    constructor(element: Element) {
        if (!element.matches(PortfolioListRow.elementSelector))
            throw new Error("Element doesn't match a PortfolioListRow.");

        this.element = element;
        this.marketNameCell = new PortfolioListCell(this.element, "action", "market-name");
        this.profitCell = new PortfolioListCell(this.element, "container-profit", "profit");
        this.gainCell = new PortfolioListCell(this.element, "gain");

        this.profitCell.compareValue = this.profitCell.value;
        this.gainCell.compareValue = this.gainCell.value;
    }

    public get marketName(): string {
        return this.marketNameCell.valueString;
    }
}