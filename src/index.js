import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

var globals = $globals();

var TO = setInterval(function() {
    if (globals.map && globals.socket) {
        clearInterval(TO);

        ReactDOM.render(
            <App globals={globals}/>,
            document.getElementById('root')
        );
    }
}, 100);
