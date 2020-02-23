import React, { Fragment } from 'react';

import AppProvider from './components/AppProvider';
import Welcome from './components/Welcome';
import Whiteboard from './components/Whiteboard';
import AppContext from './context/AppContext';
import './styles/global.css';

export default function App() {
  return (
    <div id="App">
      <AppProvider>
        <AppContext.Consumer>
          {(context) => (
            <Fragment>
              {context.showBoard ? <Whiteboard /> : <Welcome />}
            </Fragment>
          )}
        </AppContext.Consumer>
      </AppProvider>
    </div>
  );
}