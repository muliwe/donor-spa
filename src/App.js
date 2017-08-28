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
        address: 'address',
        socket: props.globals.socket
    };
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
