const express = require("express");
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express();
const mainRouter = require('./routes/index')


// CORS configuration

app.use(cors({
    origin: 'http://localhost:5173'
  }));

app.use(express.json())
app.use('/api/v1', mainRouter)


app.listen(3000,()=>{
    console.log(`app is running on http//:localhost:${3000}`);
})


