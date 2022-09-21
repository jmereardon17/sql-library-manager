const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const { Op } = require('sequelize');

// Async handler to wrap each route
const asyncHandler = cb => async (req, res, next) => {
  try {
    await cb(req, res, next);
  } catch (error) {
    next(error); // Pass error to global error handler
  }
}

const createError = (status) => {
  console.log('create error fired');
  const error = new Error();
  error.status = status;
  throw error;
}

/* GET home page. */
router.get('/', (req, res) => res.redirect('/books'));

/* GET books */
router.get('/books', async (req, res) => {
  let books = await Book.findAll({ order: [ ['year', 'DESC'] ] });
  const perPage = 9;
  const pageNumbers = Math.ceil(books.length / perPage);

  req.query.page
    ? books = books.slice((req.query.page * perPage) - perPage, req.query.page * perPage)
    : books = books.slice(0, perPage);

  res.render('index', { books, page: 1, perPage, pageNumbers });
});

/* POST books */
router.post('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${req.body.search}%` } },
        { author: { [Op.like]: `%${req.body.search}%` } },
        { genre: { [Op.like]: `%${req.body.search}%` } },
        { year: { [Op.like]: `%${req.body.search}%` } }
      ]
    },
    order: [
      ['year', 'DESC']
    ]
  });
 
  res.render('index', { books });
}));

/* GET new book */
router.get('/books/new', (req, res) => res.render('new-book'));

/* POST new book */
router.post('/books/new', asyncHandler(async (req, res) => {
  let book;

  try {
    book = await Book.create(req.body);
    res.redirect('/books');
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('new-book', { book, errors: error.errors });
    } else {
      createError(500);
    }
  }
}));

/* GET book */
router.get('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  book ? res.render(`update-book`, { book }) : createError(404);
}));

/* POST edit book */
router.post('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);

  if (book) {
    await book.update(req.body);
    res.redirect('/books');
  } else {
    createError(404);
  }
}));

/* POST delete book */
router.post('/books/:id/delete', async (req, res) => {
  const book = await Book.findByPk(req.params.id);

  if (book) {
    await book.destroy();
    res.redirect('/books');
  } else {
    createError(404);
  }
});

module.exports = router;
