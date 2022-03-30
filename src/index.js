const express = require('express')
const cors = require('cors')
const { v4: uuid } = require('uuid')

const app = express();

app.use(cors());
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  let userExists
  const {username} = request.headers

  userExists = users.find(user => user.username === username)

  if(!userExists) return response
    .status(404)
    .json({
      error: 'Usuário não cadastrado!'
    })

  request.user = userExists

  return next()
}

app.post('/users', (request, response) => {
  let newUser = request.body

  const userExists = users.find(user => user.username === newUser.username)
  
  if(userExists) return response
    .status(400)
    .json({
      error: 'User already exists!'
    })

  newUser = {
    ...newUser,
    id: uuid(),
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(201).json(user.todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuid(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos[user.todos.length] = todo

  return response.status(201).json(todo)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const {title, deadline} = request.body

  const todoSelected = user.todos.find((todo) => todo.id === id) 

  if (!todoSelected) return response.status(404).json({
    error: "To-do not found!"
  })

  todoSelected.title = title
  todoSelected.deadline = new Date(deadline)
  
  return response.status(201).json(todoSelected)
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todoSelected = user.todos.find((todo) => todo.id === id) 

  if (!todoSelected) return response.status(404).json({
    error: "To-do not found!"
  })
  
  todoSelected.done = !todoSelected.done

  return response.status(201).json(todoSelected)
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const indexTodo = user.todos.findIndex(todo => todo.id === id)

  if (indexTodo === -1) return  response.status(404).json({
    error: "To-do not found!"
  })

  user.todos.splice(indexTodo, 1)

  return response.status(204).json()
})

module.exports = app