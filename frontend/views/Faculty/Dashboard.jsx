import React from 'react'
import gql from 'graphql-tag'
import { compose, graphql } from 'react-apollo'
import { withStyles } from '@material-ui/styles'
import { Grid, LinearProgress, IconButton } from '@material-ui/core'
import { DeleteForever } from '@material-ui/icons'
import { StudentProgressTable } from '../../components'
const styles = theme => ({
  root: {
    display: 'flex',
    color: theme.palette.text.primary,
    padding: '30px'
  }
})

class Dashboard extends React.Component {
  state = {
    show: false
  }
  close = () => {
    this.setState({ show: !this.state.show })
  }
  render () {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Grid container spacing={3} style={{ height: 'auto' }}>
          accept-reject table
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(Dashboard)
