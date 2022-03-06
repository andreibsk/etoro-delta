import browser from "webextension-polyfill";

const manifest = browser.runtime.getManifest();
console.info(manifest.name + " v" + manifest.version + " background script started.");

(async () => {
    const extensionInfo = await browser.management.getSelf();
    if (extensionInfo.installType != "development")
        return;

    console.info("Extension is running in development mode.");

    browser.runtime.onMessage.addListener(async (request, sender) => {
        switch (request.type) {
            case "extension_info_request":
                browser.tabs.sendMessage(sender.tab?.id!, { type: "extension_info", extensionInfo });
                break;
            case "reload_request":
                browser.runtime.reload();
                browser.tabs.reload(sender.tab?.id);
                break;
        }
    });
})();
