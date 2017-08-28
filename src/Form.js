import React, { Component } from 'react';
import { FormErrors } from './FormErrors';
import './Form.css';

class Form extends Component {
  constructor (props) {
    super(props);

    this.state = {
      hash: this.props.globals.hash,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: this.props.globals.address || '',
      bloodType: '0(I)+',
      formErrors: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bloodType: '',
        ok: 'Please, fill the Form to join Blood Donation Program'
      },
      valid: {
        firstName: false,
        lastName: false,
        email: false,
        phone: false
      },
      formValid: false,
      formSaved: false
    };

    this.props.globals.setAddress = address => {
        this.setState({
            address: address
        });
    };

    this.props.globals.socket.on('pin-data', msg => {
      console.log('Pin data: ', msg);

      var msgData;

      try {
          msgData = JSON.parse(msg);
      } catch (error) {
          console.error(error);
      }

      this.props.globals.hash = msgData.hash;

      location.replace('/#' + msgData.hash);

       this.setState({
          hash: msgData.hash
        });

      if (msgData.deleted) {
        this.setState({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          bloodGroup: '0(I)+'
        });
        this.setState({
          formErrors: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            bloodGroup: '',
            ok: 'Your Info is erased, but you can join Blood Donation Program later!'
          },
          formValid: false,
          formSaved: false
        });
        this.setState({
          valid: {
            firstName: false,
            lastName: false,
            email: false,
            phone: false
          }
        });
      } else if (!msgData.firstName) {
          this.setState({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              bloodGroup: '0(I)+'
          });
          this.setState({
              formErrors: {
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  bloodGroup: '',
                  ok: 'Please, fill the Form to join Blood Donation Program'
              },
              formValid: false,
              formSaved: false
          });
          this.setState({
            valid: {
              firstName: false,
              lastName: false,
              email: false,
              phone: false
            }
          });
      } else {
        this.setState(msgData);
        this.setState({
          formErrors: {
            firstName: '',
              lastName: '',
              email: '',
              phone: '',
              bloodGroup: '',
              ok: 'You data is saved! Secret link to edit or delete your data is in your address bar now'
            },
            formValid: true,
            formSaved: true
          });
          this.setState({
            valid: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          });
      }
    });

    this.handleUserInput = this.handleUserInput.bind(this);
    this._submit = this._submit.bind(this);
    this.submitData = this.submitData.bind(this);
    this.deleteData = this.deleteData.bind(this);
  }

  _submit(toDelete) {
      this.props.globals.socket.emit('pin-data-upsert', JSON.stringify({
          hash: this.state.hash,
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          email: this.state.email,
          phone: this.state.phone,
          address: this.state.address,
          bloodGroup: this.state.bloodGroup,
          lat: this.props.globals.map.methods.graphic.geometry.y,
          long: this.props.globals.map.methods.graphic.geometry.x,
          deleted: !!toDelete
      }));

      console.log('emitted data save');
  }

  submitData(e) {
    e.preventDefault();
    this._submit();
  }

  deleteData(e) {
    e.preventDefault();
    this._submit(true);
  }

  handleUserInput(e) {
    const name = e.target.name;
    let value = e.target.value;

    value = Form.fieldFormat(name, value);

    this.setState({[name]: value}, () => {
      this.validateField(name, value)
    });
  }

  static fieldFormat(fieldName, value) {
    let formattedValue = '' + value;
    switch(fieldName) {
      case 'phone':
        formattedValue = formattedValue.replace(/[\s()-]/g, '');
        formattedValue = formattedValue.replace(/^(\+|00)(\d\d*)(\d{3})(\d{4})(\d{3})/, '$1$2 $3 $4 $5');
        break;
      default:
        formattedValue = formattedValue.replace(/^\s+/g, '');
        formattedValue = formattedValue.replace(/\s+$/g, '');
        break;
    }
    return formattedValue;
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let valid = this.state.valid;

    switch(fieldName) {
      case 'firstName':
        valid[fieldName] = value.length >= 1;
        fieldValidationErrors[fieldName] = valid[fieldName] ? '': 'First Name is required';
        break;
      case 'lastName':
        valid[fieldName] = value.length >= 2;
        fieldValidationErrors[fieldName] = valid[fieldName] ? '': 'Last Name is required';
        break;
      case 'email':
        valid[fieldName] = !!value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        fieldValidationErrors[fieldName] = valid[fieldName] ? '': 'Email is invalid';
        break;
      case 'phone':
        valid[fieldName] = !!value.match(/(\+|00)(\d\d*) (\d{3}) (\d{4}) (\d{3})$/i);
        fieldValidationErrors[fieldName] = valid[fieldName] ? '': 'Phone is invalid';
        break;
      default:
        break;
    }
    this.setState({formErrors: fieldValidationErrors,
                    valid: valid
                  }, this.validateForm);
  }

  validateForm() {
    this.setState({
      formValid: Object.keys(this.state.valid).every(el => !!this.state.valid[el])
    });
  }

  static errorClass(error) {
    return (error && error.length === 0 ? '' : 'has-error');
  }

  render () {
    return (
      <form className="demoForm">
        <div className={`form-group ${Form.errorClass(this.state.formErrors.firstName)}`}>
          <label htmlFor="firstName">First Name</label>
          <input type="text" required className="form-control" name="firstName"
                 placeholder="John"
                 value={this.state.firstName}
                 onChange={this.handleUserInput}  />
        </div>
        <div className={`form-group ${Form.errorClass(this.state.formErrors.lastName)}`}>
          <label htmlFor="lastName">Last Name</label>
          <input type="text" required className="form-control" name="lastName"
                 placeholder="Doe"
                 value={this.state.lastName}
                 onChange={this.handleUserInput}  />
        </div>
        <div className={`form-group ${Form.errorClass(this.state.formErrors.email)}`}>
          <label htmlFor="email">Email</label>
          <input type="email" required className="form-control" name="email"
            placeholder="email@domain.tld"
            value={this.state.email}
            onChange={this.handleUserInput}  />
        </div>
        <div className={`form-group ${Form.errorClass(this.state.formErrors.phone)}`}>
          <label htmlFor="phone">Contact phone</label>
          <input type="text" required className="form-control" name="phone"
                 placeholder="+12 345 6789 012"
                 value={this.state.phone}
                 onChange={this.handleUserInput}  />
        </div>
        <div className={`form-group ${Form.errorClass(this.state.formErrors.address)}`}>
          <label htmlFor="address">Address</label>
          <textarea required className="form-control" name="address"
                 value={this.state.address}
                 onChange={this.handleUserInput}  />
        </div>
        <div className={`form-group ${Form.errorClass(this.state.formErrors.bloodGroup)}`}>
          <label htmlFor="bloodGroup">Your Blood Group</label>
          <select required className="form-control" name="bloodGroup"
                    value={this.state.bloodGroup}
                    onChange={this.handleUserInput}>
            <option>0(I)+</option>
            <option>0(I)-</option>
            <option>A(II)+</option>
            <option>A(II)-</option>
            <option>B(III)+</option>
            <option>B(III)-</option>
            <option>AB(IV)+</option>
            <option>AB(IV)-</option>
          </select>
        </div>
        <div className="panel panel-default">
          <FormErrors formErrors={this.state.formErrors} okStateText={this.state.okStateText}/>
        </div>
        {this.state.formValid ? <button type="submit" className="btn btn-primary"
                                        onClick={this.submitData}>Save</button> : null}
        {this.state.formSaved ? <button type="submit" className="btn btn-danger"
                                        onClick={this.deleteData}>Delete</button> : null}
      </form>
    )
  }
}

export default Form;
