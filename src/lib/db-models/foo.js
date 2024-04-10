import pg from "./pg.js";

/**
 * @description Model for accessing the foo table
 */
class Foo {

  async getAll(){
    let text = `
      SELECT * FROM foo
    `;
    return await pg.query(text);
  }
}

export default new Foo();
