import { Delta } from "./Delta";

const unitPrefix: string = "account-balance";
const eIdAttributeName = "automation-id";

const selector = {
    element: ".footer-unit",
    valueElement: ".footer-unit-value",

    unit: (s: string) => `[${eIdAttributeName}='${unitPrefix}-${s}']`
};

export type FooterUnitSnapshot = number;

export class FooterUnit {
    private readonly element: Element;
    private readonly valueElement: Element;

    private delta: Delta | null;
    private _compareValue: number | null = null;
    private readonly compareObserver: MutationObserver;

    constructor(parentElement: Element, name: string) {
        const element = parentElement.querySelector(selector.element + selector.unit(name));
        const valueElement = element?.querySelector(selector.valueElement);

        if (!element || !valueElement)
            throw new Error("No element found that matches a FooterUnit.");

        this.element = element;
        this.valueElement = valueElement;
        this.compareObserver = new MutationObserver((m, o) => this.onDeltaChanged(m, o));
    }

    private get compareValue(): number | null {
        return this._compareValue;
    }

    private set compareValue(value: number | null) {
        this.compareObserver.disconnect();
        this._compareValue = value;

        if (value != null) {
            this.compareObserver.observe(this.valueElement, { characterData: true, subtree: true });
            if (this.delta == null) {
                this.delta = new Delta();
                this.element.insertBefore(this.delta.element, this.valueElement.nextSibling);
            }
            this.delta.value = this.value - value;
        }
        else {
            if (this.delta != null) {
                this.delta.element.remove();
                this.delta = null;
            }
        }
    }

    public get value(): number {
        return parseFloat(this.valueString.replace(/[$%<>,]/g, ""));
    }

    public get valueString(): string {
        return this.valueElement.textContent!.trim();
    }

    private onDeltaChanged(_m: MutationRecord[], _o: MutationObserver) {
        if (this.delta != null)
            this.delta.value = this.compareValue == null ? 0 : this.value - this.compareValue;
    }

    public set compareSnapshot(snapshot: FooterUnitSnapshot | null) {
        this.compareValue = snapshot;
    }

    public createSnapshot(): FooterUnitSnapshot {
        return this.value;
    }
}