/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react'

import RaisedButton from 'material-ui/RaisedButton'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import {Card, CardMedia, CardTitle} from 'material-ui/Card'


import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {cyan400, cyan500, red400} from 'material-ui/styles/colors'

const styles = {
  container: {
    textAlign: 'center',
    paddingTop: '200px',
  },
  button: {
    margin: '12px'
  }
}

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: cyan400,
    accent1Color: cyan500,
  },
})

class Main extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false,
      status: '',
      uid: '',
      file: '',
      body: false,
      token: location.search.substr(1).split('=')[1],
      text: '',
      results: [],
      resultLimit: 10
    }

    fetch('/me?token='+this.state.token)
        .then(res => res.json())
        .then(res => this.setState(res))

  }

  doSearch = e => {
      e.preventDefault()
      fetch(`/users/${this.state.text}`)
          .then(res => res.json())
          .then(results => this.setState({results, resultLimit: 10}))
  }

  doUpload = () => {
    const {uid, body} = this.state
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
    const {uid} = this.state
    this.setState({status: 'Deleting...'})
    fetch(`/user/${uid}/image`, {method: 'DELETE'})
      .then(res => res.text())
      .then(res => this.setState({status: res}))
  }

  fileChange = e => {
    const files = e.target.files || e.dataTransfer.files

    if(!files.length) return

    const file = files[0]
    const filename = file.name
    const body = new FormData()

    body.append('file', file)
    body.append('token', this.state.token)

    this.setState({body, filename})
  }

  render() {
    const {open, results, uid, filename, resultLimit, status} = this.state
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={{marginTop: '50px'}}>
          <header>
            <div className='header-inner'>
              <div className='row'>
                <div className='header-left col-md-2'></div>
                <div className='col-md-8'>
                  <h2>zfinger</h2>
                </div>
                <div className='header-right col-md-2'>
                  <a href='#' className='primary-action' onTouchTap={() => this.setState({open: true})}>My Face</a>
                </div>
              </div>
            </div>
          </header>
          <div id='content'>
            <Upload
              open={open}
              uploadClose={() => this.setState({open: false})}
              doUpload={this.doUpload}
              fileChange={this.fileChange}
              doDelete={this.doDelete}
              uid={uid}
              filename={filename}
              status={status}
            />

            <form onSubmit={this.doSearch}>
                <TextField
                  hintText='Search'
                  inputStyle={{boxShadow: 'none'}}
                  onChange={(e, value) => this.setState({text: value})}
                  fullWidth={true} />
            </form>

            {results.filter((_, i) => i < resultLimit).map(result => <UserCard {...result} />)}

            {results.length ? <RaisedButton label='Show more' fullWidth={true} onClick={() => this.setState({resultLimit: resultLimit + 10})} /> : false }

          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

function UserCard({cn, uid}) {
  return (<Card style={{width: '50%', display: 'inline-block'}}>
            <CardMedia>
              <img src={`/user/${uid}/image`} />
            </CardMedia>
            <CardTitle title={cn} subtitle={uid + '@kth.se'} />
          </Card>)
}

function Upload({open, uid, filename, uploadClose, doUpload, fileChange, doDelete, status}) {
  return (
    <Dialog
      open={open}
      title='Upload a new image'
      actions={[<FlatButton label='Cancel' onTouchTap={uploadClose} style={styles.button} />,
                <RaisedButton label={`Upload ${filename || ''}`} primary={true} disabled={!filename} onTouchTap={doUpload} style={styles.button} />]}
      onRequestClose={uploadClose}>

    <div style={{textAlign: 'center'}}>
    <img style={{height: '150px'}} src={`/user/${uid}/image?${Date.now()}`} />

    <div style={{display: 'inline-block', marginLeft: '10px', textAlign: 'left'}}>
      <RaisedButton
        containerElement='label'
        label='Select new image'
        style={styles.button}>
          <input
            type='file'
            style={{display: 'none'}}
            onChange={fileChange} />
      </RaisedButton>
      <br />
      <RaisedButton
        label='Delete'
        backgroundColor={red400}
        labelColor={'white'}
        onTouchTap={doDelete}
        style={styles.button} />
      <br />
      {status}
    </div>
    </div>

  </Dialog>)
}

export default Main
