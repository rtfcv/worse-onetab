import * as React from 'react';
import { createRoot } from 'react-dom/client';

class Options extends React.Component {
  render() {
    return (
      <div className="App">
        <div>OPTIONS</div>
      </div>
    );
  }
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Options />);
