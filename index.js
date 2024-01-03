const express=require('express')
const app = express()
const port= process.env.PORT || 5000
require("dotenv").config();

app.get('/',(req,res)=>{
    res.send('Node server running ..................')
})


const { MongoClient, ServerApiVersion } = require('mongodb');
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


    app.get("/all-products",async(req,res)=>{
        const query={}
        const resualt=await allproducts.find(query).toArray()
        res.send(resualt)
    })

  } finally {

  }
}
run().catch(console.dir);



app.listen(port,()=>{
    console.log(`Node server running ..................port ${port}`)
})