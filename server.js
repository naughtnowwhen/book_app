'use strict';

const express = require('express');

const app = express();
const PORT= process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

//set the view engine for templating;
app.set('view engine', 'ejs');

app.get('/hello', (request, response)=>{
  console.log('getting here');
  response.render('pages/index');
})

// app.post('/contact', (request, response)=>{
//   console.log('', {root: './public'})
// });

app.get('*', (request, response)=>response.status(404).send('This route does not exist'));

app.listen(PORT, ()=> console.log(`Listening on ${PORT}`));
