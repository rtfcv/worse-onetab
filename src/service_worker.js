try{
    chrome.contextMenus.create({
        id: "showPopUp",
        title: "showPopUp",
        contexts: ["action"],
    });
    chrome.contextMenus.create({
        id: "toggleAction",
        title: "toggleAction",
        contexts: ["action"],
    });
    chrome.contextMenus.create({
        id: "showOptions",
        title: "showOptions",
        contexts: ["action"],
    });
}catch(e){
    console.log("some error")
    console.log(e)
}


chrome.contextMenus.onClicked.addListener((args)=>{
    if(args.menuItemId == 'showPopUp') {
        console.log("showPopUp");
    };
    if(args.menuItemId == 'toggleAction') {
        enablePopup();
    };
})


chrome.action.onClicked.addListener(handleBrowserActionClicked) // only works for Mv3

function handleBrowserActionClicked(tab) {
    showTabList();
}


function handleWindowCreated(window) {
    console.log('done');
}


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg == 'showTabList') {return showTabList();};
    if (msg == 'toggleAction') {return toggleAction(sendResponse);};
    if (msg == 'getActionState') {return getActionState(sendResponse);};
    if (msg == 'getActionState') {return getActionState(sendResponse);};
    if (msg == 'saveCurrentTabs') {return saveCurrentTabs(sendResponse);};
    if (msg == 'getTabMetadata') {return getTabMetadata(sendResponse);}
});


function showTabList() {
    const opts = {
        url: chrome.runtime.getURL('tablist/tablist.html')
    };
    chrome.windows.create(opts, handleWindowCreated);
    return true;
}


function toggleAction(sendResponse) {
    // this returns Promise
    state = chrome.action.getPopup({});

    // register callback for the Promise
    state.then((result)=>{
        console.log("state of popup was: "+result);

        if (result == ""){
            console.log("which will be enabled");
            chrome.action.setPopup({popup: "popup/popup.html"});
            sendResponse('disable');
        } else {
            console.log("which will be disabled");
            chrome.action.setPopup({popup: ""});
            sendResponse('enable');
        };
    });

    // return true anyway to avoid error
    return true;
}


function getActionState(sendResponse){
    state = chrome.action.getPopup({});
    state.then((result)=>{
        console.log('state of popup is: '+result);
        if (state == ''){
            sendResponse('enable');
        } else {
            sendResponse('disable');
        };
    });

    // return true anyway to avoid error
    return true;
}


function enablePopup() {
    state = chrome.action.getPopup({});
    state.then((result)=>{
        console.log("enabling popup, previously: " + result);
    });

    chrome.action.setPopup({popup: "popup/popup.html"});
}


const saveTabsToLocal = (key) => {
    chrome.tabs.query({currentWindow: true}).then(result=>{
        console.log(result);
        chrome.storage.local.set({key: result});
    }); 
}

const loadTabsFromLocal = (key, sendResponse) => {
    chrome.storage.local.get(key, (value)=>{
        sendResponse(value);
    });
}

const saveCurrentTabs = (sendResponse) => {
    chrome.tabs.query({currentWindow: true}).then(result=>{
        sendResponse(result);
        chrome.storage.local.set({'tabs': result});
        console.log("saved tabs:")
        console.log(result)
    }); 
    return true;
}

const getTabMetadata = (sendResponse) => {
    chrome.storage.local.get('tabs', (result) => {
        console.log('got: ')
        console.log(result)
        sendResponse(result.tabs);
    });
    return true;
}