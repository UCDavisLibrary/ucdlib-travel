import serverConfig from "../../serverConfig.js";
import pg from "../../db-models/pg.js";
import fetch from 'node-fetch';

/**
 * @class Hydration
 * @description Utility class for querying the .
 * Does auth.
 */
export default class Hydration {

  constructor(payload = {}){
    this.payload = payload;
 }

 hydrate(keywords){

    const sql = `SELECT`
 }

}
 