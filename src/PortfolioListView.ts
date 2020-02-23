export class PortfolioListView {
    element: Element;
    // observer: MutationObserver;

    public static get selector(): string {
        return "portfolio-list-view";
    }

    constructor(element: Element) {
        if (!element.matches(PortfolioListView.selector))
            throw new Error("Element doesn't match a PortfolioListView.");

        this.element = element;
        // this.observer = new MutationObserver(this.onMutationObserved);
    }
}