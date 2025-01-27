const express = require('express')

const app = express();

app.get("/",(req,res)=>{
    res.send("hello Api");
})
app.get("/api/v1",(req,res) =>{
    res.send("hello from server")
})
app.listen(3000,()=>console.log("server running"));