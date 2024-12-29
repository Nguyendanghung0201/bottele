const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig);
const { attachPaginate } = require('knex-paginate');
attachPaginate();

module.exports = knex;