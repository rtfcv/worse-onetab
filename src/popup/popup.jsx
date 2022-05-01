import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import styled from 'styled-components';

function showTabList() {
    chrome.runtime.sendMessage('showTabList');
}

function toggleAction() {
    chrome.runtime.sendMessage(
        'toggleAction',
        (status) => {document.getElementById('toggleAction').textContent = status;}
    );
}


class Popup extends React.Component {
  componentDidMount(){
    chrome.runtime.sendMessage(
        'getActionState',
        (status) => {document.getElementById('toggleAction').textContent = status;}
    );
    document.getElementById('showTabList').addEventListener('click', showTabList);
    document.getElementById('toggleAction').addEventListener('click', toggleAction);
  }
  render() {
    return (
      <div className="Popup">
        <button id="showTabList">showTabList</button>
        <button id="toggleAction">enable</button>
      </div>
    );
  }
}


ReactDOM.render(
  <Popup />,
  document.getElementById('root')
);
