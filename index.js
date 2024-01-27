const express = require('express')
const cors = require('cors')
const app = express()
const stripe = require('stripe')('sk_test_51NrtkkG1p3nVEVTLXr7tNcRtVojRV6Frog35vZNy8mAXnbWl2Dvr7FWzD3gwgriuJTS0EPfJz3gusnSZTJDvmDTg00n2mjxZBv')
// const stripe = require('stripe')(process.env.STRIP_SK)
const port = process.env.PORT || 5000
require("dotenv").config();

app.use(cors())
app.use(express.json())

// console.log(process.env.STRIP_SK);

app.get('/', (req, res) => {
  res.send('Node server running ..................')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.m6hhp6r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});




async function run() {
  try {

    const allproducts = client.db("khan-market").collection("all-products");
    const paymentCollection = client.db("khan-market").collection("payments");
    const usersCollection = client.db("khan-market").collection("users");
    const cartCollection = client.db("khan-market").collection("addcart");


    app.get("/all-products", async (req, res) => {
      const page = req.query.page
      const size = parseInt(req.query.size)
      const query = {}
      const resualt = await allproducts.find(query).skip(page * size).limit(size).toArray()//.sort({price:1})
      const count = await allproducts.estimatedDocumentCount()
      res.send({ resualt, count })
    })


    app.get("/catagories", async (req, res) => {
      const query = {}
      const resualt = await allproducts.find(query).toArray()
      res.send(resualt)
    })

    app.get("/catagorie-lod-data/:categoryname", async (req, res) => {
      const category = req.params.categoryname
      const query = { category: category }
      // console.log(category);
      const resualt = await allproducts.find(query).toArray()
      res.send(resualt)
    })


    app.get("/productdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const resualt = await allproducts.findOne(query);
      res.send(resualt);
    });

     app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.totalprice;
            const amount = price * 100;
            const paymentIntent =  await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
            // console.log(paymentIntent.client_secret);
        });

         app.post('/payments', async (req, res) =>{
            const payment = req.body;
            // console.log(payment);
            const result = await paymentCollection.insertOne(payment);
            // const id = payment.bookingId
            // const filter = {_id: ObjectId(id)}
            // const updatedDoc = {
            //     $set: {
            //         paid: true,
            //         transactionId: payment.transactionId
            //     }
            // }
            // const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })
         app.get('/myorder', async (req, res) =>{
            const query={}
            const result = await paymentCollection.find(query).toArray()
            res.send(result);
        })

        app.post('/users',async(req,res)=>{
          const user=req.body
          console.log(user);
          const resualt= await usersCollection.insertOne(user)
          res.send(resualt)
        })
        app.get('/users',async(req,res)=>{
          const query={}
          const resualt=await usersCollection.find(query).toArray()
          res.send(resualt)
        })
        app.put('/usersadd',async(req,res)=>{
          const query={}
          const resualt=await usersCollection.find(query).toArray()
          res.send(resualt)
        })
        app.post('/cart',async(req,res)=>{
          const data=req.body
          console.log(data);
          const resualt= await cartCollection.insertOne(data)
          res.send(resualt)
        })
        app.get('/cart',async(req,res)=>{
          const query={}
          const resualt= await cartCollection.find(query).toArray()
          res.send(resualt)
        })



  } finally {

  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Node server running ..................port ${port}`)
})