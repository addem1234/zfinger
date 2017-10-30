import React, {Component} from 'react'

import Button from 'material-ui/Button'
import Dialog, { DialogActions, DialogContent } from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'

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
          .catch(err => this.setState({status: err}))
    }
  }

  doDelete = () => {
    const { uid } = this.props
    this.setState({status: 'Deleting...', confirmOpen: false})
    fetch(`/user/${uid}/image?token=${this.props.token}`, {method: 'DELETE'})
      .then(res => res.text())
      .then(res => this.setState({status: res}))
      .catch(err => this.setState({status: err}))
  }

  updateYear = year => {
    const { uid, token } = this.props
    const thisYear = new Date().getFullYear();
    const parsedYear = parseInt(year, 10);
    if(parsedYear >= 1983 && parsedYear <= thisYear) {
      this.setState({yearError: false})
      fetch(`https://hodis.datasektionen.se/uid/${uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({token, year: parsedYear})
      }).then(res => res.text())
        .then(res => this.setState({yearStatus: res, year}))
        .catch(err => this.setState({yearStatus: err}))
    } else {
      this.setState({yearError: true})
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

    return (
      <Dialog open={open} onRequestClose={uploadClose}>
        <DialogContent>
          <img
            style={{height: '200px', verticalAlign: 'top'}}
            src={`/user/${uid}/image?${Date.now()}`}
            alt={uid} />

          <div style={{display: 'inline-block', marginLeft: '10px', textAlign: 'left'}}>
            <div>
              Use the buttons below to change your image.
            </div>
            <Button raised component='label'>
                Select new image
                <input type='file' style={{display: 'none'}} onChange={this.fileChange} />
            </Button>
            <br />
            <Button raised disabled={!personal} color='accent' onClick={() => this.setState({confirmOpen: true})}>
              Delete
            </Button>
            <br />
            <span>
              {status}
            </span>
            <div>Here you can enter the year you started at KTH:</div>
            <TextField
              placeholder={`Currently ${currentYear !== 0 ? currentYear : 'unknown'}`}
              helperText={yearError ? `This should be a number between 1983 and ${new Date().getFullYear()}` : false}
              error={ yearError }
              onChange={e => this.updateYear(e.target.value)} />
            <span style={{marginLeft: '5px'}}>{ yearStatus }</span>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={uploadClose}> Cancel </Button>
          <Button raised color='primary' disabled={!filename} onClick={this.doUpload}>
            {`Upload ${filename || ''}`}
          </Button>
        </DialogActions>
      <Dialog
        open={confirmOpen}
        style={{ width: '50%' }}
        onRequestClose={this.confirmClose} >
        <DialogContent>
          Are your sure you want to delete your personal image?
        </DialogContent>
        <DialogActions>
          <Button onClick={this.confirmClose}> Cancel </Button>
          <Button raised color="accent" onClick={this.doDelete}> Delete </Button>
        </DialogActions>
      </Dialog>

    </Dialog>)
  }
}

export default Upload
