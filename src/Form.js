import React, { Component } from 'react';
import { FormErrors } from './FormErrors';
import './Form.css';

class Form extends Component {
  constructor (props) {
    super(props);

    this.state = {
      hash: this.props.donor.hash,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: this.props.donor.address || '',
      bloodType: '',
      formErrors: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bloodType: '',
        ok: 'Fill the Form to register in Blood Donation program'
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

    this.handleUserInput = this.handleUserInput.bind(this);
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
    console.log(this.state.valid, Object.keys(this.state.valid).every(el => !!this.state.valid[el]));
    this.setState({
      formValid: Object.keys(this.state.valid).every(el => !!this.state.valid[el])
    });
  }

  static errorClass(error) {
    return(error.length === 0 ? '' : 'has-error');
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
        <div className={`form-group ${Form.errorClass(this.state.formErrors.bloodType)}`}>
          <label htmlFor="bloodType">Your Blood Group</label>
          <select required className="form-control" name="bloodType"
                    value={this.state.bloodType}
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
        {this.state.formValid ? <button type="submit" className="btn btn-primary">Save</button> : null}
        {this.state.formSaved ? <button type="submit" className="btn btn-danger">Delete</button> : null}
      </form>
    )
  }
}

export default Form;
