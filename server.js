const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('TodoList Server is Running')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@database.1n8y8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const todoList = client.db(`${process.env.DB_NAME}`).collection("TodoList");

  app.get('/todoList', (req, res) => {
    todoList.find({})
      .toArray((err, docs) => {
        res.send(docs.reverse())
      })
  })

  app.post('/addTodo', (req, res) => {
    const todo = req.body;
    todoList.insertOne(todo)
      .then(result => {
        if (result.insertedCount > 0) {
          res.send(req.body);
        }
      })
  })

  app.patch('/update/:id', (req, res) => {
    todoList.updateOne(
      { _id: ObjectId(req.params.id) },
      {
        $set: req.body
      }
    ).then(result => {
      res.send(result.modifiedCount > 0)
    })
  })

  app.delete('/delete/:id', (req, res) => {
    todoList.deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        res.send(result.deletedCount > 0)
      })
  })

  app.patch('/completedTodo/:id', (req, res) => {
    const { text, isComplete } = req.body;
    todoList.updateOne(
      { _id: ObjectId(req.params.id) },
      {
        $set: { text: text, isComplete: isComplete }
      }
    ).then(result => {
      res.send(result.modifiedCount > 0)
    })
  })
});


app.listen(port);