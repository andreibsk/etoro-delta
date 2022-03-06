import { Delta } from "../Delta";
import styles from "../main.scss";
import { SyncEvent } from "ts-events";
import { filter } from "../Utils";
import { MultiCurrencyBox } from "./MultiCurrencyBox";

const unitPrefix: string = "account-balance";
const eIdAttributeName = "automation-id";

const selector = {
    element: ".footer-unit",
    valueElement: ".footer-unit-value",

    unit: (s: string) => `[${eIdAttributeName}='${unitPrefix}-${s}']`
};

// Value only implies default currency of USD ($)
export type FooterUnitSnapshot = number | {
    value: number,
    currency: string
};

export type FooterUnitOptions = {
    displayDeltaPercent?: boolean,
    displayValuePercent?: boolean,
    compareValueTotal?: number,
    customDeltaEnabled?: boolean,
    onCustomDeltaValueChanged?: (value: number | null) => void
};

export class FooterUnit {
    private readonly element: Element;
    private readonly valueElement: Element;
    private readonly valuePercentElement: Element | null;

    private delta: Delta | null = null;
    private _customDeltaValue: number | null = null;
    private multiCurrencyBox: MultiCurrencyBox | null = null;
    private compareCurrency: string | null = null;
    private _compareValue: number | null = null;
    private _compareValueTotal: number | null = null;
    private readonly displayDeltaPercent: boolean;
    private readonly valueObserver: MutationObserver;
    private readonly currencyBoxObserver: MutationObserver | null = null;

    public readonly valueChanged = new SyncEvent<number>();
    private readonly onCustomDeltaValueChanged?: (value: number | null) => void;

    constructor(parentElement: Element, name: string,
        { displayDeltaPercent = false, displayValuePercent, compareValueTotal, customDeltaEnabled = false, onCustomDeltaValueChanged }: FooterUnitOptions = {}) {

        const element = parentElement.querySelector(selector.element + selector.unit(name));
        const valueElement = element?.querySelector(selector.valueElement);

        if (!element || !valueElement)
            throw new Error("No element found that matches a FooterUnit.");

        this.element = element;
        this.valueElement = valueElement;
        this.displayDeltaPercent = displayDeltaPercent;
        this.valueObserver = new MutationObserver(() => this.onValueMutationObserved());
        this.valueObserver.observe(this.valueElement, { characterData: true, subtree: true });

        if (displayValuePercent) {
            const elem = document.createElement("span");
            elem.className = styles.footerUnitValuePercent;

            this.valueElement.appendChild(elem);
            this.valuePercentElement = elem;

            if (compareValueTotal)
                this.compareValueTotal = compareValueTotal;
        }

        if (customDeltaEnabled && onCustomDeltaValueChanged) {
            this.onCustomDeltaValueChanged = onCustomDeltaValueChanged;
            this.currencyBoxObserver = new MutationObserver(m => this.onCurrencyBoxMutationObserved(m));
            this.currencyBoxObserver.observe(this.element, { childList: true });
        }
    }

    private get compareValue(): number | null {
        return this._compareValue;
    }
    private set compareValue(value: number | null) {
        this._compareValue = value;
        this.updateDeltaValues();
    }

    public get compareValueTotal(): number | null {
        return this._compareValueTotal;
    }
    public set compareValueTotal(value: number | null) {
        this._compareValueTotal = value;
        this.updateDeltaValues();
    }

    public get customCurrency(): string | null {
        const c = this.valueElement.childNodes[0].nodeValue!;
        return c && c[0] != "$" ? c[0] : null;
    }

    public get customDeltaValue(): number | null {
        return this._customDeltaValue;
    }
    public set customDeltaValue(value: number | null) {
        this._customDeltaValue = value;
    }

    public get value(): number {
        return parseFloat(this.valueElement.childNodes[1].nodeValue!.match(/-?[\d,]+\.\d\d/)![0].replace(",", ""));
    }

    public set compareSnapshot(snapshot: FooterUnitSnapshot | null) {
        if (typeof snapshot === "number") {
            this.compareCurrency = null;
            this.compareValue = snapshot;
        }
        else {
            this.compareCurrency = snapshot?.currency ?? null;
            this.compareValue = snapshot?.value ?? null;
        }
    }

    public createSnapshot(): FooterUnitSnapshot {
        return this.customCurrency
            ? {
                value: this.value,
                currency: this.customCurrency
            }
            : this.value;
    }

    private onCurrencyBoxMutationObserved(mutations: MutationRecord[]) {
        for (const mutation of filter(mutations, MultiCurrencyBox.elementSelector)) {
            if (mutation.added == true) {
                console.assert(!this.multiCurrencyBox, "MultiCurrencyBox added but already registered.");

                this.multiCurrencyBox = new MultiCurrencyBox(mutation.element, value => {
                    this._customDeltaValue = value;
                    this.updateDeltaValues();
                    this.onCustomDeltaValueChanged!(value);
                });
                this.multiCurrencyBox.customDeltaValue = this._customDeltaValue;
                console.debug("MultiCurrencyBox added.");
            }
            else if (mutation.added == false) {
                console.assert(this.multiCurrencyBox, "MultiCurrencyBox removed but not registered.");

                this.multiCurrencyBox = null;
                console.debug("MultiCurrencyBox removed.");
            }
        }
    }

    private onValueMutationObserved() {
        this.updateDeltaValues();
        this.valueChanged.post(this.value);
    }

    private updateDeltaValues() {
        if ((this.compareValue != null || this._customDeltaValue != null)
            && (this.customCurrency ?? "$") === (this.compareCurrency ?? "$")) {

            if (this.delta == null) {
                this.delta = new Delta();
                this.element.insertBefore(this.delta.element, this.valueElement.nextSibling);
            }

            const compareValue = this._customDeltaValue == null ? this.compareValue : this._customDeltaValue;
            const compareValueTotal = this._customDeltaValue == null ? this.compareValueTotal : this._customDeltaValue;

            const deltaValue = compareValue == null ? 0 : this.value - compareValue;
            this.delta.value = deltaValue;

            if (this.displayDeltaPercent && compareValue)
                this.delta.percentValue = compareValueTotal
                    ? deltaValue * 100 / compareValueTotal
                    : (this.value - compareValue) * 100 / compareValue;

            if (this.valuePercentElement && compareValueTotal) {
                const valuePercent = this.value * 100 / compareValueTotal;
                this.valuePercentElement.textContent = valuePercent ? ` (${valuePercent.toFixed(2)}%)` : "";
            }
        }
        else {
            if (this.delta != null) {
                this.delta.element.remove();
                this.delta = null;
            }
        }
    }
}