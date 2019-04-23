const express = require('express')
const handlebars =require('express-handlebars')
const bodyParser = require("body-parser")
const app = express()
const route = require("./routes/routes")  
const path = require('path')  
//files css, js..
app.use(express.static(path.join(__dirname, "public")))
//Body Parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
//Handlebars layout
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars');
//routes
app.use('/', route)
//config server
const PORT = 8000
app.listen(PORT,() => {
    console.log("Servidor rodando")
})
