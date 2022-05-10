import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef } from "react";
// import styles from '../style.css';

import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json'
import { vim /*, Vim*/ } from "@replit/codemirror-vim";

let editorPlugin = [json()]

function OptionsEditor(props) {
    /**
     * View for Exporting and Importing tabs
     */
    // const [done, setDone] = useState(false);
    const [initialValue, setInitialValue] = useState("");
    const text = useRef("");
    const cmRef = useRef(); // don't have too much use now


    useEffect(() => {
        let cleanList = [];

        // read config and set it as initial value
        const doReset = ()=>{
            console.log('resetting editor to saved config');
            setInitialValue( '' );

            chrome.runtime.sendMessage({msg:'readConfigData'}, (config)=>{
                setInitialValue( JSON.stringify(config, null, 2) );
                console.log(config);
            });
        }
        // execute above once
        doReset();

        // function for submitting edit
        const thisDoneFunc = ()=>{
            try{
                const configData = JSON.parse(text.current); // this is where things are likely to fail

                chrome.runtime.sendMessage({msg:'saveConfigData', payload:configData}, (result)=>{
                    console.log("savedConfig: " + JSON.stringify(result));
                    chrome.runtime.sendMessage({msg:'reloadConfigs'}, (_)=>{});
                    // I cannot listen to message sent by myself(this page)
                    props.updateConfig();
                });

            }catch(e){
                window.alert(e);
            };
        }

        // function for resetting text area
        const resetFunc = ()=>{
            if(window.confirm("revert every change?")){doReset();}
        }

        const exportConfig = ()=>{
          chrome.runtime.sendMessage({msg:'readConfigData'}, (result)=>{
            const json = JSON.stringify(result, null, 2);
            const blob = new Blob([json], {type: "octet/stream"});
            const url = window.URL.createObjectURL(blob) ;

            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.style='display:none';
            anchor.download = 'worseOneTabConfig.json';
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
          });
        }

        const doneButton = document.getElementById('configJsonDone');
        cleanList.push(()=>{doneButton.removeEventListener('click', thisDoneFunc)});
        doneButton.addEventListener('click', thisDoneFunc);

        const cancelButton = document.getElementById('configJsonCancel');
        cleanList.push(()=>{cancelButton.removeEventListener('click', resetFunc)});
        cancelButton.addEventListener('click', resetFunc);

        const exportButton = document.getElementById('configJsonDownload');
        cleanList.push(()=>{exportButton.removeEventListener('click', exportConfig)});
        exportButton.addEventListener('click', exportConfig);


        return ()=>{for (const f of cleanList){f();}};
    }, [props]);

    return (
      <div id="config-editor-root">
          <div className={"pt-6"}/>
          <div className={"prose text-center max-w-full"}>
            <h1 className={"w-full"}>Options</h1>
          </div>
          <div className="divider"/>
          <div className="flex place-content-center h-2/3">
              <CodeMirror
                ref={cmRef}
                autoFocus={true}
                className={"flex justify-center content-center w-full h-full"}
                value={initialValue}
                height="100%"
                width="90%"
                theme="dark"
                extensions={editorPlugin}
                options={{keyMap:"vim"/*Doesn't work. why*/}}
                onChange={(value, viewUpdate) => {
                    text.current = value;
                    console.log({val:value});
                }}
              />
          </div>
          <div className="divider"/>
          <div className="flex place-content-center gap-2">
              <button className="btn btn-sm" id="configJsonDone">done</button>
              <button className="btn btn-sm" id="configJsonCancel">cancel</button>
              <button className="btn btn-sm" id="configJsonDownload">export</button>
          </div>
      </div>
    );
}





class Options extends React.Component {
    constructor(props){
        super(props);
        this.state = {tabData : ""};

        // apply config here
        this.updateConfig = ()=>{chrome.runtime.sendMessage({msg:'readConfigData'}, (config)=>{
            console.log(config);
            document.documentElement.setAttribute("data-theme", config.theme); // can set theme here
            document.documentElement.setAttribute('config', JSON.stringify(config));
        });}
        this.updateConfig();


        // below cannot listen to myself(this page)
        chrome.runtime.onMessage.addListener(function(m, s, sR){
            if(m.msg === 'reloadConfigs'){
                console.log('tablist: messg_rcvd: \n'+JSON.stringify([m, s, sR],null,2));
                this.updateConfig(); //Error in event handler: TypeError: this.updateConfig is not a function ... why

                sR();
                /**
                 * ^^ to avoid bug
                 * see https://bugs.chromium.org/p/chromium/issues/detail?id=1304272
                 */
            };
        });
    }
    componentDidMount(){
        document.title = "OneTab - Options";
    }

  render() {
    return (
      <div className="OptionsEditor">
        <OptionsEditor updateConfig={this.updateConfig} />
      </div>
    );
  }
}




chrome.runtime.sendMessage({msg:'readConfigData'}, (config)=>{
  // set theme first and foremost
  document.documentElement.setAttribute("data-theme", config.theme); 

  if (config.editMode === 'vim'){
    editorPlugin.push(vim());
  }

  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(
    <div className="p-6">
      <Options />
    </div>
  );
});
