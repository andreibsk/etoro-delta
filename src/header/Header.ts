import { filter } from "../Utils";
import { ControlMenu } from "./ControlMenu";

const selector = {
    header: ".header",
    headerInnerWrapper: ".layout-wrapper"
}

export class Header {
    public static readonly selector: string = selector.header;
    private static observerOptions: MutationObserverInit = { childList: true, subtree: true };

    public readonly element: Element;
    public readonly controlMenu: ControlMenu;
    private readonly observer: MutationObserver | null;

    constructor(element: Element) {
        if (!element.matches(selector.header))
            throw new Error("Element doesn't match a Header.");

        this.element = element;
        this.controlMenu = new ControlMenu();
        const innerWrapper = this.element.querySelector(selector.headerInnerWrapper);

        if (innerWrapper) {
            innerWrapper.prepend(this.controlMenu.menuContainerElement);
            this.observer = null;
        }
        else {
            this.observer = new MutationObserver(m => this.onMutationObserved(m));
            this.observer.observe(this.element, Header.observerOptions);
        }
    }

    private onMutationObserved(mutations: MutationRecord[]) {
        for (const mutation of filter(mutations, selector.headerInnerWrapper)) {
            const innerWrapper = mutation.element;

            if (mutation.added == true) {
                innerWrapper.prepend(this.controlMenu.menuContainerElement);
            }
            else if (mutation.added == false) {
                throw new Error("inner Wrapper removed");
            }
        }
    }
}