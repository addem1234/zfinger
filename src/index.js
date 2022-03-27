import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import { cyan } from 'material-ui/colors'


const muiTheme = createMuiTheme({
  palette: {
    primary: cyan
  }
})

ReactDOM.render(
  <MuiThemeProvider theme={muiTheme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </MuiThemeProvider>
  , document.getElementById('root'));
registerServiceWorker();
