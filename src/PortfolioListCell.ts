const cellPrefix: string = "portfolio-overview-table-body-cell";
const cellContainerPrefix: string = "portfolio-overview-table-cell-container-";
const eIdAttributeName = "data-etoro-automation-id"

const selector = {
    portfolioListCellContainer: `[${eIdAttributeName}^='${cellContainerPrefix}']`,

    cell: (s: string) => `[${eIdAttributeName}='${cellPrefix}-${s}']`,
    cellContainer: (s: string) => `[${eIdAttributeName}='${cellContainerPrefix}${s}']`
};

export class PortfolioListCell {
    private readonly element: Element;
    private readonly valueElement: Element;

    constructor(parentElement: Element, name: string, valueName?: string) {
        this.element = parentElement.querySelector(selector.cellContainer(name));
        if (!this.element)
            throw new Error("No element found that matches a PortfolioListCell.");

        this.valueElement = this.element.querySelector(selector.cell(valueName ?? name));
    }
    
    public static elementSelector(name: string): string {
        return selector.cellContainer(name);
    };

    public get value(): number {
        return parseFloat(this.valueString.replace(/[$%]/, ""));
    }

    public get valueString(): string {
        return this.valueElement.textContent.trim();
    }
}