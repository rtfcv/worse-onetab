import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useState } from "react";

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
    chrome.runtime.sendMessage('toggleAction', (status)=>{updateStatus(status);});
}


function TablistList () {
    const [tabList, setTabList] = useState([]);

    chrome.runtime.sendMessage('getTabMetadata',
        (result)=>{
            setTabList(result);
        }
    );

    const deleteItem = (index) => {
        let temp = tabList.filter((item, i) => i !== index);
        setTabList(temp);
    };

    return(
        <div className="TablistList" id="tab-list-list">
          <ul>
            {tabList.length > 0 && tabList.map((item, i) => <li id={"listitem-" + i}>{item.title + " :: " + item.url} </li>)}
          </ul>
        </div>
    );
}


class Tablist extends React.Component {
  componentDidMount(){
    chrome.runtime.sendMessage('getActionState', (status)=>{updateStatus(status);});
    document.getElementById('toggleAction').addEventListener('click', toggleAction);
  }
  render() {
    return (
      <div className="Tablist">
        <div id="actionStatus"></div>
        <button id="toggleAction">enable</button>
        <TablistList />
      </div>
    );
  }
}


const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Tablist />);
