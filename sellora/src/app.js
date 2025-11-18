import express from 'express';
import mustacheExpress from 'mustache-express';
import bodyParser from 'body-parser';

import router from './router.js';
import './load_data.js';

import fs from 'fs';
import path from 'path';

const app = express();

app.use(express.static('./public'));
app.use('/uploads', express.static('./uploads'));


app.engine('html', mustacheExpress(), ".html");
app.set('view engine', 'html');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: true }));



app.use('/', router);

app.listen(3000, () => console.log('Web ready in http://localhost:3000/'));
