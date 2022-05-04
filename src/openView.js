function showTabList() {
    chrome.tabs.create({
        url: chrome.runtime.getURL('tablist/tablist.html'),
        pinned: true
    }, ()=>{});
    return true;
}

function showOptions() {
    chrome.tabs.create({
        url: chrome.runtime.getURL('options/options.html'),
        pinned: true
    }, ()=>{});
    return true;
}

export {
    showTabList,
    showOptions,
};
