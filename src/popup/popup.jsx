import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
// import styled from 'styled-components';

function showTabList() {
    chrome.runtime.sendMessage({msg:'showTabList'});
}

function saveCurrentTabs () {
    console.log('trying to save tabs:');
    chrome.runtime.sendMessage(
        {msg:'saveCurrentTabs'},
        // callback
        (tabs) => {
            console.log('saving tabs:');
            console.log(tabs);
        }
    );
}


class Popup extends React.Component {
  constructor(props){
    super(props);
    this.state = {tabData : ""};

    // apply config here
    chrome.runtime.sendMessage({msg:'readConfigData'}, (config)=>{
      console.log(config);
      document.documentElement.setAttribute("data-theme", config.theme); // can set theme here
      document.documentElement.setAttribute('config', JSON.stringify(config));
    });
  }

  componentDidMount(){
    chrome.runtime.sendMessage(
        {msg:'getActionState'},
    );
    const showOptions=()=>{chrome.runtime.sendMessage({msg:'showOptions'});};
    document.getElementById('showOptions').addEventListener('click', showOptions);
    document.getElementById('showTabList').addEventListener('click', showTabList);
    document.getElementById('saveCurrentTabs').addEventListener('click', saveCurrentTabs);
  }
  render() {
    return (
      <div id="popUP" className="p-6">
        <div className="prose text-center content-center justify-center max-w-full">
            <h3 className="whitespace-nowrap w-full">worse-onetab</h3>
        </div>
        <div className="p-2"/>
        <div className="w-max">
          <ul className="menu menu-compact whitespace-nowrap w-max">
            <li><button className="whitespace-nowrap" id="showTabList"        >Show Tab List</button></li>
            <li><button className="whitespace-nowrap" id="saveCurrentTabs">Save Current Tabs</button></li>
            <li><button className="whitespace-nowrap" id="showOptions"         >Show Options</button></li>
          </ul>
        </div>
      </div>
    );
  }
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Popup />);
