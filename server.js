'use strict';
//Application Dependencies
const express = require('express');
const superagent = require('superagent');

//Application Setup
const app = express();
const PORT= process.env.PORT || 3000;

//Application Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

//set the view engine for server side templating;
app.set('view engine', 'ejs');


//API Routes
//Renders the search form

app.get('/', (request, response)=>{
//   //console.log('getting here');
 response.render('pages/index');
 })
 
//Creates a new search to the Google Books API
app.post('/searches', searchGoogleBooks);




function searchGoogleBooks (request, response) {

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body)
  if (request.body.search[1]=== 'title') {url += `+intitle:${request.body.search[0]}`;}
  if (request.body.search[1] === 'author') {url += `+inauthor:${request.body.search[0]}`;}

  superagent.get(url)
    .then(rawApiBookResponse => rawApiBookResponse.body.items.map(book => new Book(book.volumeInfo)))
    .then(results => response.render('pages/searches/show', {searchResults : results}))
  }


//what our constructor needs
//title 
//author 
//isbn 
//description 
//image url 
//bookshelf name

//our book constructor (is this a helper function?)
function Book(rawBookinfo) {
  
  this.title = rawBookinfo.title ? rawBookinfo.title: 'No title Available'
  this.authors = rawBookinfo.authors ? rawBookinfo.authors.join(',') : 'Unkown'
  
  this.description = rawBookinfo.description ? rawBookinfo.description : 'No description available'
  this.image_url = rawBookinfo.imageLinks ? rawBookinfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg'
 // rawBookinfo.image_url ? this.image_url = rawBookinfo.image_url : placeholderImage;
  // console.log(this);
}


// app.post('/contact', (request, response)=>{
//   console.log('', {root: './public'})
// });

//catch-all

function handleError(error, response){
  response.render('pages/error/', {error: 'Something went wrong'});
}

app.get('*', (request, response)=>response.status(404).send('This route does not exist'));


app.listen(PORT, ()=> console.log(`Listening on ${PORT}`));
