import {
    // toggleAction,
    // getActionState,
    enablePopup,
    disablePopup,
} from './actionButtonFunc'

import {
    showTabList,
    // showOptions,
} from './openView'


import {
    saveCurrentTabs,
} from './tabSaveFuncs'

function sanitizeConfigMap(input) {
    if (typeof input === 'undefined'){
        input = {};
    }
    const tCheck = (targetVariable, defaultValue)=>{
        return (typeof targetVariable === typeof defaultValue) ? targetVariable : defaultValue;
    };

    var config = {};

    /** theme: str
     * accepts: dark, light, business, luxury, black, ... and much more
     */
    config.theme = tCheck(input.theme, 'dark');

    /** editMode: string
     * accepts: 'default', 'vim'
     * has no effect right now
     */
    config.editMode = tCheck(input.editMode, 'default');

    /** theme: string
     * accepts: "popUp", "tabList", "storeTabsOnCurrentWindow"
     */
    config.actionButton = tCheck(input.actionButton, 'popUp');

    /** restoreTabsDiscarded: boolean
     * accepts: true, false
     * has no effect right now
     */
    config.restoreTabsDiscarded = tCheck(input.restoreTabsDiscarded, true);

    /**
     * UPCOMING:
     * store pinned,
     * store edited? what was the right term for this
     * store playing media
     */

    return config;
}

function readConfigData(callbackFunc) {
    chrome.storage.local.get('config', (result) => {
        // DO FORMAT CHECK HERE
        console.log('Reading Config', result);
        const cleanConfig = sanitizeConfigMap(result.config);
        console.log(cleanConfig);
        callbackFunc(sanitizeConfigMap(result.config));
    });
    return true;
}

function saveConfigData(config, callbackFunc) {
    /**
     * WARNING:
     * this function overrides everything belonging to config
     * */
    // DO FORMAT CHECK HERE
    const cfgData = (sanitizeConfigMap(config));

    // save config to storage
    chrome.storage.local.set({config: cfgData}).then(()=>{
        // chrome.runtime.sendMessage({msg:'cfgUpdated'});  // use reloadConfigs from outside instead
        chrome.storage.local.get('config', (config) => {
            callbackFunc(config);
        });
    });
    return true;
}

function reloadConfigs() {
    readConfigData((config)=>{
        const currentConfigIs=config;
        console.log(currentConfigIs);
        console.log({chrome_action_onClicked: chrome.action.onClicked});

        // actionButton
        switch (config.actionButton){
            case 'tabList':
                /** config.actionButton == 'tabList'
                 * clicking action button shows Tablist
                 */
                disablePopup();

                // remove Previous
                try{chrome.action.onClicked.removeListener(showTabList);}catch(e){console.log(e);};
                try{chrome.action.onClicked.removeListener(saveCurrentTabs);}catch(e){console.log(e);};

                chrome.action.onClicked.addListener(showTabList);
                
                break;
            case 'storeTabsOnCurrentWindow':
                /** config.actionButton == 'storeTabsOnCurrentWindow'
                 * Save and close all tabs on current Window
                 */
                disablePopup();

                // remove Previous
                try{chrome.action.onClicked.removeListener(showTabList);}catch(e){console.log(e);};
                try{chrome.action.onClicked.removeListener(saveCurrentTabs);}catch(e){console.log(e);};

                chrome.action.onClicked.addListener(saveCurrentTabs);
                break;
            default:
                enablePopup();
        }
    });
    return true;
}

export {readConfigData, saveConfigData, sanitizeConfigMap, reloadConfigs};
