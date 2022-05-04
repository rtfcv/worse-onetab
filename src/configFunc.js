function sanitizeConfigMap(input) {
    const tCheck = (targetVariable, type, defaultValue)=>{
        return (typeof targetVariable === type) ? targetVariable : defaultValue;
    };

    var config = {};
    config.theme = tCheck(input.theme, 'string', 'dark');
    config.editMode = tCheck(input.editMode, 'string', 'vim');
    config.actionButton = tCheck(input.actionButton, 'string', 'popUp');

    return config;
}

function readConfigData(callbackFunc) {
    chrome.storage.local.get('config', (result) => {
        // DO FORMAT CHECK HERE
        callbackFunc(sanitizeConfigMap(result.config));
    });
    return true;
}

function saveConfigData(config, callbackFunc) {
    /**
     * WARNING:
     * this function overrides everything belonging to config
     * */
    chrome.storage.local.set({config: config});  // save tabs to storage
    chrome.storage.local.get('config', (config) => {
        callbackFunc(config);
    });

    return true;
}

export {readConfigData, saveConfigData, sanitizeConfigMap};
