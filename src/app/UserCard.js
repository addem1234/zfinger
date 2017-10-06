import React, {Component} from 'react'

import {Card, CardMedia, CardTitle} from 'material-ui/Card'

export class UserCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      expanded: false
    }
  }

  render() {
    const {cn, uid} = this.props
    const {expanded} = this.state

    return (
      <Card style={{width: '32%', display: 'inline-block', margin: '0.5%'}}
        onClick={() => this.setState({expanded: !expanded})}>
        <CardMedia
          style={ !expanded ? { height: '350px', overflow: 'hidden'} : false}>
          <img src={`/user/${uid}/image`} style={{cursor: 'pointer'}} />
        </CardMedia>
        <CardTitle title={cn} subtitle={uid + '@kth.se'} />

      </Card>)
  }
}

export default UserCard
