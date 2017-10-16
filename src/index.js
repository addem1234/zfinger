import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Methone from 'methone'
import registerServiceWorker from './registerServiceWorker';

const appWrapper = (<div>
  <Methone config={{ system_name: 'zfinger', color_scheme: 'cyan', links: []}} />
  <App />
</div>)

ReactDOM.render(appWrapper, document.getElementById('root'));
registerServiceWorker();
