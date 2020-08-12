import { Delta, Mode } from "../Delta";

const cellPrefix: string = "portfolio-overview-table-body-cell";
const cellContainerPrefix: string = "portfolio-overview-table-cell-container-";
const eIdAttributeName = "data-etoro-automation-id";
const valueObserveOptions: MutationObserverInit = { characterData: true, subtree: true };

const selector = {
    portfolioListCellContainer: `[${eIdAttributeName}^='${cellContainerPrefix}']`,

    cell: (s: string) => `[${eIdAttributeName}='${cellPrefix}-${s}']`,
    cellContainer: (s: string) => `[${eIdAttributeName}='${cellContainerPrefix}${s}']`
};

export const PortfolioListCellSelector = selector;
export type PortfolioListCellSnapshot = number;

export class PortfolioListCell {
    private readonly element: Element;
    private readonly valueElement: Element;

    private cellDelta: Delta | null;
    private _compareValue: number | null = null;
    private readonly compare: false | Mode;
    private readonly compareObserver: MutationObserver;

    private constructor(element: Element, valueElement: Element, compare: false | Mode = "positiveNegative") {
        this.element = element;
        this.valueElement = valueElement;
        this.compare = compare;
        this.compareObserver = new MutationObserver((m, o) => this.onDeltaChanged(m, o));
    }

    private get compareValue(): number | null {
        return this._compareValue;
    }

    private set compareValue(value: number | null) {
        if (!this.compare)
            return;

        this.compareObserver.disconnect();
        this._compareValue = value;

        if (value != null) {
            this.compareObserver.observe(this.valueElement, valueObserveOptions);
            if (this.cellDelta == null) {
                this.cellDelta = new Delta({ mode: this.compare });
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
        return parseFloat(this.valueString.replace(/[$%<>]/g, ""));
    }

    public get valueString(): string {
        return this.valueElement.textContent!.trim();
    }

    public static elementSelector(name: string): string {
        return selector.cellContainer(name);
    }

    public static tryConstruct(parentElement: Element, name: string, valueName?: string, compare?: false | Mode): PortfolioListCell | undefined {
        const element = parentElement.querySelector(selector.cellContainer(name));
        const valueElement = element?.querySelector(selector.cell(valueName ?? name));

        return element && valueElement && valueElement.textContent != null
            ? new PortfolioListCell(element, valueElement, compare)
            : undefined;
    }

    private onDeltaChanged(_m: MutationRecord[], _o: MutationObserver) {
        if (this.compare && this.cellDelta != null)
            this.cellDelta.value = this.compareValue == null ? 0 : this.value - this.compareValue;
    }

    public set compareSnapshot(snapshot: PortfolioListCellSnapshot | null) {
        this.compareValue = snapshot;
    }

    public createSnapshot(): PortfolioListCellSnapshot {
        return this.value;
    }
}