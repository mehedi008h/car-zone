const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jqqts.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('Connected to database');
        const database = client.db('carZone');
        const carsCollection = database.collection('cars');
        const usersCollection = database.collection('users');
        const orderCollection = database.collection('order');
        const reviewCollection = database.collection('review');

        // app.post('/appointments', async (req, res) => {
        //     const appointment = req.body;
        //     const result = await appointmentsCollection.insertOne(appointment);
        //     res.json(result)
        // });
        // product
        // GET product
        app.get('/product', async (req, res) => {
            const cursor = carsCollection.find({});
            const product = await cursor.toArray();
            res.send(product);
        });

        // get single product
        app.get('/place-order/:id', async (req, res) => {
            const id = req.params.id;
            console.log("Getting single data : ", id);
            const query = { _id: ObjectId(id) };
            const product = await carsCollection.findOne(query);
            res.json(product);
        });

        // add product
        app.post('/product', async (req, res) => {
            const product = req.body;
            console.log("Hit the post api", product);

            const result = await carsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });

        // order
        // get order
        app.get('/manageOrder', async (req, res) => {
            const cursor = orderCollection.find({});
            const order = await cursor.toArray();
            res.send(order);
        });

        // make order
        app.post('/place-order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result)
        });

        // delete order
        // delete order
        app.delete('/manageOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });

        // review
        // add review
        app.post('/addReview', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        });

        // user 

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running server');
});

app.listen(port, () => {
    console.log('Running server on port', port);
})