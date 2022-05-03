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


function IExportTabs (props) {
    /**
     * View for Exporting and Importing tabs
     */
    const isVisible = props.isVisible;

    useEffect(() => {
        let cleanList = [];
        if (isVisible){
            const thisDoneFunc = ()=>{
                // do integrity check in the second part
                //const tabData = JSON.parse(document.getElementById('jsonArea').value, data=>data);
                
                try{
                const tabData = JSON.parse(document.getElementById('jsonArea').value);
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
            tjc.addEventListener('click', props.hideMe, {once: true});

            const area = document.getElementById('jsonArea');
            area.value = props.tabData;
        };
        return ()=>{for (const f of cleanList){f();}};
    }, [props]);

    if (isVisible){return (
        <div>
            <hr/>
            <textarea id="jsonArea" style={{width:'100%', height:'75%'}}>would love to replace this with codemirror</textarea>
            <br/>
            <button id="tabJsonDone">done</button>
            <button id="tabJsonCancel">cancel</button>
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


    return(
        <div className="TablistList" id="tablist-list">
        <ul id="tablistlist-ul">{
            (tabList.length > 0) && tabList.map((item, i) => {return(
                <li key={'tablist-'+i}>
                {'tablist-'+i}
                <ul id={'tablist-'+i}>{
                    (item.length > 0) && (typeof item.map === 'function') && item.map((subitem,j) => {return (
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


class Tablist extends React.Component {
    constructor(props) {
        super(props);
        this.state = {showIExport : false, tabListGen: 0, tabData : ""};
        this.hideit = ()=>{ this.setState({showIExport : false});};

        this.doneFunc = (tabs)=>{
            chrome.runtime.sendMessage({msg:'saveTabMetadata', payload:{tabs:tabs}}, (result)=>{console.log('overrided storage.tabs')});
            this.setState({tabListGen:1+this.state.tabListGen}); // change generation of tab list generation
            console.log(["stateChange",this.state.tabListGen])
            this.hideit();
        };
    }


    componentDidMount(){
        const exportData = ()=>{
            this.setState({showIExport : true});
            chrome.runtime.sendMessage({msg:'getTabMetadata'}, (result)=>{
                this.setState({tabData : JSON.stringify(result, ['id','title','url'], 2)});
            });
        };
        const hideit = ()=>{this.setState({showIExport : false});}

        document.getElementById('export').addEventListener('click', exportData);

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
                <button id="export">export</button>

                <IExportTabs isVisible={this.state.showIExport} hideMe={this.hideit} tabData={this.state.tabData} doneFunc={this.doneFunc}/>

                <hr/>
                <TablistList tabListGen={this.state.tabListGen}/>
                <hr/>
                <button id="deleteData">Delete All Data</button>
            </div>
        );
    }
}


const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Tablist />);
