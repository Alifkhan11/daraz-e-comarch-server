const express = require('express')
const cors = require('cors')
const app = express()
const stripe = require('stripe')('sk_test_51NrtkkG1p3nVEVTLXr7tNcRtVojRV6Frog35vZNy8mAXnbWl2Dvr7FWzD3gwgriuJTS0EPfJz3gusnSZTJDvmDTg00n2mjxZBv')
// const stripeapike=process.env.TOKEN_STRIP_KE
// const stripe = require("stripe")(process.env.TOKEN_STRIP_KE)
const port = process.env.PORT || 5000
require("dotenv").config();

app.use(cors())
app.use(express.json())

console.log(process.env.TOKEN_STRIP_KE);

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
    const sellerUserCollection = client.db("khan-market").collection("selleruser");


    app.get("/all-products", async (req, res) => {
      const page = req.query.page
      const size = parseInt(req.query.size)
      const query = {}
      const resualt = await allproducts.find(query).skip(page * size).limit(size).toArray()//.sort({price:1})
      const count = await allproducts.estimatedDocumentCount()
      res.send({ resualt, count })
    })
    app.get("/sellerallproducts/:seller", async (req, res) => {
      const seller = req?.params?.seller
      const query={seller}
      console.log(seller);
      const resualt= await allproducts.find(query).toArray()
      res.send(resualt)
     
    })

    app.post('/all-products',async(req,res)=>{
      const email=req.query.email
      const query={email}
      const selleruser=await sellerUserCollection.findOne(query)
      // console.log(selleruser.role);
      if(selleruser?.role){
        const data=req.body
        // console.log(data);
        const resualt=await allproducts.insertOne(data)
        res.send(resualt)
      }else{
        return res.status(401).send({ message: "forbiden access" });
      }
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
      const paymentIntent = await stripe?.paymentIntents?.create({
        amount: amount,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
      // console.log(paymentIntent.client_secret);
    });

    app.post('/payments', async (req, res) => {
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
    app.get('/myorder', async (req, res) => {
      const email = req.query?.email
      const query = { email: email }
      const user = await usersCollection.findOne(query)
      if (user?.role == 'admin') {
        const query = {}
        const resualt = await paymentCollection.find(query).toArray()
        res.send(resualt)
      } else {
        const result = await paymentCollection.find(query).toArray()
        res.send(result);

      }
    })

    app.post('/users', async (req, res) => {
      const user = req.body
      // console.log(user);
      const resualt = await usersCollection.insertOne(user)
      res.send(resualt)
    })
    app.get('/users', async (req, res) => {
      const query = {}
      const resualt = await usersCollection.find(query).toArray()
      res.send(resualt)
    })
    app.patch('/users/admin/:id', async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      // console.log(user);
      if (user?.role !== "admin") {
        return res.status(401).send({ message: "forbiden access" });
      }
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const option = { upsert: true };
      const updatedoc = {
        $set: {
          role: "admin",
        },
      };
      const resualt = await usersCollection.updateOne(
        filter,
        updatedoc,
        option
      );
      res.send(resualt);

    })

    app.get('/users/admin/:email',async(req,res)=>{
      const email=req.params.email
      const query={email}
      const user=await usersCollection.findOne(query)
      res.send({isAdmin :user?.role === 'admin'})
    })

    app.put('/usersadd', async (req, res) => {
      const query = {}
      const resualt = await usersCollection.find(query).toArray()
      res.send(resualt)
    })
    app.post('/cart', async (req, res) => {
      const data = req.body
      // console.log(data);
      const resualt = await cartCollection.insertOne(data)
      res.send(resualt)
    })
    app.get('/cart', async (req, res) => {
      const email = req.query.email
      // console.log(email);
      const query = { email: email }
      const user = await usersCollection.findOne(query)
      // console.log(user.role);
      if (user?.role) {
        const query = {}
        const resualt = await cartCollection.find(query).toArray()
        res.send(resualt)
      } else {
        const query = { useremail: email }
        const resualt = await cartCollection.find(query).toArray()
        res.send(resualt)
      }
    })

    app.patch('/selleruser',async(req,res)=>{
      const data=req.body
      // console.log(data);
      const resualt=await sellerUserCollection.insertOne(data)
      res.send(resualt)
    })
    app.get('/selleruser/:email',async(req,res)=>{
      const email=req.params.email
      const query={email:email}
      // console.log(query);
      const resualt=await sellerUserCollection.findOne(query)
      res.send(resualt)
    })



  } finally {

  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Node server running ..................port ${port}`)
})