import 'sqlite3';
import knex from 'knex';
// import path from 'node:path';
import { app } from 'electron';
console.log(app, 'e', knex);

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './items.sqlite'
    // filename: path.join(app.getPath('userData'), 'jetsetter-items.sqlite')
  },
  useNullAsDefault: true
});

db.schema.hasTable('items').then((exists) => {
  if (!exists) {
    db.schema.createTable('items', t => {
       t.increments('id').primary();
       t.string('value', 100);
       t.boolean('packed');
   });
}
})

export default db;