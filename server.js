//import modules
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require("connect-mongo");

//local imports
const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');
const authController = require('./controllers/auth.js');
const applicationsController = require('./controllers/applications.js')

//set port
const port = process.env.PORT ? process.env.PORT : '3000';

//connect to DB
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

//middleware used through application
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    })
  })
);
app.use(passUserToView);

//homepage
app.get('/', (req, res) => {  
  if(req.session.user){
    res.redirect(`/users/${req.session.user._id}/applications`);
  }else{
    res.render('index.ejs');
  }
  // res.render('index.ejs');
});


//authentication route
app.use('/auth', authController);
//middleware to check if signed in
app.use(isSignedIn)
//user application router
app.use('/users/:userID/applications', applicationsController)
//generic 404 page
app.get('*', (req, res) => {
  res.render('404.ejs') 
})


app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});



// app.get('/vip-lounge', (req, res) => {
//   if (req.session.user) {
//     res.send(`Welcome to the party ${req.session.user.username}.`);
//   } else {
//     res.send('Sorry, no guests allowed.');
//   }
// });