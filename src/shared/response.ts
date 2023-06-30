import { Status } from "./status";

/**
 * Standardized response object for a sass editor
 */
export default class HttpResponse {
  status: Status;
  content: any;

  constructor( status:Status, content:any ) {
    this.status = status;
    this.content = content;
  }

  toJson():string {
    return JSON.stringify({
      status: this.status,
      content: this.content
    })
  }
}
