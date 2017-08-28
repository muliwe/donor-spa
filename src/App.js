import React, { Component } from 'react';
import './App.css';
import Form from './Form.js';

class App extends Component {
  constructor (props) {
    super(props);

    this.state = {
      showed: true
    };

    this.toggle = this.toggle.bind(this);

    this.globals = {
        hash: props.globals.hash,
        address: '',
        setAddress: () => {},
        socket: props.globals.socket,
        map: props.globals.map
    };

    // broadcast your hash now to get info
    this.globals.socket.emit('hash', props.globals.hash);

    // set actual address to form
    props.globals.map.methods.locator.on('location-to-address-complete', evt => {
      if (evt.address.address) {
          this.globals.setAddress(evt.address.address.LongLabel);
      }
    });
  }

  toggle() {
      this.setState({showed: !this.state.showed});
  }

  render() {
    return (
      <div className="App">
        <div className="App-header" onClick={this.toggle}>
          <h4>For Donors</h4>
        </div>
        <div className={this.state.showed ? '': 'hidden'}><Form globals={this.globals}/></div>
      </div>
    );
  }
}

export default App;
