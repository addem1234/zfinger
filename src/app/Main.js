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
import {cyan400, cyan500} from 'material-ui/styles/colors'

const styles = {
  container: {
    textAlign: 'center',
    paddingTop: 200,
  },
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
      user: '',
      file: '',
      body: false,
      token: location.search.substr(1).split("=")[1],
      text: '',
      results: [{uid: 'jonadahl'}, {uid: 'andmarte'}, {uid: 'viklu'}]
    }
    
    fetch('/me?token='+this.state.token)
        .then(res => res.json())
        .then(res => this.setState(res))

  }

  doSearch = e => {
      e.preventDefault()
      fetch(`/users/${this.state.text}`)
          .then(res => res.json())
          .then(results => this.setState({results}))
  }

  doUpload = () => {
    const {user, body} = this.state
    if(user) {
      fetch(`/user/${user}/image`, {
          method: 'POST',
          body: body
        }).then(response => response.text())
          .then(text => {
            this.setState({response: text, open: false})
          })
    }
  }

  fileChange = e => {
    const files = e.target.files || e.dataTransfer.files

    if(!files.length) return

    const file = files[0]
    const body = new FormData()

    body.append('file', file)
    body.append('token', this.state.token)

    this.setState({body})
  }

  render() {
    const {open, results} = this.state
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={{marginTop: '50px'}}>
          <header>
            <div className="header-inner">
              <div className="row">
                <div className="header-left col-md-2"></div>
                <div className="col-md-8">
                  <h2>zfinger</h2>
                </div>
                <div className="header-right col-md-2">
                  <a href="#" className="primary-action" onTouchTap={() => this.setState({open: true})}>Upload</a>
                </div>
              </div>
            </div>
          </header>
          <div id="content">
            <Upload
              open={open}
              uploadClose={() => this.setState({open: false})}
              doUpload={this.doUpload}
              fileChange={this.fileChange}
            />
            
            <form onSubmit={this.doSearch}>
                <TextField
                      hintText="Search"
                      inputStyle={{boxShadow: 'none'}}
                      onChange={(e, value) => this.setState({text: value})}
                      fullWidth={true} />
            </form>

            {results.map(result => <UserCard {...result} />)}

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

function Upload(props) {
  const {open, uploadClose, doUpload, fileChange, textChange} = props
  return (<Dialog
    open={open}
    title="Upload a new image"
    actions={[<FlatButton label="Cancel" onTouchTap={uploadClose} />,
              <RaisedButton label="Upload" primary={true} onTouchTap={doUpload} />]}
    onRequestClose={uploadClose}>
    <RaisedButton
      fullWidth={true}
      containerElement='label'
      label='Select file'>
        <input 
          type="file"
          style={{display: 'none'}}
          onChange={fileChange}
        />
    </RaisedButton>
  </Dialog>)
}

export default Main
