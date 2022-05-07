import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef } from "react";
// import styles from '../style.css';

import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json'
import { vim/*, Vim*/ } from "@replit/codemirror-vim";

let editorPlugin = [json()]

// import * as t from '../tabs';
// import styled from 'styled-components';
function deleteData() {
  if(window.confirm('Do you want to delete all data?')){
    console.log('dataDelete');
    chrome.runtime.sendMessage({msg:'deleteData'}, (status)=>{console.log({log:'deleted', stat:status});});
  };
}


function IExportTabs (props) {
  /**
   * View for Exporting and Importing tabs
   */
  const isVisible = props.isVisible;
  // const [done, setDone] = useState(false);
  const [initialValue, setInitialValue] = useState("");
  const text = useRef("");
  const cmRef = useRef(); // don't have too much use now


  useEffect(() => {
    let cleanList = [];
    if (isVisible){
      const thisDoneFunc = ()=>{
        try{
          console.log({edit: text.current, same:(text.current==cmRef.current.value), cmRef: cmRef.current.value});
          const tabData = JSON.parse(text.current);
          return props.doneFunc(tabData);
        }catch(e){
          window.alert(e);
        };
      }

      const tjd = document.getElementById('tabJsonDone');
      cleanList.push(()=>{tjd.removeEventListener('click', thisDoneFunc)});
      tjd.addEventListener('click', thisDoneFunc);

      const tjc = document.getElementById('tabJsonCancel');
      cleanList.push(()=>{tjc.removeEventListener('click', props.hideMe)});
      tjc.addEventListener('click', props.hideMe);

      setInitialValue(props.tabData);
    };
    return ()=>{for (const f of cleanList){f();}};
  }, [props]);

  if (isVisible){return (
    <div>
      <div className="divider"/>
      <div className="flex justify-center h-2/3">

        <CodeMirror
          ref={cmRef}
          autoFocus={true}
          className={"flex place-content-center w-full"}
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
      <div className="flex place-content-center pt-6 gap-2">
        <button className="btn btn-sm" id="tabJsonDone">done</button>
        <button className="btn btn-sm" id="tabJsonCancel">cancel</button>
      </div>
      <br/>
    </div>
  );};

  // if not visible
  return (<span></span>);
}


