
// Import the express in typescript file
import express from 'express';
import sass from 'sass';
import path from 'path';
import bodyParser from 'body-parser';
import HttpResponse from '../shared/response';
import { Status } from '../shared/status';

const app = express();
const port:number = 3000;
 
const filePath = path.join(__dirname, '../', 'public' );
app.use(express.static( filePath ));

const distPath = path.join(__dirname, '../', '../', 'dist' );
app.use('/dist', express.static(distPath));
app.use(bodyParser.json());

app.post('/compilesass', (req, res) => {  
  res.setHeader('Content-Type', 'application/json');

  try {  
    const compiledCssCode = sass.compileString(req.body.code);    
    const responseObject = new HttpResponse(Status.OK, compiledCssCode);
    res.send( responseObject.toJson() );
  } catch( error:any ) {
    const responseObject = new HttpResponse(Status.ERROR, {
      message: error.message,
      name: error.name,
      sassMessage: error.sassMessage,
      sassStack: error.sassStack,
      span: error.span,
      stack: error.stack
    });
    res.send(responseObject.toJson());
  }

});

// Server setup
app.listen(port, () => {
  console.log(`TypeScript with Express http://localhost:${port}/`);
});