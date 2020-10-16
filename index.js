const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('serviceImage'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eyoad.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const servicesCollection = client.db('creativeAgency').collection('services');
  const orderCollection = client.db('creativeAgency').collection('orders');
  const reviewCollection = client.db('creativeAgency').collection('reviews');
  const adminCollection = client.db('creativeAgency').collection('admins');

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;

    const newImg = req.files.file.data;
    const encodedImg = newImg.toString('base64');

    const image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encodedImg, 'base64'),
    };
    // res.send({ fileName: file.name, path: `/${file.name}` });
    servicesCollection
      .insertOne({ name, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get('/getAllServices', (req, res) => {
    servicesCollection
      .find({})
      .limit(3)
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get('/getService/:id', (req, res) => {
    servicesCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  app.post('/addOrder', (req, res) => {
    orderCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get('/getAllUserServices/:email', (req, res) => {
    orderCollection
      .find({ email: req.params.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get('/getAllOrders', (req, res) => {
    orderCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.patch('/updateOrder/:id', (req, res) => {
    orderCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: { status: req.body.status },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });

  app.post('/addReview', (req, res) => {
    reviewCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get('/getAllReview', (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //MAKE AN ADMIN
  app.post('/makeAnAdmin', (req, res) => {
    adminCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post('/isAdmin', (req, res) => {
    adminCollection
      .find({ email: req.body.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
  console.log('connected');
});

app.get('/', (req, res) => {
  res.send('Hello from the other side');
});

app.listen(PORT, () => {
  console.log('Listening.....');
});
