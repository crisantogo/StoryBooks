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

//Logging
if (process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}

//Handlebars
app.engine('.hbs', exphbs.engine({defaultLayout: 'main', extname: '.hbs'})) //!Change: add '.engine' after exphbs
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




//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))

const PORT = process.env.PORT|| 3000

app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    )

