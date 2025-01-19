import React from 'react';
import ReactDOM from 'react-dom';
import { IslandBuilder } from './traditional/components/IslandBuilder';
import MenuBar from './menubar/MenuBar';

const App: React.FC = () => {
  const isMenuBar = window.location.pathname.includes('menubar.html');

  return (
    <React.StrictMode>
      {isMenuBar ? <MenuBar /> : <IslandBuilder />}
    </React.StrictMode>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