function TablistList (props) {
  const [tabList, setTabList] = useState([]);
  const [dummy, setDummy] = useState(0);

  const updateTabList = () => {
    chrome.runtime.sendMessage({msg:'getTabMetadata'},
      (result)=>{
        try{
          // let tlLen = result.length;
          console.assert(result !== null);
          console.log("tablist is ",result);
          setTabList(result);
          setDummy(dummy+1);
        }catch(e){
          console.log({some_error: e})
          setTabList([]);
          setDummy(dummy+1);
        }
      }
    );
  };

  useEffect(() => {
    updateTabList();
  }, [props.tabListGen]); // need the second component to be empty to do this only when this first renders

  useEffect(() => {
    // list of cleanupFunctions
    let cleanList = [];

    // top element of tablist
    const tabListList = document.getElementById('tablistlist-ul')
    const cTabListList = tabListList.children

    // loop through list of tablist
    for (const c of cTabListList){
      const cTabList = c.children // should yield tablist li
      const cc = cTabList[1]; // get tabList ul from tablist li
      const cTab = cc.children

      let tabIdxsToDealList = [];
      let tabIdsToDealList = [];

      // subscribe closing and opening individual tabs here
      //// loop through element of tablist li
      for (const ccc of cTab) {
        const cTabTbody = ccc.children[0].children[0];
        const cTabTr = cTabTbody.children[0];
        const cTabElement = cTabTr.children; // should be [x button, tabData] (td, td)

        const closeButton = cTabElement[0].children[0];
        const tabButton  = cTabElement[1];

        // ccc is the li containing table of tab data and button
        const index = ccc.getAttribute('ijloc').split(','); // string 'i,j'
        const tabid = ccc.getAttribute('tabid');

        tabIdsToDealList.push(tabid);
        tabIdxsToDealList.push(index);

        // callback function for a list element
        const openThisTab = ()=>{
          // // ccc is the li containing table of tab data and button
          // const index = ccc.getAttribute('ijloc').split(','); // string 'i,j'
          // const tabid = ccc.getAttribute('tabid');

          // log what has been clicked
          console.log({clicked: ccc, id: ccc.id, index: index, tabid: tabid, doOpen: true});

          // open page url: request service worker to open and pop the item from the list
          // need to pass updateTabList to update
          chrome.runtime.sendMessage(
            {
                msg:'openAndDeleteATab',
                payload:{
                    index: index,
                    tabid: tabid,
                    doOpen: true,
                    restoreTabsDiscarded: props.restoreTabsDiscarded,
                }
            }, updateTabList);
        };

        // callback function closing list element
        const deleteThisTab = ()=>{
          const index = ccc.getAttribute('ijloc').split(','); // string 'i,j'
          const tabid = ccc.getAttribute('tabid');
          // log what has been clicked
          console.log({closing: ccc, id: ccc.id, index: index, tabid: tabid, doOpen: false});
          // need to pass updateTabList to update
          chrome.runtime.sendMessage({msg:'openAndDeleteATab', payload:{index: index, tabid: tabid, doOpen: false}}, updateTabList);
        };

        // add event listener function and clean list for removing this later
        cleanList.push(()=>{tabButton.removeEventListener('click', openThisTab)});
        cleanList.push(()=>{closeButton.removeEventListener('click', deleteThisTab)});
        tabButton.addEventListener('click', openThisTab, {once: true});
        closeButton.addEventListener('click', deleteThisTab, {once: true});

      }

      // subscribe closing and opening tab groups here
      // callback for buttons manupilating tablist
      const deleteTabGroup = ()=>{
        const tablistkey = c.getAttribute('tablistkey');
        chrome.runtime.sendMessage({
          msg:'openAndDeleteTabs',
          payload:{
            tablistkey: tablistkey,
            indexList: tabIdxsToDealList,
            idList: tabIdsToDealList,
            doOpen: false
          }}, updateTabList);
      };

      const openTabGroup = ()=>{
        const tablistkey = c.getAttribute('tablistkey');
        chrome.runtime.sendMessage({
          msg:'openAndDeleteTabs',
          payload:{
            tablistkey: tablistkey,
            indexList: tabIdxsToDealList,
            idList: tabIdsToDealList,
            doOpen: true,
            restoreTabsDiscarded: props.restoreTabsDiscarded,
          }}, updateTabList);
      };

      const cDiv = cTabList[0] // children of div
      const BtnGrp = cDiv.children[1].children;
      const cTabListBtn = BtnGrp[0];
      const oTabListBtn = BtnGrp[1];

      // add event listener function and clean list for removing this later
      cleanList.push(()=>{cTabListBtn.removeEventListener('click', deleteTabGroup)});
      cleanList.push(()=>{oTabListBtn.removeEventListener('click', openTabGroup)});
      cTabListBtn.addEventListener('click', deleteTabGroup, {once: true});
      oTabListBtn.addEventListener('click', openTabGroup, {once: true});
    }

    // returning a cleanup function
    return ()=>{
      for (const func of cleanList){
        func();
      }
    };
  }, [tabList]); // need the second component to do this only when this first renders

  // tablist
  const tablistMapped=(i)=>{
    return (subitem,j)=>{
      try{
        console.debug(subitem.id, subitem.url, subitem.title);
      }catch(e){
        subitem = {
          url: 'error',
          id: null,
          title: 'error'
        }
      };
      return (
        <li id={"li-"+i+'-'+j} key={"li-"+i+'-'+j} ijloc={[i,j]} tabid={subitem.id}>
          <table className="table table-compact table-fixed w-full">
            <tbody>
              <tr className="hover">
                <td className="w-8" id={"close-li-"+i+'-'+j}><button className="btn btn-xs btn-circle btn-outline normal-case">X</button></td>
                <td className="w-max text-xs whitespace-normal truncate hover:text-clip break-words">
                  <b className="font-extrabold">{subitem.title}</b><p className="break-all">{subitem.url}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </li>
      )
    };
  };

  // list of tablist
  const tablistListMapped=(item, i)=>{return(
        <li key={'tablist-'+i} tablistkey={i}>
          <div className="flex mt-4 gap-4 items-baseline w-full">
            <span className="text-base font-extrabold h-fit ml-4">{'Tab List '+i}</span>
            <div className="btn-group">
              <button className="btn btn-xs" disabled={false}>Close All</button>
              <button className="btn btn-xs" disabled={false}>Restore All</button>
            </div>
            <div className="divider grow"/>
          </div>
          <ul id={'tablist-'+i}>
            {(item.length > 0) && (typeof item.map === 'function') && item.map(tablistMapped(i))}
          </ul>
        </li>
  )};

  return(
    <div className="TablistList max-w-full" id="tablist-list">
      <ul id="tablistlist-ul">
        {(tabList.length > 0) && (typeof tabList.map === 'function') && tabList.map(tablistListMapped)}
      </ul>
    </div>
  );
}


