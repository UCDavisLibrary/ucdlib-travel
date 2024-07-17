import serverConfig from "../../serverConfig.js";
import pg from "../../db-models/pg.js";
import fetch from 'node-fetch';

/**
 * @class Hydration
 * @description Utility class for querying the .
 * Does auth.
 */
export default class Hydration {

  constructor(approvalRequest, reimbursementRequest){
    this.approvalRequest = approvalRequest;
    this.reimbursementRequest = reimbursementRequest
  }

_getContext(content){
  

  // extract variables from content string
  const variables = content.split('{{').slice(1).map(x => x.split('}}')[0]);

  // get values from approvalRequest/reimbursmentRequest
  const context = {};
  for (let v of variables) {
    context[v] = this._getVariableFunction(v)
  }
  return context;
}

_getVariableFunction(variable){
  // return method for getting data for variable
  if (variable === 'requesterFirstName') return this._getRequesterFirstName;
  // etc
  return () => {return ''}
}

hydrate(content){
  const context = this._getContext(content);
  return this._evaluateTemplate(content, context);
}

_evaluateTemplate(template, context) {
  const templateFunction = new Function(...Object.keys(context), `return \`${template}\`;`);
  console.log("H:",templateFunction)

  return templateFunction(...Object.values(context));
}

}
 