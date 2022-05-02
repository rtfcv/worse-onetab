import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from "react";

// import * as t from '../tabs';
// import styled from 'styled-components';

function updateStatus(status) {
      if (status == 'disable') {
          console.log('was enabled')
          document.getElementById('toggleAction').textContent = status;
          document.getElementById('actionStatus').textContent = 'popup is enabled';
      } else {
          console.log('was disabled')
          document.getElementById('toggleAction').textContent = status;
          document.getElementById('actionStatus').textContent = 'popup is disabled';
      };
}

function toggleAction() {
    chrome.runtime.sendMessage({msg: 'toggleAction'}, (status)=>{updateStatus(status);});
}

function deleteData() {
    if(window.confirm('Do you want to delete all data?')){
        console.log('dataDelete');
    };
    chrome.runtime.sendMessage({msg:'deleteData'}, (status)=>{updateStatus(status);});
}


function TablistList () {
    const [tabList, setTabList] = useState([]);

    useEffect(() => {
        // list of cleanupFunctions
        let cleanList = [];

        const tabListList = document.getElementById('tablistlist-ul')
        const cTabListList = tabListList.children

        for (const c of cTabListList){
            const cTabList = c.children
            for (const cc of cTabList){
                const cTab = cc.children
                for (const ccc of cTab) {
                    // call back for a list element
                    const clickListener = ()=>{
                        const index = ccc.getAttribute('ijloc').split(','); // string 'i,j'
                        const tabID = ccc.getAttribute('tabID');
                        // log what has been clicked
                        console.log({clicked: ccc, id: ccc.id, index: index, tabID: tabID});
                        // open page url: request service worker to open the clicked element :
                        chrome.runtime.sendMessage({msg:'openAndDeleteATab', payload:{index: index, tabID: tabID}});
                        // pop the item from the list
                    };

                    // add event listener function and clean list for removing this later
                    cleanList.push(()=>{ccc.removeEventListener('click', clickListener)});
                    ccc.addEventListener('click', clickListener, {once: true});
                }
            }
        }

        // returning a cleanup function
        return ()=>{
            for (const func of cleanList){
                func();
            }
        };
    }, [tabList]); // need the second component to do this only when this first renders

    // may be this should not run every render
    chrome.runtime.sendMessage({msg:'getTabMetadata'},
        (result)=>{
            setTabList(result);
        }
    );

    const deleteItem = (index) => {
        let temp = tabList.filter((item, i) => i !== index);
        setTabList(temp);
    };

    const liii = [[11,12],[21,22]];

    return(
        <div className="TablistList" id="tablist-list">
        <ul id="tablistlist-ul">{
            tabList.length > 0 && tabList.map((item, i) => <li>{'tablist-' + i}<ul id={'tablist-' + i}>{
                item.length > 0 && item.map((subitem,j) => <li id={"li-"+i+'-'+j} ijloc={[i,j]} tabID={subitem.id}>{subitem.id}: <b>{subitem.title}</b><br/>{subitem.url}<br/></li>)
            }</ul></li>)
        }</ul>
        </div>
    );
}


class Tablist extends React.Component {
  componentDidMount(){
    chrome.runtime.sendMessage({msg: 'getActionState'}, (status)=>{updateStatus(status);});
    document.getElementById('toggleAction').addEventListener('click', toggleAction);
    document.getElementById('deleteData').addEventListener('click', deleteData);
  }

  render() {
    return (
      <div className="Tablist">
        <div id="actionStatus"></div>
        <button id="toggleAction">enable</button>
        <hr/>
        <TablistList />
        <hr/>
        <button id="deleteData">Delete All Data</button>
      </div>
    );
  }
}


const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Tablist />);
