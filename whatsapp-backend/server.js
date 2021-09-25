// importing
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';

//user: admin
//pass: xUl56H4zcBdkewaS
// app config
const app = express();
const port = process.env.PORT || 9000;

// middleware
app.use(express.json());

// DB config
const connection_url = 'mongodb+srv://admin:xUl56H4zcBdkewaS@cluster0.fzh56.mongodb.net/whatsappdb?retryWrites=true&w=majority'
mongoose.connect(connection_url);
//Mongoose 6.0>
/**
 * useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are no longer supported options. 
 * Mongoose 6 always behaves as if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true, and useFindAndModify is false
 */

// ????

// API routes
app.get('/', (req, res) => res.status(200).send('hello world'));

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(`new message created: \n ${data}`)
        }
    })
})

// listener
app.listen(port,() => console.log(`Listening on localhost:${port}`));