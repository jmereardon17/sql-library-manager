'use strict';
const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = (sequelize) => {
  class Book extends Sequelize.Model {
    publishedAt = () => moment(this.createdAt).format('DD MMMM YYYY [at] h:mmA');
  }

  Book.init({
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Title is required'
        }
      }
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Author is required'
        }
      }
    },
    genre: Sequelize.STRING,
    year: {
      type: Sequelize.INTEGER,
      validate: {
        isInt: {
          msg: 'Year must be a number'
        }
      }
    },
  }, { sequelize });

  return Book;
};