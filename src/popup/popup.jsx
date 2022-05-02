import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
// import styled from 'styled-components';

function showTabList() {
    chrome.runtime.sendMessage({msg:'showTabList'});
}

function toggleAction() {
    chrome.runtime.sendMessage(
        {msg: 'toggleAction'},
        (status) => {document.getElementById('toggleAction').textContent = status;}
    );
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
  componentDidMount(){
    chrome.runtime.sendMessage(
        {msg:'getActionState'},
        (status) => {document.getElementById('toggleAction').textContent = status;}
    );
    document.getElementById('showTabList').addEventListener('click', showTabList);
    document.getElementById('toggleAction').addEventListener('click', toggleAction);
    document.getElementById('saveCurrentTabs').addEventListener('click', saveCurrentTabs);
  }
  render() {
    return (
      <div className="Popup">
        <button id="showTabList">showTabList</button>
        <button id="saveCurrentTabs">saveCurrentTabs</button>
        <button id="toggleAction">enable</button>
      </div>
    );
  }
}


// ReactDOM.render(
//   <Popup />,
//   document.getElementById('root')
// );
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Popup />);
