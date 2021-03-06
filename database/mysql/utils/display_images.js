const db = require('../connect.js');
const config = require('../config.js');

module.exports = {
  insert: (params) => {
    let query =  `
      INSERT INTO ${config.database.tables[1]} (urls)
      VALUES ('[${params.urls.map((url) => '"' + url + '"')}]')
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
