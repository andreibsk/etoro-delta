import { ControlMenu } from "./ControlMenu";

const selector = {
    header: "header.a-header",
    headerInnerWrapper: ".layout-header-inner-wrapper"
}

export class Header {
    public static readonly selector: string = selector.header;

    public readonly element: Element;
    public readonly controlMenu: ControlMenu;

    constructor(element: Element) {
        if (!element.matches(selector.header))
            throw new Error("Element doesn't match a Header.");

        this.controlMenu = new ControlMenu();
        element
            .querySelector(selector.headerInnerWrapper)!
            .prepend(this.controlMenu.menuContainerElement);
    }
}