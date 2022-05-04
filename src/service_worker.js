import {
    readConfigData,
    saveConfigData,
    reloadConfigs,
} from './configFunc';

import {
    saveTabsToLocal,
    loadTabsFromLocal,
    saveCurrentTabs,
    saveTabMetadata,
    getTabMetadata,
    deleteTabData,
    openAndDeleteATab,
} from './tabSaveFuncs'

import {
    toggleAction,
    getActionState,
    enablePopup,
    disablePopup,
} from './actionButtonFunc'

import {
    showTabList,
    showOptions,
} from './openView'

// begin initialization ////////////////////////////////////////
((initialization)=>{
    console.log('starting_serviceWorker')
})("");


//// add context Menus
try{
    chrome.contextMenus.create({
        id: "showTabList",
        title: "Show Tab List",
        contexts: ["action"],
    });
    chrome.contextMenus.create({
        id: "showOptions",
        title: "Show Options",
        contexts: ["action"],
    });
    chrome.contextMenus.create({
        id: "storeTabsOnCurrentWindow",
        title: "Store Tabs on Current Window",
        contexts: ["action"],
    });
    chrome.contextMenus.create({
        id: "enablePopup",
        title: "enablePopup",
        contexts: ["action"],
    });
}catch(e){
    console.log("some error")
    console.log(e)
}


//// read settings
reloadConfigs();


//// assign callback functions

////// contextMenus
chrome.contextMenus.onClicked.addListener((args)=>{
    switch (args.menuItemId) {
        case 'showTabList':
            showTabList();
            break;
        case 'enablePopup':
            enablePopup();
            break;
        case 'showOptions':
            showOptions();
            break;
        case 'storeTabsOnCurrentWindow': 
            saveCurrentTabs(resp=>{});
            break;
        default:
            console.log('menuItemID ' + args.menuItemID + 'is undefined')
            console.assert(args.menuItemID == 'Any of the defined MenuItemID');
    }
})

////// Messages Handler
chrome.runtime.onMessage.addListener(function (msgMap, sender, sendResponse) {
    switch (msgMap.msg){
        case 'showTabList': return showTabList();
        case 'showOptions': return showOptions();
        case 'reloadConfigs': return reloadConfigs();
    }

    console.assert(typeof sendResponse === 'function')
    console.log({log:"sendResponce received", msg:msgMap, type: typeof sendResponse})

    switch (msgMap.msg){
        case 'toggleAction':      return toggleAction(sendResponse);
        case 'getActionState':    return getActionState(sendResponse);

        case 'saveCurrentTabs':   return saveCurrentTabs(sendResponse);
        case 'getTabMetadata':    return getTabMetadata(sendResponse);
        case 'saveTabMetadata':   return saveTabMetadata(msgMap.payload, sendResponse); // overrides previous data
        case 'deleteData':        return deleteTabData(sendResponse);
        case 'openAndDeleteATab': return openAndDeleteATab(msgMap.payload, sendResponse);

        case 'readConfigData': return readConfigData(sendResponse); // config comes back as first argument
        case 'saveConfigData': return saveConfigData(msgMap.payload, sendResponse); // overrides previous data //payload should be dictionary of config

        default:
            console.log('msg: ' + msgMap.msg + ', is undefined')
            console.assert(msgMap.msg == 'anyOfTheDefinedMessage');
    }
    // we do not want code to reach here
    return false;
});
// END Initialization ////////////////////////////////////////









