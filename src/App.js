/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react'
import Methone, { Header } from "methone"
import { Routes, Route, Link, Navigate } from "react-router-dom";

import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'
import Upload from './Upload'
import UserCard from './UserCard'

class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      uid: '',
      personal: false,
      token: window.location.search.substr(1).split('=')[1],
      results: [],
      resultLimit: 10,
      open: false,
      hasAccess: false,
    }

    fetch('/me')
      .then(res => res.json())
      .then(res => {
        this.setState(res)
        fetch(`https://pls.datasektionen.se/api/user/${res.uid}/zfinger`)
        .then(r => r.json())
        .then(r => {
          if (r.contains("search")) this.setState({ hasAccess: true })
        })
      })
      .catch(err => console.log(err))
  }

  doSearch = e => {
    e.preventDefault()
    if (e.target.value.length > 2)
      fetch(`/users/${e.target.value}`)
        .then(res => res.json())
        .then(res => {
          if (res.error) return new Error(res.error)
          else return res
        })
        .then(results => this.setState({ results: results || [], resultLimit: 10 }))
        .catch(err => console.error(err))
  }

  uploadClose = () => this.setState({ open: false })

  render() {
    const { results, uid, resultLimit, token, open, personal, hasAccess } = this.state

    return (
      // <MuiThemeProvider theme={muiTheme}>
      <div style={{ marginTop: '50px' }}>
        <Methone config={{
          system_name: 'zfinger',
          color_scheme: 'cyan',
          links: [
            <Link to="/">Sök</Link>,
            <Link to="/my-face">My face</Link>,
          ]
        }}
        />
        <Header title="zfinger" />
        <div id='content'>
          <Routes>
            <Route path="/" element={
              !hasAccess ?
              <Navigate replace to="/my-face" />
              :
              <>
                <TextField
                  autoFocus
                  fullWidth={true}
                  placeholder='Search'
                  inputProps={{ style: { boxShadow: 'none', border: 0 } }}
                  onChange={this.doSearch} />

                {
                  results
                    .filter((_, i) => i < resultLimit)
                    .map(result => <UserCard key={result.uid} {...result} />)
                }

                {
                  results.length < resultLimit ? false :
                    <Button style={{ margin: '0.5%' }}
                      fullWidth={true}
                      onClick={() => this.setState({ resultLimit: resultLimit + 10 })}>
                      Show more
                    </Button>
                }
              </>
            }
            />
            <Route
              path="/my-face"
              element={
                <>
                  <Button
                    onClick={() => this.setState({ open: true })}
                  >
                    Klicka här för att hantera din profil
                  </Button>
                  <Upload
                    open={open}
                    uid={uid}
                    personal={personal}
                    token={token}
                    uploadClose={this.uploadClose}
                  />
                </>
              }
            />
          </Routes>
        </div>
      </div>
    )
  }
}

export default App
