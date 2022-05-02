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
        chrome.runtime.sendMessage({msg:'deleteData'}, (status)=>{updateStatus(status);});
    };
}


function TablistList () {
    const [tabList, setTabList] = useState([]);
    const [dummy, setDummy] = useState(0);

    const updateTabList = () => {
        chrome.runtime.sendMessage({msg:'getTabMetadata'},
            (result)=>{
                try{
                    let tlLen = result.length;
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
    }, []); // need the second component to be empty to do this only when this first renders

    useEffect(() => {
        // list of cleanupFunctions
        let cleanList = [];

        // top element of tablist
        const tabListList = document.getElementById('tablistlist-ul')
        const cTabListList = tabListList.children

        // loop through list of tablist
        for (const c of cTabListList){
            const cTabList = c.children // should yield tablist li
            const cc = cTabList[0]; // get tabList ul from tablist li
            const cTab = cc.children

            // subscribe closing and opening tabGroup here

            // loop through element of tablist li
            for (const ccc of cTab) {
                const cTabTbody = ccc.children[0].children[0];
                const cTabTr = cTabTbody.children[0];
                const cTabElement = cTabTr.children; // should be [x button, tabData] (td, td)

                // callback function for a list element
                const openThisTab = ()=>{
                    // ccc is the li containing table of tab data and button
                    const index = ccc.getAttribute('ijloc').split(','); // string 'i,j'
                    const tabid = ccc.getAttribute('tabid');

                    // log what has been clicked
                    console.log({clicked: ccc, id: ccc.id, index: index, tabid: tabid, doOpen: true});

                    // open page url: request service worker to open and pop the item from the list
                    // need to pass updateTabList to update
                    chrome.runtime.sendMessage({msg:'openAndDeleteATab', payload:{index: index, tabid: tabid, doOpen: true}}, updateTabList);
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
                cleanList.push(()=>{cTabElement[1].removeEventListener('click', openThisTab)});
                cleanList.push(()=>{cTabElement[0].removeEventListener('click', deleteThisTab)});
                cTabElement[1].addEventListener('click', openThisTab, {once: true});
                cTabElement[0].addEventListener('click', deleteThisTab, {once: true});
            }
        }

        // returning a cleanup function
        return ()=>{
            for (const func of cleanList){
                func();
            }
        };
    }, [tabList]); // need the second component to do this only when this first renders


    const deleteItem = (index) => {
        let temp = tabList.filter((item, i) => i !== index);
        setTabList(temp);
    };

    const liii = [[11,12],[21,22]];

    return(
        <div className="TablistList" id="tablist-list">
        <ul id="tablistlist-ul">{
            (tabList.length > 0) && tabList.map((item, i) => {return(
                <li key={'tablist-'+i}>
                {'tablist-'+i}
                <ul id={'tablist-'+i}>{
                    (item.length > 0) && item.map((subitem,j) => {return (
                        <li id={"li-"+i+'-'+j} key={"li-"+i+'-'+j} ijloc={[i,j]} tabid={subitem.id}>
                            <table style={{display: 'inline-table', verticalAlign: 'middle'}}><tbody>
                                <tr>
                                    <td id={"close-li-"+i+'-'+j}>[x]</td>
                                    <td nowrap="wrap">{subitem.id}: <b>{subitem.title}</b><br/>{subitem.url}</td>
                                </tr>
                            </tbody></table>
                        </li>
                    )})
                }</ul>
                </li>
            )})
        }</ul>
        </div>
    );
}
                            //<button id={"close-li-"+i+'-'+j} key={"close-li-"+i+'-'+j} ijloc={[i,j]} tabid={subitem.id}>x</button>
                            //<button id={"span-li-"+i+'-'+j} key={"span-li-"+i+'-'+j} ijloc={[i,j]} tabid={subitem.id}>
                            //    {subitem.id}: <b>{subitem.title}</b><br/>{subitem.url}
                            //</button>


class Tablist extends React.Component {
    componentDidMount(){
        document.title = "OneTab - Tab Lists";
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
