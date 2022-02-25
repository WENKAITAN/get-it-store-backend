require('dotenv').config()
const { sequelize, User, Product, Order } = require('./models')
const db = require('./models');
const express = require('express');
const expressSession = require('express-session');
const passport = require('./middlewares/authentication');
const index = require('./routes/index');
const user = require('./routes/user');
const product = require('./routes/product');
const auth = require('./auth');
const cors = require('cors')
var morgan = require('morgan')
const path = require('path');
const app = express();
app.use(cors())
const port = process.env.PORT || 8000;
// if(process.env.NODE_ENV==='production') {
//   app.use(express.static(path.join(__dirname, 'build')));

//   // all unknown routes should be handed to our react app
//   app.get('*', function (req, res) {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
//   });
// }
app.use(express.json());
// add http request logging to help us debug and audit app use
const logFormat = process.env.NODE_ENV==='production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// setup passport and session cookies
app.use(expressSession({
    secret: "keyboard_cat",
    resave: false,
    saveUninitialized: true
  }));
app.use(passport.initialize());
app.use(passport.session());


const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc')

app.use('/api/', index);
app.use('/api/user', user);
app.use('/api/product', product);
app.use('/api/auth', auth);

app.post('/api/create-checkout-session', async (req, res) => {
  const {line_items, email}  = req.body;
  // console.log(line_items);
  let products = [];
  for (let i = 0; i < line_items.length; i++) {
    const item = line_items[i];
    let product = {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: item.price*100,
      },
      quantity: parseInt(item.quantity),
    }
    products.push(product)
  }
  const session = await stripe.checkout.sessions.create({
    line_items: products,
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
  });

  res.json({url: session.url});
});


// error handler
app.use(function(err, req, res, next) {
  
    // render the error page
    res.status(err.status || 500);
    return res.json({
        message: err.message,
        error: req.app.get('env') === 'development' ? err : {},
    })
  });

app.listen(port, async() => {
    console.log(`Server up on http://localhost:${port}`);
    await sequelize.authenticate();
    console.log("Database connected")
})