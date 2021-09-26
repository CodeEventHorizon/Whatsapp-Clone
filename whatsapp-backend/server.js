// importing
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

//user: admin
//pass: xUl56H4zcBdkewaS
// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1272546",
    key: "42f3705babead6ac3701",
    secret: "d5e56f98686496cb5f3a",
    cluster: "eu",
    useTLS: true
});

// middleware
app.use(express.json());
app.use(cors());
//non-production (look into security for messages)
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "*");
//     next();
// })

// DB config
const connection_url = 'mongodb+srv://admin:xUl56H4zcBdkewaS@cluster0.fzh56.mongodb.net/whatsappdb?retryWrites=true&w=majority'
mongoose.connect(connection_url);
//Mongoose 6.0>
/**
 * useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are no longer supported options. 
 * Mongoose 6 always behaves as if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true, and useFindAndModify is false
 */

const db = mongoose.connection

db.once('open', () => {
    console.log('DB connected');

    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log("A Change occured", change);

        if(change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
                {
                    name: messageDetails.name,
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    received: messageDetails.received
                }
            );
        } else {
            console.log("Error triggering Pusher");
        }
    })
})

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