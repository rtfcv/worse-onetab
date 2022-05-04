import {readConfigData, saveConfigData} from './configFunc';

import {
    saveTabsToLocal,
    loadTabsFromLocal,
    saveCurrentTabs,
    saveTabMetadata,
    getTabMetadata,
    deleteTabData,
    openAndDeleteATab,
} from './tabSaveFuncs'

// begin initialization ////////////////////////////////////////
((initialization)=>{
    console.log('starting_serviceWorker')
})("");

//// add context Menus
try{
    chrome.contextMenus.create({
        id: "showTabList",
        title: "showTabList",
        contexts: ["action"],
    });
    chrome.contextMenus.create({
        id: "enablePopup",
        title: "enablePopup",
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


//// read settings
readConfigData((config)=>{
    console.log(config);

    ////// actionButton
    if (config.actionButton == 'tabList'){
        chrome.action.onClicked.addListener((tab)=>{showTabList();}) // only works for Mv3
        disablePopup();
    }
});


//// assign callback functions
////// contextMenus
chrome.contextMenus.onClicked.addListener((args)=>{
    if(args.menuItemId == 'showTabList') {
        showTabList();
    };
    if(args.menuItemId == 'enablePopup') {
        enablePopup();
    };
    if(args.menuItemId == 'showOptions') {
        showOptions();
    };
})


////// Messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.msg == 'showTabList') {return showTabList();};
    if (msg.msg == 'showOptions') {return showOptions();};

    console.log({log:"sendResponce received", msg:msg, type: typeof sendResponse})
    console.assert(typeof sendResponse === 'function')
    if (msg.msg == 'toggleAction') {return toggleAction(sendResponse);};
    if (msg.msg == 'getActionState') {return getActionState(sendResponse);};
    if (msg.msg == 'saveCurrentTabs') {return saveCurrentTabs(sendResponse);};
    if (msg.msg == 'getTabMetadata') {return getTabMetadata(sendResponse);}
    if (msg.msg == 'saveTabMetadata') {return saveTabMetadata(msg.payload, sendResponse);} // overrides previous data
    if (msg.msg == 'deleteData') {return deleteTabData(sendResponse);}
    if (msg.msg == 'openAndDeleteATab') {return openAndDeleteATab(msg.payload, sendResponse);}
    if (msg.msg == 'deleteATab') {return deleteATab(msg.payload, sendResponse);}

    // config comes back as first argument
    if (msg.msg == 'readConfigData') {return readConfigData(sendResponse);}
    //payload should be dictionary of config
    if (msg.msg == 'saveConfigData') {return saveConfigData(msg.payload, sendResponse);} // overrides previous data
});
// END Initialization ////////////////////////////////////////




// Function DEFINITIONS
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


function toggleAction(sendResponse) {
    // this returns Promise
    const state = chrome.action.getPopup({});

    // register callback for the Promise
    state.then((result)=>{
        console.log("state of popup was: "+result);

        if (result == ""){
            console.log("which will be enabled");
            chrome.action.setPopup({popup: "popup/popup.html"});
            sendResponse('Disable Popup');
        } else {
            console.log("which will be disabled");
            chrome.action.setPopup({popup: ""});
            sendResponse('Enable Popup');
        };
    });

    // return true anyway to avoid error
    return true;
}


function getActionState(sendResponse){
    const state = chrome.action.getPopup({}); // this comes undefined on Edge sometimes...
    state.then((result)=>{
        console.log('state of popup is: '+result);
        if (state == ''){
            sendResponse('Enable Popup');
        } else {
            sendResponse('Disable Popup');
        };
    });

    // return true anyway to avoid error
    return true;
}


function enablePopup() {
    const state = chrome.action.getPopup({});
    state.then((result)=>{
        console.log("enabling popup, previously: " + result);
    });

    chrome.action.setPopup({popup: "popup/popup.html"});
}

function disablePopup() {
    const state = chrome.action.getPopup({});
    state.then((result)=>{
        console.log("disabling popup, previously: " + result);
    });

    chrome.action.setPopup({popup: ""});
}



