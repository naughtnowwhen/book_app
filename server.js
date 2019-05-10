'use strict';

const express = require('express');
const superagent = require('superagent');

const app = express();
const PORT= process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

//set the view engine for templating;
app.set('view engine', 'ejs');

app.get('/', (request, response)=>{
  console.log('getting here');
  response.render('pages/index');
})

app.post('/searches', searchGoogleBooks);


function searchGoogleBooks (request, response) {

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body)
  if (request.body.search[1]=== 'title') {url += `+intitle:${request.body.search[0]}`;}
  if (request.body.search[1] === 'author') {url += `+inauthor:${request.body.search[0]}`;}

  superagent.get(url)
    .then(rawApiBookResponse => rawApiBookResponse.body.items.map(book => new Book(book.volumeInfo)))
    .then(results => console.log(results));
    // response.render('pages/searches/show', {searchResults : results}
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
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = rawBookinfo.title;
  this.author = rawBookinfo.author;
  this.isbn = rawBookinfo.isbn;
  this.description = rawBookinfo.description;
  // this.image_url = rawBookinfo.image_url
  rawBookinfo.image_url ? this.image_url = rawBookinfo.image_url : placeholderImage;
  // console.log(this);
}


// app.post('/contact', (request, response)=>{
//   console.log('', {root: './public'})
// });


app.get('*', (request, response)=>response.status(404).send('This route does not exist'));

app.listen(PORT, ()=> console.log(`Listening on ${PORT}`));
