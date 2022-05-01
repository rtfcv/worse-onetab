import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

// import styled from 'styled-components';

function updateStatus(status) {
      if (status == 'disable') {
          console.log('was enabled')
          document.getElementById('toggleAction').textContent = status;
          document.getElementById('actionStatus').textContent = 'enabled';
      } else {
          console.log('was disabled')
          document.getElementById('toggleAction').textContent = status;
          document.getElementById('actionStatus').textContent = 'disabled';
      };
}

function toggleAction() {
    chrome.runtime.sendMessage('toggleAction', (status)=>{updateStatus(status);});
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
      </div>
    );
  }
}


// ReactDOM.render(
//   <Tablist />,
//   document.getElementById('root')
// );
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Tablist />);
