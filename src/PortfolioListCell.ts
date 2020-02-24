import { CellDelta } from "./CellDelta";

const cellPrefix: string = "portfolio-overview-table-body-cell";
const cellContainerPrefix: string = "portfolio-overview-table-cell-container-";
const eIdAttributeName = "data-etoro-automation-id";
const valueObserveOptions: MutationObserverInit = { characterData: true, subtree: true };

const selector = {
    portfolioListCellContainer: `[${eIdAttributeName}^='${cellContainerPrefix}']`,

    cell: (s: string) => `[${eIdAttributeName}='${cellPrefix}-${s}']`,
    cellContainer: (s: string) => `[${eIdAttributeName}='${cellContainerPrefix}${s}']`
};

export class PortfolioListCell {
    private readonly element: Element;
    private readonly valueElement: Element;

    private cellDelta: CellDelta | null;
    private _compareValue: number | null = null;
    private readonly valueObserver: MutationObserver;

    constructor(parentElement: Element, name: string, valueName?: string) {
        this.element = parentElement.querySelector(selector.cellContainer(name));
        if (!this.element)
            throw new Error("No element found that matches a PortfolioListCell.");

        this.valueElement = this.element.querySelector(selector.cell(valueName ?? name));
        this.valueObserver = new MutationObserver((m, o) => this.onValueChanged(m, o));
    }

    public get compareValue(): number | null {
        return this._compareValue;
    }

    public set compareValue(value: number | null) {
        this.valueObserver.disconnect();
        this._compareValue = value;

        if (value != null) {
            this.valueObserver.observe(this.valueElement, valueObserveOptions);
            if (this.cellDelta == null) {
                this.cellDelta = new CellDelta();
                this.element.appendChild(this.cellDelta.element);
            }
            this.cellDelta.value = this.value - value;
        }
        else {
            if (this.cellDelta != null) {
                this.cellDelta.element.remove();
                this.cellDelta = null;
            }
        }
    }

    public get value(): number {
        return parseFloat(this.valueString.replace(/[$%<>]/, ""));
    }

    public get valueString(): string {
        return this.valueElement.textContent.trim();
    }
    
    public static elementSelector(name: string): string {
        return selector.cellContainer(name);
    };

    private onValueChanged(_m: MutationRecord[], _o: MutationObserver) {
        if (this.cellDelta != null)
            this.cellDelta.value = this.value - this.compareValue;
    }
}