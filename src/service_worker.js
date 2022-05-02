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
    if (msg.msg == 'showTabList') {return showTabList();};
    if (msg.msg == 'toggleAction') {return toggleAction(sendResponse);};
    if (msg.msg == 'getActionState') {return getActionState(sendResponse);};
    if (msg.msg == 'getActionState') {return getActionState(sendResponse);};
    if (msg.msg == 'saveCurrentTabs') {return saveCurrentTabs(sendResponse);};
    if (msg.msg == 'getTabMetadata') {return getTabMetadata(sendResponse);}
    if (msg.msg == 'deleteData') {return deleteData(sendResponse);}
    if (msg.msg == 'openAndDeleteATab') {return openAndDeleteATab(msg.payload, sendResponse);}
    if (msg.msg == 'deleteATab') {return deleteATab(msg.payload, sendResponse);}
});


function showTabList() {
    const opts = {
        url: chrome.runtime.getURL('tablist/tablist.html')
    };
    //chrome.windows.create(opts, handleWindowCreated);
    chrome.tabs.create(opts, handleWindowCreated);
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


    try{
    }catch(e){
        console.log("some error of this sort: ")
        console.log(e)
    }


const saveCurrentTabs = (sendResponse) => {
    const tabs = 'tabs';

    chrome.storage.local.get(tabs, (rcvd)=>{
        chrome.tabs.query({currentWindow: true}).then(result=>{
            sendResponse(result);  // save tabs to storage

            try{
                rcvd.tabs.push(result);
            }catch(e){
                console.log('some error of this sort: ');
                console.log(e);
                rcvd.tabs = [];
                rcvd.tabs.push(result);
            }
            console.log({received: rcvd});

            chrome.storage.local.set({tabs: rcvd.tabs});  // save tabs to storage
            return result;
        }).then(result=>{
            console.log("newly saved tabs:");
            console.log(result);

            // remove all tabs that were previously saved
            for (tab of result) {
                chrome.tabs.remove(tab.id);
            }

            return result;
        });
    });

    return true;
}

const getTabMetadata = (sendResponse) => {
    chrome.storage.local.get('tabs', (result) => {
        sendResponse(result.tabs);
    });
    return true;
}


const deleteData = (sendResponse) => {
    chrome.storage.local.set({tabs: []});  // save tabs to storage
    chrome.storage.local.get('tabs', (result) => {
        sendResponse(result.tabs);
    });
    return true;
}

const openAndDeleteATab = (payload, updateTabLists) => {
    const tabs = 'tabs';

    chrome.storage.local.get(tabs, (rcvd)=>{
        chrome.tabs.query({currentWindow: true}).then(result=>{
            // console.log({received: rcvd});
            console.log({payload: payload});

            tabToOpen = rcvd.tabs[payload.index[0]][payload.index[1]];
            if (tabToOpen.id == payload.tabid){
                console.log({id:tabToOpen.id, title:tabToOpen.title});
                if(payload.doOpen){
                    // chrome.tabs.create({url: tabToOpen.url, active:false, discarded:true}); // cannot open tab as discarded
                    chrome.tabs.create({url: tabToOpen.url, active:false});
                }
                tabToOpen = rcvd.tabs[payload.index[0]].splice(payload.index[1],1)
                if (rcvd.tabs[payload.index[0]].length == 0){rcvd.tabs.splice(payload.index[0],1)}
            }else{
                console.log('mismatch')
                console.log({idToOpen:payload.tabid, idFromSavedData:tabToOpen.id , title:tabToOpen.title});
            }

            return rcvd.tabs;
        }).then(tabs=>{
            return chrome.storage.local.set({tabs: tabs});  // save tabs to storage
        }).then(result=>{updateTabLists();}); // call the updater to update the state of the caller
    });

    return true;
}