// Pseudo root of the page
class Tablist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showIExport : false, tabListGen: 0, tabData : "", restoreTabsDiscarded: true};
    this.hideit = ()=>{ this.setState({showIExport : false});};

    this.doneFunc = (tabs)=>{
      chrome.runtime.sendMessage({msg:'saveTabMetadata', payload:{tabs:tabs}}, ()=>{console.log('overrided storage.tabs')});
      this.setState({tabListGen:1+this.state.tabListGen}); // change generation of tab list generation
      console.log(["stateChange",this.state.tabListGen])
      this.hideit();
    };

    // apply config here
    const applyConfig = ()=>{chrome.runtime.sendMessage({msg:'readConfigData'}, (config)=>{
        console.info('config is now'+ JSON.stringify(config));
        this.setState({restoreTabsDiscarded: config.restoreTabsDiscarded});
        console.info('this.state is now'+ JSON.stringify(this.state)); // this should update TabList prop. and rerender

        document.documentElement.setAttribute("data-theme", config.theme); // set theme here
        document.documentElement.setAttribute('config', JSON.stringify(config));
    });}
    applyConfig();

    chrome.runtime.onMessage.addListener((m, s, sR)=>{
        if(m.msg === 'reloadConfigs'){
          console.log('tablist: messg_rcvd: \n'+JSON.stringify([m, s, sR],null,2));
          applyConfig();
        }else if(m.msg === 'tabDataChanged'){
          console.log('tablist: messg_rcvd: \n'+JSON.stringify([m, s, sR],null,2));
          this.setState({tabListGen:1+this.state.tabListGen}); // change generation of tab list generation
          // What to do if Editor was Open???
          if(this.state.showIExport){window.alert("Tab Data Changed!!!");};

          sR();
          /**
           * ^^ to avoid bug
           * see https://bugs.chromium.org/p/chromium/issues/detail?id=1304272
           */
        };
      return true;
    });


  }


  componentDidMount(){
    const exportData = ()=>{
      this.setState({showIExport : true});
      chrome.runtime.sendMessage({msg:'getTabMetadata'}, (result)=>{
        this.setState({tabData : JSON.stringify(result, ['id','title','url'], 2)});
      });
    };
    const openOptions=()=>{chrome.runtime.sendMessage({msg:'showOptions'});};

    // const hideit = ()=>{this.setState({showIExport : false});}

    document.getElementById('export').addEventListener('click', exportData);
    document.getElementById('openOptions').addEventListener('click', openOptions);

    document.title = "Worse-OneTab - Tab Lists";
    document.getElementById('deleteData').addEventListener('click', deleteData);
  }


  render() {
    return (
      <div className="Tablist">
        <div className={"pt-6"}/>
        <div className="flex flex-nowrap justify-around items-baseline ">
          <button className="btn btn-sm" id="openOptions">Options</button>
          <div className="prose w-fit"><h1>List of Stored Tabs</h1></div>
          <button className="btn btn-sm" id="export">Edit</button>
        </div>

        <IExportTabs isVisible={this.state.showIExport} hideMe={this.hideit} tabData={this.state.tabData} doneFunc={this.doneFunc}/>

        <div className="divider"/>

        <TablistList tabListGen={this.state.tabListGen} restoreTabsDiscarded={this.state.restoreTabsDiscarded} />

        <div className="divider"/>
        <div className="flex flex-nowrap justify-around">
          <button className="btn btn-sm" id="deleteData">Delete All Data</button>
        </div>
        <div className={"pt-6"}/>
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
  root.render(<Tablist />);
});
