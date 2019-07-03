var initPopup = function(tab) {
    if (!tab){
        return;
    }
    if (tab.id) {
        cp.setTabStatus(tab);
    } else {
        chrome.tabs.get(tab.tabId, function(tab){
            cp.setTabStatus(tab);
        });
    }
};

chrome.tabs.onActivated.addListener(initPopup);
chrome.tabs.onCreated.addListener(initPopup);
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        initPopup(tab);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender) {
    var tab = sender && sender.tab;
    if (!tab) {
        return;
    }
    if (request.action === "requestReport"){
        cp.requestReport(tab, request.html);
    } else if (request.action === "pageUnload") {
        cp.disableIcon(tab);
    }

});

