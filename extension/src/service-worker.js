chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "praxis-selection", title: "Save selection to Praxis", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "praxis-page", title: "Save page to Praxis", contexts: ["page"] });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  await chrome.storage.session.set({
    pendingCapture: {
      content: info.selectionText || "",
      title: tab?.title || "",
      url: info.pageUrl || tab?.url || ""
    }
  });
  await chrome.action.openPopup();
});
