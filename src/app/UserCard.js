import React, {Component} from 'react'

import {Card, CardMedia, CardTitle} from 'material-ui/Card'

export class UserCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      display: 'none'
    }
  }

  render() {
    const {cn, uid} = this.props
    const {display} = this.state

    const overlayClick = e => {
      e.stopPropagation()
      this.setState({display: 'none'})
    }

    return (
      <span>
        <Card style={{width: '32%', display: 'inline-block', margin: '0.5%', position: 'relative'}}
          onClick={() => this.setState({display: 'block'})}>
          <CardMedia
            style={{ height: '32vw', overflow: 'hidden'}}>
            <img src={`/user/${uid}/image`} style={{cursor: 'pointer'}} />
          </CardMedia>
          <CardTitle style={{ background: '#fff', boxShadow: '0 -2px 5px rgba(0,0,0,0.1)', position: 'absolute', left: '0', right: '0', bottom: '0' }} title={cn} subtitle={uid + '@kth.se'} />
        </Card>
        <div
          style={{
            display,
            textAlign: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1500,
            width: '100%',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={overlayClick} >
          <img
            src={`/user/${uid}/image`}
            style={{marginTop: '10px', maxWidth: '95vw', maxHeight: '95vh'}} />
        </div>
      </span>)
  }
}

export default UserCard
