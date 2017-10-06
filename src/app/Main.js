/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react'

import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {cyan400, cyan500} from 'material-ui/styles/colors'

import Upload from './Upload'
import UserCard from './UserCard'

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
      uid: '',
      personal: false,
      token: location.search.substr(1).split('=')[1],
      text: '',
      results: [],
      resultLimit: 10,
      open: false
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

  uploadClose = () => this.setState({open: false})

  render() {
    const { results, uid, resultLimit, token, open, personal } = this.state
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
              uid={uid}
              personal={personal}
              token={token}
              uploadClose={this.uploadClose} />

            <form onSubmit={this.doSearch}>
                <TextField
                  hintText='Search'
                  inputStyle={{boxShadow: 'none'}}
                  onChange={(e, value) => this.setState({text: value})}
                  fullWidth={true} />
            </form>

            {
              results
                .filter((_, i) => i < resultLimit)
                .map(result => <UserCard key={result.uid} {...result} />)
            }

            {
              results.length < resultLimit ? false :
              <RaisedButton label='Show more'
                            fullWidth={true}
                            style={{margin: '0.5%'}}
                            onClick={() => this.setState({resultLimit: resultLimit + 10})} />
            }

          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default Main
