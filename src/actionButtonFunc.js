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
    const state = chrome.action.getPopup({});
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

export {
    toggleAction,
    getActionState,
    enablePopup,
    disablePopup,
};
