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
              <p>NOTE: It takes about one hour for the new image to show here, because of caching.</p>
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
