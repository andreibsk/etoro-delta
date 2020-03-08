import { ControlMenu } from "./ControlMenu";

const selector = {
    header: "header.a-header",
    toolbox: ".a-head-toolbox"
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
            .querySelector(selector.toolbox)!
            .prepend(this.controlMenu.buttonElement);
    }
}