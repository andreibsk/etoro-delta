import { PortfolioHeaderCustomItem } from "./PortfolioHeaderCustomItem";

export class PortfolioHeader {
    public static readonly elementSelector: string = ".p-portfolio-header";
    public static readonly innerHeaderButtonsSelector: string = ".inner-header-buttons";

    public readonly customHeaderItem: PortfolioHeaderCustomItem;
    private readonly innerHeaderButtonsElement: Element;

    constructor(element: Element) {
        if (!element.matches(PortfolioHeader.elementSelector))
            throw new Error("Element doesn't match a PortfolioHeader.");
        
        this.innerHeaderButtonsElement = element.querySelector(PortfolioHeader.innerHeaderButtonsSelector)!;

        this.customHeaderItem = new PortfolioHeaderCustomItem();
        this.innerHeaderButtonsElement.prepend(this.customHeaderItem.element);
    }
}