const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(bodyParser.json());

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.hfj5m.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log(err ? err.errmsg : 'Database Connected!')
    const productsCollection = client.db(DB_NAME).collection("products");
    const ordersCollection = client.db(DB_NAME).collection("orders");

    app.get('/products', (req, res) => {
        productsCollection.find({})
            .toArray((error, result) => {
                res.send(result)
            })
    })

    app.get('/product/:id', (req, res) => {
        productsCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((error, result) => {
                res.send(result[0])
            })
    })


    // Post
    app.post('/addProduct', (req, res) => {
        const newProduct = req.body;
        productsCollection.insertOne(newProduct)
            .then(result => {
                res.send({ isAdded: result.insertedCount > 0 })
            })
            .catch(error => {
                res.send({ isError: true, errorMsg: 'Something went wrong' })
            })
    })

    app.delete('/delete/:id', (req, res) => {
        productsCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send({
                    isDeleted: result.deletedCount > 0
                })
            })
            .catch(error => res.send({ isError: true, errorMsg: 'Something went wrong' }))
    })

    app.post('/newOrder', (req, res) => {
        const newOrder = req.body;
        ordersCollection.insertOne(newOrder)
            .then(result => {
                res.send({ isAdded: result.insertedCount > 0 })
            })
            .catch(error => {
                res.send({ isError: true, errorMsg: 'Something went wrong' })
            })
    })

    app.get('/orders', (req, res) => {
        const { email } = req.headers;
        ordersCollection.find({ email })
            .toArray((error, result) => {
                res.send(result)
            })
    })

});


app.listen(PORT, () => console.log(`Server Running on http://loacalhost:${PORT}`));