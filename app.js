const path = require('path')
const express=require('express')
//!Change: Mongoose is no longer required
//const mongoose = require('mongoose')
const dotenv=require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const passport= require('passport')
const session = require('express-session')
//!Change: MongoStore does not require(session)
const MongoStore = require('connect-mongo')//(session)
const connectDB = require('./config/db')

//Load config
dotenv.config({ path: './config/config.env'})

//Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

//Body parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())

//Logging
if (process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}

//Handlebar Helpers
const {formatDate, stripTags, truncate, editIcon, select}=require('./helpers/hbs')

//Handlebars
app.engine('.hbs', exphbs.engine({helpers:{
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
},
defaultLayout: 'main', extname: '.hbs'})) //!Change: add '.engine' after exphbs
app.set('view engine', '.hbs')

//Sessions
app.use(session({
    secret:'keyboard fox',
    resave: false,
    saveUninitialized:false,
    //!Change: MongoStore syntax has changed
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI 
    })
}))

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Set global var
app.use(function (req,res,next){
    res.locals.user=req.user||null
    next()
})



//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT|| 3000

app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    )

