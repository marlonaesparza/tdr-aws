const db = require('../connect.js');
const config = require('../config.js');

module.exports = {
  insert: (params) => {
    let query =  `
      INSERT INTO ${config.database.tables[2]} (title, price, url)
      VALUES ('${params.title}', '${params.price}', '${params.url}')
    `;

    return db.queryAsync(query)
    .then((results, fields) => {
      console.log('Success:', results);
      console.log('Success:', fields);
    })
    .catch((error) => {
      console.log('Error:', error);
    });
  }
};
