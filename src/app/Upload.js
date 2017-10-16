import React, {Component} from 'react'

import RaisedButton from 'material-ui/RaisedButton'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'

import {red400} from 'material-ui/styles/colors'

class Upload extends Component {
  constructor(props) {
    super(props)

    this.state = {
      filename: '',
      status: '',
      confirmOpen: false,
      body: false,
      currentYear: 0,
      yearStatus: false,
      yearError: false
    }

  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.uid) {
      fetch(`https://hodis.datasektionen.se/uid/${nextProps.uid}`)
        .then(res => res.json())
        .then(res => this.setState({currentYear: res.year}))
    }
  }

  doUpload = () => {
    const { uid } = this.props
    const { body } = this.state
    if(uid) {
      this.setState({status: 'Uploading...'})
      fetch(`/user/${uid}/image`, {
          method: 'POST',
          body: body
        }).then(res => res.text())
          .then(res => this.setState({status: res}))
    }
  }

  doDelete = () => {
    const { uid } = this.props
    this.setState({status: 'Deleting...', confirmOpen: false})
    fetch(`/user/${uid}/image`, {method: 'DELETE'})
      .then(res => res.text())
      .then(res => this.setState({status: res}))
  }

  updateYear = year => {
    const { uid, token } = this.props
    const thisYear = new Date().getFullYear();
    const parsedYear = parseInt(year);
    if(parsedYear >= 1983 && parsedYear <= thisYear) {
      this.setState({yearError: false})
      fetch(`http://localhost:8080/uid/${uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({token, year: parsedYear})
      }).then(res => res.text())
        .then(res => this.setState({yearStatus: res}))
    } else {
      this.setState({yearError: `This should be a number between 1983 and ${thisYear}`})
    }
  }

  fileChange = e => {
    const files = e.target.files || e.dataTransfer.files

    if(!files.length) return

    const file = files[0]
    const filename = file.name
    const body = new FormData()

    body.append('file', file)
    body.append('token', this.props.token)

    this.setState({body, filename})
  }

  confirmClose = () => this.setState({confirmOpen: false})

  render() {
    const { open, uploadClose } = this.props
    const { uid, personal } = this.props

    const { filename, status, confirmOpen } = this.state
    const { yearError, yearStatus, currentYear } = this.state

    const cancel = <FlatButton
      label='Cancel'
      onTouchTap={uploadClose}
      style={{ margin: '12px' }} />

    const upload = <RaisedButton
      primary={true}
      label={`Upload ${filename || ''}`}
      disabled={!filename}
      onTouchTap={this.doUpload}
      style={{ margin: '12px' }} />

    const confirmCancel = <FlatButton
      label='Cancel'
      onTouchTap={this.confirmClose}
      style={{ margin: '12px' }} />

    const confirmDelete = <RaisedButton
      label='Delete'
      backgroundColor={red400}
      labelColor={'white'}
      onTouchTap={this.doDelete}
      style={{ margin: '12px' }} />

    return (
      <Dialog
        open={open}
        actions={[cancel, upload]}
        onRequestClose={uploadClose}>

      <img
        style={{height: '200px', verticalAlign: 'top'}}
        src={`/user/${uid}/image?${Date.now()}`} />

      <div style={{display: 'inline-block', marginLeft: '10px', textAlign: 'left'}}>
        <div>Here you can enter the year you started at KTH:</div>
        <TextField
          hintText={`Currently ${currentYear != 0 ? currentYear : 'unknown'}`}
          errorText={ yearError ? yearError : false }
          onChange={(e, value) => this.updateYear(value)} />
        <span style={{marginLeft: '5px'}}>{ yearStatus }</span>
        <div>
          Use the buttons below to change your image.
        </div>
        <RaisedButton
          containerElement='label'
          label='Select new image'
          style={{ margin: '12px 0' }}>
            <input
              type='file'
              style={{display: 'none'}}
              onChange={this.fileChange} />
        </RaisedButton>
        <br />
        <RaisedButton
          label='Delete'
          disabled={!personal}
          backgroundColor={red400}
          labelColor={'white'}
          onTouchTap={() => this.setState({confirmOpen: true})}
          style={{ margin: '12px 0' }} />
        <br />
        <span>
          {status}
        </span>
      </div>
      <Dialog
        open={confirmOpen}
        actions={[confirmCancel, confirmDelete]}
        contentStyle={{ width: '50%' }}
        onRequestClose={this.confirmClose} >
        Are your sure you want to delete your personal image?
      </Dialog>

    </Dialog>)
  }
}

export default Upload
