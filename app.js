require('dotenv').config();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer')



// setting up session
app.use(session({ secret: 'criptSea', saveUninitialized: true, resave: true }));


const user = require('./routes/user')
const admin = require('./routes/admin')


app.use((req, res, next) => {

    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next()
})



app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);



app.use('/admin',admin)
app.use('/',user)

const database = process.env.MONGO_URI
mongoose.connect(database, {useUnifiedTopology: true, useNewUrlParser: true })
.then(() => console.log('DB connected'))
.catch(err => console.log(err));





app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'public')))
app.use('/image',express.static(path.join(__dirname,'images')))

app.use('/images',express.static(path.join(__dirname,'productimg')))
// app.use('/assets',express.static(__dirname+'/public/assets'))
app.use(session({ secret: 'criptSea', saveUninitialized: true, resave: true }));

app.all('*',(req,res)=>{
  res.status(404).render('user/404')
})


const PORT = process.env.PORT || 4000;
app.listen(PORT, console.log("Server has started at port " + PORT))
module.exports = app;
