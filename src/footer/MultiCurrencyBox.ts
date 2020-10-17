import styles from "../main.scss";
import { createLocaleNumberInput, LocaleNumberInput } from "../Utils";

const selector = {
    element: "et-multi-currency-box"
};

export class MultiCurrencyBox {
    public static readonly elementSelector = selector.element;

    private readonly element: Element;
    private readonly onCustomDeltaValueChanged: (value: number | null) => void;
    private readonly customDeltaInputElement: LocaleNumberInput;

    public constructor(element: Element, onCustomDeltaValueChanged: (value: number | null) => void) {
        if (!element.matches(MultiCurrencyBox.elementSelector))
            throw new Error("Element doesn't match a MultiCurrencyBox.");

        this.element = element;
        this.onCustomDeltaValueChanged = onCustomDeltaValueChanged;

        const footer = document.createElement("div");
        footer.classList.add(styles.customDeltaFooter);
        footer.classList.add("currency-title-item");
        footer.onclick = e => e.stopPropagation();
        this.element.appendChild(footer);
        
        const descriptionItem = document.createElement("div");
        descriptionItem.classList.add("currency-item");
        descriptionItem.textContent = "Custom"
        footer.appendChild(descriptionItem);

        const deltaSymbol = document.createElement("i");
        deltaSymbol.className = styles.deltaSymbol;
        descriptionItem.appendChild(deltaSymbol);
        
        const inputItem = document.createElement("div");
        inputItem.classList.add("currency-item");
        footer.appendChild(inputItem);

        this.customDeltaInputElement = createLocaleNumberInput();
        this.customDeltaInputElement.className = styles.customDeltaInput;
        this.customDeltaInputElement.placeholder = "Snapshot Δ in use";
        this.customDeltaInputElement.onchange = () => this.onCustomDeltaValueChanged(this.customDeltaValue);
        inputItem.appendChild(this.customDeltaInputElement);
    }

    public get customDeltaValue() : number | null {
        return this.customDeltaInputElement.localeNumberValue;
    }
    public set customDeltaValue(v : number | null) {
        this.customDeltaInputElement.localeNumberValue = v!;
    }
}