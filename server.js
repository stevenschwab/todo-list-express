const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const PORT = 3000;
require('dotenv').config();

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

MongoClient.connect(dbConnectionStr, {useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    .catch(error => console.error(error))

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (request, response)=>{
    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments(
        {completed: false}
    )
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
})

app.post('/addTodo', (request, response) => {
    db.collection('todos').insertOne({
        todoItem: request.body.todoItem,
        completed: false
    })
    .then(result => {
        console.log('Todo Item Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne(
        {
            todoItem: request.body.itemFromJS
        },
        {
            $set: {
                completed: true
            }
        },
        {
            sort: {_id: -1},
            upsert: false
        }
    )
    .then(result => {
        console.log('Todo Item Marked Completed')
        response.json('Todo Item Marked Completed')
    })
    .catch(error => console.error(error))
})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne(
        {
            todoItem: request.body.itemFromJS
        },
        {
            $set: {
                completed: false
            }
        },
        {
            sort: {_id: -1},
            upsert: false
        }
    )
    .then(result => {
        console.log('Todo Item Marked UnCompleted')
        response.json('Todo Item Marked UnCompleted')
    })
    .catch(error => console.error(error))
})

app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({
        todoItem: request.body.itemFromJS
    })
    .then(result => {
        console.log('Todo Item Deleted')
        response.json('Todo Item Deleted')
    })
    .catch(error => console.error(error))
})

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`);
})