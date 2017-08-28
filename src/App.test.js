import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const globals =  {
      hash: {},
      map: {
          methods: {
              locator: {
                  on: () => {}
              }
          }
      },
      socket: {
          emit: () => {},
          on: () => {}
      }
  };

  ReactDOM.render(<App globals={globals} />, div);
});
