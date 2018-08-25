import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

export default App;

if (typeof document !== 'undefined') {
  const renderMethod = module.hot
    ? ReactDOM.render
    : ReactDOM.hydrate || ReactDOM.render;
  const render = (Comp: any) => {
    renderMethod(<Comp />, document.getElementById('root'));
  };

  render(App);

  const registerSW = /node|production/i.test(process.env.REACT_STATIC_ENV);
  if ('serviceWorker' in navigator && registerSW) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
}
