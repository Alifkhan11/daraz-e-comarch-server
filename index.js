const express=require('express')
const cors=require('cors')
const app = express()
const port= process.env.PORT || 5000
require("dotenv").config();

app.use(cors())
app.use(express.json())


app.get('/',(req,res)=>{
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


    app.get("/all-products",async(req,res)=>{
        const page=req.query.page
        const size=parseInt(req.query.size)
        const query={}
        const resualt= await allproducts.find(query).skip(page*size).limit(size).toArray()//.sort({price:1})
        const count= await allproducts.estimatedDocumentCount()
        res.send({resualt,count})
    })


    app.get("/catagories",async(req,res)=>{
      const query={}
      const resualt=await allproducts.find(query).toArray()
      res.send(resualt)
    })

    app.get("/catagorie-lod-data/:categoryname",async(req,res)=>{
      const category=req.params.categoryname
      const query={category:category}
      console.log(category);
      const resualt=await allproducts.find(query).toArray()
      res.send(resualt)
    })


    app.get("/productdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const resualt = await allproducts.findOne(query);
      res.send(resualt);
    });


  } finally {

  }
}
run().catch(console.dir);



app.listen(port,()=>{
    console.log(`Node server running ..................port ${port}`)
})