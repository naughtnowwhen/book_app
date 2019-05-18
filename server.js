'use strict';
//Application Dependencies

//data\books.sql
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();
const bodyParser = require('body-parser');

//Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
const methodOverride = require('method-override');


//Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(methodOverride((request, response)=> {
  console.log(request.body);
  console.log('hitting');
  if(request.body && typeof request.body === 'object' && '_method' in request.body){
    let method = request.body['_method'];
    delete request.body['_method'];
    return method;//returns PUT, POST, GET or DELETE
  }
}))



//Database setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err=> console.error(err));

//set the view engine for server side templating;
app.set('view engine', 'ejs');


//API Routes
//Renders the search form



app.get('/', (request, response) => {
  //   //console.log('getting here');
  response.render('pages/index');
})

app.get('/books/:book_id', getOneBook);
app.get('/allstoredbooks', getAllStoredBooks);


//Creates a new search to the Google Books API
app.get('/prepareToSearchFromAPI', showTheSearchForm);
app.post('/searches', searchGoogleBooks);


app.get('/add', showBook);
app.post('/add', addBook);

app.post('/displayOne', displayOnePost);
app.put('/update/:book_id', updateBook);
//for testing only!
// app.post('/update/:book_id', updateBook);

app.delete('/delete/:book_id', deleteBook);
app.get('/deleteAll', deleteAll);

function displayOnePost (req, res) {
  //however here its breaking, the json is being broken up into bits on the url's = characters!
  console.log(req.body);
  // console.log(Object.keys(req.body)[0]);
  // console.log(req.body);
  // console.log(req.body.heresYourbook);
}


function searchGoogleBooks(request, response) {

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(rawApiBookResponse => rawApiBookResponse.body.items.map(book => new Book(book.volumeInfo)))
    .then(results => {
      response.render('pages/searches/showSeveral', {formAction : 'post', searchResults: results})})
    .catch(err => handleError(err, response))
}

//some comment so i can pr;

//what our constructor needs
//title
//author
//isbn
//description
//image url
//bookshelf name

//our book constructor (is this a helper function?)
function Book(rawBookinfo) {

  this.title = rawBookinfo.title ? rawBookinfo.title : 'No title Available';
  this.author = rawBookinfo.authors ? rawBookinfo.authors[0] : 'Unkown';
  //we probably need to put back isbn;
  this.description = rawBookinfo.description ? rawBookinfo.description : 'No description available';
  this.image_url = rawBookinfo.imageLinks ? rawBookinfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  rawBookinfo.industryIdentifiers[0].identifier ? this.ISBN_13 = rawBookinfo.industryIdentifiers[0].identifier : 'isbn unavailable';
  if (this.image_url[4] === ':'){
    this.image_url = this.image_url.replace('http', 'https');
  }
}

function addBook (request, response) {
  let {title, author, description, image_url, ISBN_13} = request.body;
  let SQL = 'INSERT INTO books (title, author, description, image_url, ISBN_13) VALUES ($1,$2,$3,$4,$5);';
  let values = [title, author, description, image_url, ISBN_13];
  return client.query(SQL, values)
    .then(result=>{
      SQL = 'SELECT * from books WHERE ISBN_13=$1';
      values=[ISBN_13];
      return client.query(SQL, values)
        .then (resultNext => {
          return response.render('pages/books/showOne', {book: resultNext.rows[0]})
        })


      //reaching a stopping point will come back
      // response.render('/pages/');
    })
    .catch(err=>handleError(err,response));
}

function showBook(request,response){
  response.render('pages/show', {book : request.body});
}

function getOneBook (request, response) {
  let SQL = `SELECT * FROM books where id=$1;`;
  let values = [request.params.book_id];
  return client.query(SQL,values)
    .then(result=> {
      return response.render('pages/books/showOne', {book : result.rows[0]});
    })
    .catch(err => handleError(err, response));
}

function showTheSearchForm (request, response) {
  response.render('pages/searches/new');
}

function getAllStoredBooks(request, response) {
  let SQL = `SELECT * FROM books`;
  return client.query(SQL)
    .then(result=>{
      if (result.rows.length > 0) {
        return response.render('pages/searches/allSavedBooks', {databaseResults : result.rows})
      }
      else return response.render('pages/searches/allSavedBooks', )
    })
}


function updateBook(request, response){
  let{title, author, description,image_url, ISBN_13} = request.body;
  let SQL = `UPDATE books SET title=$1, author=$2, description=$3, image_url=$4, ISBN_13=$5 WHERE id=$6;`;
  let values = [title, author, description,image_url , ISBN_13, request.params.book_id];
  console.log('stop here');
  client.query(SQL, values)
    .then(response.redirect(`/books/${request.params.book_id}`))
    .catch(err => handleError(err, response));
}

function deleteBook (request, response) {
  let SQL = 'DELETE FROM books where id=$1;';
  let values = [request.params.book_id];
  return client.query(SQL, values)
    .then(deleted => {
      SQL = 'SELECT * FROM books;';
      client.query(SQL)
        .then(resultNext => {
          response.render(`pages/searches/allSavedBooks`, {databaseResults : resultNext.rows})
            .catch(err => handleError(err))
        })
    })
}

function deleteAll (request, response){
  let SQL = 'DELETE FROM books';
  client.query(SQL)
    .then(results=>{
      response.render('pages/searches/allSavedBooks'), {databaseResults : results.rows}
    })
}

// app.post('/contact', (request, response)=>{
//   console.log('', {root: './public'})
// });

//catch-all


function handleError(error, response){
  console.error(error);
  // response.render('pages/error/', {error: 'Something went wrong'});
}

app.get('*', (request, response)=>response.status(404).send('This route does not exist'));


app.listen(PORT, ()=> console.log(`Listening on ${PORT}`));

