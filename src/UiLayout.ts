import { PortfolioListView } from "./PortfolioListView";
import { SyncEvent } from "ts-events";
import { findTarget } from "./Utils";

export class UiLayout {
    public static readonly selector: string = "ui-layout";
    private static observerOptions: MutationObserverInit = { childList: true, subtree: true };

    private readonly element: Element;
    private readonly observer: MutationObserver;
    private portfolioListView?: PortfolioListView;

    public readonly portfolioListViewAdded = new SyncEvent<PortfolioListView>();
    public readonly portfolioListViewRemoved = new SyncEvent<PortfolioListView>();

    constructor(element: Element) {
        if (!element.matches(UiLayout.selector))
            throw new Error("Element doesn't match a UiLayout.");

        this.element = element;
        this.observer = new MutationObserver((m, o) => this.onMutationObserved(m, o));

        const portfolioElement = element.querySelector(PortfolioListView.selector);
        if (portfolioElement)
            this.portfolioListView = new PortfolioListView(portfolioElement);
        else
            this.observer.observe(this.element, UiLayout.observerOptions)
    }

    private onMutationObserved(mutations: MutationRecord[], observer: MutationObserver) {
        const portfolioMutation = findTarget(mutations, PortfolioListView.selector);
        
        if (portfolioMutation?.added == true) {
            console.assert(!this.portfolioListView);
            this.portfolioListView = new PortfolioListView(portfolioMutation.element);
            this.portfolioListViewAdded.post(this.portfolioListView);
        }
        else if (portfolioMutation?.added == false) {
            console.assert(this.portfolioListView)
            const view = this.portfolioListView;
            this.portfolioListView = undefined;
            this.portfolioListViewRemoved.post(view);
        }
    }
}