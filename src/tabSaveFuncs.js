function saveTabsToLocal(key) {
    /**
     * is this thing EVEN USED?
     * */
    chrome.tabs.query({currentWindow: true}).then(result=>{
        console.log(result);
        chrome.storage.local.set({key: result});
    }); 
}

function loadTabsFromLocal(key, sendResponse) {
    /**
     * is this thing EVEN USED?
     * */
    chrome.storage.local.get(key, (value)=>{
        sendResponse(value);
    });
}


function saveCurrentTabs(sendResponse) {
    const tabs = 'tabs';

    chrome.storage.local.get(tabs, (rcvd)=>{
        chrome.tabs.query({currentWindow: true}).then(result=>{
            (typeof sendResponse === 'function') && sendResponse(result);  // save tabs to storage

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

            // remove all tabs that were just saved
            for (const tab of result) {
                chrome.tabs.remove(tab.id);
            }

            // tell the world the tab has been saved
            chrome.runtime.sendMessage({msg:'tabDataChanged'});

            return result;
        });
    });

    return true;
}


function saveTabMetadata(payload, sendResponse) {
    /**
     * WARNING:
     * this function overrides everything belonging to tabs
     * */
    console.log(["new tabs",payload.tabs]);
    chrome.storage.local.set({tabs: payload.tabs}).then(()=>{
        // tell the world the tab has been saved
        chrome.runtime.sendMessage({msg:'tabDataChanged'});
        chrome.storage.local.get('tabs', (result) => {
            sendResponse(result.tabs);
        });
    });  // save tabs to storage
    return true;
}


function getTabMetadata(sendResponse) {
    chrome.storage.local.get('tabs', (result) => {
        sendResponse(result.tabs);
    });
    return true;
}


function deleteTabData(sendResponse) {
    chrome.storage.local.set({tabs: []});  // save tabs to storage
    chrome.storage.local.get('tabs', (result) => {
        sendResponse(result.tabs);
    });
    return true;
}

function openAndDeleteATab(payload, updateTabLists) {
    const tabs = 'tabs';

    chrome.storage.local.get(tabs, (rcvd)=>{
        chrome.tabs.query({currentWindow: true}).then(result=>{
            // console.log({received: rcvd});
            console.log({payload: payload});

            const tabToOpen = rcvd.tabs[payload.index[0]][payload.index[1]];
            if (tabToOpen.id == payload.tabid){
                console.log({id:tabToOpen.id, title:tabToOpen.title});
                if(payload.doOpen){
                    // chrome.tabs.create({url: tabToOpen.url, active:false, discarded:true}); // cannot open tab as discarded
                    chrome.tabs.create({url: tabToOpen.url, active:false});
                }
                rcvd.tabs[payload.index[0]].splice(payload.index[1],1); // delete that tab we opened
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


export {
    saveTabsToLocal,
    loadTabsFromLocal,
    saveCurrentTabs,
    saveTabMetadata,
    getTabMetadata,
    deleteTabData,
    openAndDeleteATab,
};
