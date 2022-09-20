const express = require('express');
const path = require('path');
const sequelize = require('./models').sequelize;
const routes = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

app.use((req, res, next) => {
  const err = new Error();
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log('Global error handler fired');
  
  if (err && err.status === 404) {
    res.render('page-not-found')
  } else {
    const error = new Error('Something went wrong on the server');
    error.status = 500;
    res.render('error', { error });
  }
});

(async () => {
  try {
    await sequelize.sync();
    console.log('Database has been synced successfully!');
  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }
})();

module.exports = app;
