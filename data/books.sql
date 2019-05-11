DROP TABLE IF EXISTS books;
CREATE TABLE books ( 
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  authors VARCHAR(255),
  description VARCHAR(255),
  image_url VARCHAR(255),
  ISBN_13 VARCHAR(255),
  bookshelf VARCHAR(255)
);

INSERT INTO books ( title, authors, description, image_url, ISBN_13, bookshelf)
VALUES('peme', 'peter', 'javascript', 'none', 'isbn-34', 'one'),
('saturday', 'meron', 'database', 'notavail', 'isbn-25', 'two');