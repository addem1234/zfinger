/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react'

import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import { cyan } from 'material-ui/colors'

import Upload from './Upload'
import UserCard from './UserCard'

const muiTheme = createMuiTheme({
  palette: {
    primary: cyan
  }
})

class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      uid: '',
      personal: false,
      token: window.location.search.substr(1).split('=')[1],
      results: [],
      resultLimit: 10,
      open: false
    }

    fetch('/me')
        .then(res => res.json())
        .then(res => this.setState(res))
        .catch(err => console.log(err))
  }

  doSearch = e => {
      e.preventDefault()
      if(e.target.value.length > 2)
        fetch(`/users/${e.target.value}`)
            .then(res => res.json())
            .then(res => {
              if(res.error) return new Error(res.error)
              else return res
            })
            .then(results => this.setState({results: results || [], resultLimit: 10}))
            .catch(err => console.error(err))
  }

  uploadClose = () => this.setState({open: false})

  render() {
    const { results, uid, resultLimit, token, open, personal } = this.state

    return (
      <MuiThemeProvider theme={muiTheme}>
        <div style={{marginTop: '50px'}}>
          <header>
            <div className='header-inner'>
              <div className='row'>
                <div className='header-left col-md-2'></div>
                <div className='col-md-8'>
                  <h2>zfinger</h2>
                </div>
                <div className='header-right col-md-2'>
                  { uid ? <Button
                    className='primary-action'
                    onClick={() => this.setState({open: true})}>
                    My Face
                  </Button> : false }
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

            <TextField
              autoFocus
              fullWidth={true}
              placeholder='Search'
              inputProps={{style: {boxShadow: 'none', border: 0}}}
              onChange={this.doSearch} />

            {
              results
                .filter((_, i) => i < resultLimit)
                .map(result => <UserCard key={result.uid} {...result} />)
            }

            {
              results.length < resultLimit ? false :
              <Button style={{margin: '0.5%'}}
                      fullWidth={true}
                      onClick={() => this.setState({resultLimit: resultLimit + 10})}>
                Show more
              </Button>
            }

          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App
