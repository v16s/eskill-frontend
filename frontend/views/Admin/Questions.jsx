import React from 'react'
import gql from 'graphql-tag'
import { graphql, withApollo } from '@apollo/react-hoc'
import { compose } from 'recompose'
import {
  Paper,
  TextField,
  Fab,
  Modal,
  Backdrop,
  IconButton
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { Dropdown, Table, NewQuestion, EditQuestion } from '../../components'
import { Add, DeleteOutline as Delete } from '@material-ui/icons'

const BRANCHES = gql`
  query Branches {
    branches {
      name
    }
  }
`

const COURSES = gql`
  query Courses($name: String, $branch: String) {
    courses(where: { name: $name, branch: $branch }) {
      name
    }
  }
`
const QUESTIONS = gql`
  query Questions($course: String!) {
    questions(where: { course: $course }) {
      id
      name
      desc
      course
      exp
      opt {
        a
        b
        c
        d
      }
      ans
    }
  }
`
const REMOVE_QUESTION = gql`
  mutation RemoveQuestion($id: String!) {
    removeQuestion(id: $id) {
      id
    }
  }
`
const styles = theme => ({
  paper: {
    width: '100%',
    padding: '0 20px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  input: {
    marginTop: '15px',
    width: '100%'
  },
  heading: {
    textAlign: 'center',
    fontFamily: 'monospace',
    fontWeight: '500'
  },
  button: {
    width: '100%',
    marginTop: '10px'
  },
  padded: {
    padding: '20px'
  },
  icon: {
    color: '#fff',
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    maxWidth: '200px'
  },
  root: {
    display: 'flex',
    justifyContent: 'center',
    overflow: 'auto',
    padding: '20px 0'
  }
})

class Questions extends React.Component {
  state = {
    columns: [
      { title: 'Number', field: 'name' },
      { title: 'Question Title', field: 'admin_id' }
    ],
    data: [],
    show: false,
    courses: [],
    questions: [],
    editQ: false,
    refetch: () => {
      return ''
    }
  }
  show = refetch => {
    this.setState({ show: !this.state.show })
    if (refetch === true) {
      this.onCourseChange(this.state.course, { target: { name: 'course' } })
    }
  }
  editQ = refetch => {
    this.setState({ editQ: !this.state.editQ })
    if (refetch === true) {
      this.onCourseChange(this.state.course, { target: { name: 'course' } })
    }
  }
  add = (newData, table) => {
    return new Promise((resolve, reject) => {
      resolve()
      let newstate = this.state
      newstate[table].data.push(newData)
      this.setState(newstate)

      // newstate[table].data.push(newData)
      // this.setState(newstate)
    })
  }
  update = (newData, oldData, table) => {
    return new Promise((resolve, reject) => {
      resolve()
      let newstate = this.state
      newstate[table].data[newstate[table].data.indexOf(oldData)] = newData
      this.setState(newstate)
    })
  }
  delete = (oldData, table) => {
    return new Promise((resolve, reject) => {
      resolve()
      let newstate = this.state
      newstate[table].data.splice(newstate[table].data.indexOf(oldData), 1)
      this.setState(newstate)
    })
  }

  onDropdownChange = (value, e) => {
    let newstate = this.state
    newstate[e.name] = value
    let { client } = this.props
    client
      .query({
        query: COURSES,
        variables: { branch: value.value }
      })
      .then(({ data }) => {
        this.setState({ courses: data.courses })
      })
    this.setState(newstate)
  }
  onCourseChange = (value, e) => {
    let newstate = this.state
    newstate[e.name] = value
    let { client } = this.props
    client
      .query({
        query: QUESTIONS,
        variables: { course: value.value },
        fetchPolicy: 'network-only'
      })
      .then(({ data: { questions }, refetch }) => {
        this.setState({ questions, refetch })
      })
    this.setState(newstate)
  }
  editQuestion = (e, rowData) => {
    this.setState({ question: rowData, editQ: true })
  }
  columns = [
    { title: 'ID', field: 'id' },
    { title: 'Title', field: 'name' },
    {
      title: 'Remove',
      render: ({ id }) => (
        <IconButton
          style={{
            color: '#fff'
          }}
          onClick={e => {
            e.preventDefault()
            this.removeQuestion(id)
          }}
          color='secondary'
          aria-label='Delete'
        >
          <Delete />
        </IconButton>
      ),
      disableClick: true
    }
  ]
  removeQuestion = id => {
    this.props.removeQuestion({ variables: { id } }).then(({ data }) => {
      this.setState({ questions: this.state.questions.filter(d => d.id != id) })
    })
  }
  render () {
    const { classes } = this.props
    let branches = []
    if (this.props.branches.branches) {
      branches = this.props.branches.branches.map(d => ({
        label: d.name,
        value: d.name
      }))
    }
    const courses = [
      ...new Set(
        this.state.courses.map(d => ({
          label: d.name,
          value: d.name
        }))
      )
    ]
    const { questions } = this.state
    return (
      <div>
        <div
          style={{
            display: 'flex'
          }}
          className={classes.padded}
        >
          <Paper className={classes.paper}>
            <Dropdown
              className={classes.input}
              options={branches}
              onChange={this.onDropdownChange}
              label='Branch'
              name='branch'
            />
            <Dropdown
              className={classes.input}
              options={courses}
              onChange={this.onCourseChange}
              label='Course'
              name='course'
            />
            <div className={classes.padded}>
              {questions.length > 0 && (
                <Table
                  data={questions}
                  columns={this.columns}
                  table='questions'
                  title={this.state.course.value}
                  style={{ boxShadow: 'none' }}
                  uneditable
                  onRowClick={this.editQuestion}
                />
              )}
            </div>
            {!this.state.show && (
              <Fab
                className={classes.icon}
                onClick={this.show}
                variant='extended'
                color='primary'
                aria-label='Add'
              >
                <Add />
                New Question
              </Fab>
            )}
            <Modal
              className={classes.root}
              open={this.state.show}
              onClose={this.show}
            >
              <NewQuestion close={this.show} branches={branches} />
            </Modal>
            {this.state.editQ && (
              <Modal
                className={classes.root}
                open={this.state.editQ}
                onClose={this.editQ}
              >
                <EditQuestion
                  close={this.editQ}
                  branches={branches}
                  question={this.state.question}
                />
              </Modal>
            )}
          </Paper>
        </div>
      </div>
    )
  }
}
export default compose(
  withApollo,
  graphql(BRANCHES, {
    name: 'branches',
    options: { fetchPolicy: 'network-only' }
  }),
  graphql(REMOVE_QUESTION, { name: 'removeQuestion' })
)(withStyles(styles)(Questions))
