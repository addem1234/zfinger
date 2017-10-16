import React, {Component} from 'react'

import Card, { CardContent, CardMedia } from 'material-ui/Card';
import Typography from 'material-ui/Typography';

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

    const width = window.innerWidth < 768 ? '100' : '32'

    return (
      <span>
        <Card
          style={{width: width + '%', display: 'inline-block', margin: '0.5%', position: 'relative'}}
          onClick={() => this.setState({display: 'flex'})}>
          <CardMedia
            image={`/user/${uid}/image`}
            alt={uid}
            style={{ height: width + 'vw', overflow: 'hidden', cursor: 'pointer'}}>
          </CardMedia>
          <CardContent style={{
              boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
              position: 'absolute',
              left: '0',
              right: '0',
              bottom: '0' }}>
            <Typography type="title" style={{margin: 0}}>
              {cn}
            </Typography>
            <Typography type="body1" color="secondary">
              {uid + '@kth.se'}
            </Typography>
          </CardContent>
        </Card>
        <div
          style={{
            display,
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1500,
            width: '100%',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={overlayClick} >
          <img
            src={`/user/${uid}/image`}
            alt={uid}
            style={{marginTop: '10px', maxWidth: '95vw', maxHeight: '95vh'}} />
        </div>
      </span>)
  }
}

export default UserCard
