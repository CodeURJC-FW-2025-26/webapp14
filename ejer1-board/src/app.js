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


import * as store from './store.js';

app.get('/', async (req, res) => {
  const products = await store.getProducts();

  res.render('SELLORA', {
    // Header 
    title: "Welcome to SellOra",
    subtitle: "Your Favorite Retro Shop",
    tagline: "Vintage Consoles, Games & More",
    backgroundImage: "/img/HEADER BACKGROUND.jpg",
    homeLink: "/",
    logoSrc: "/img/logo.png",
    navbarText: "- SellOra",
    navItems: [
      { label: "Home", link: "#", active: "active" },
      { label: "Shop", link: "/shop", active: "" },
      { label: "About", link: "/about", active: "" }
    ],

    // Productos desde MongoDB
    products: products,

    // Footer
    year: 2025,
    brand: "SellOra",
    instagram: "https://www.instagram.com/t1lol/",
    twitter: "https://x.com/hideo_kojima_en",
    followUsText: "Follow us on:"
  });
});


app.use('/', router);
app.listen(3000, () => console.log('Web ready in http://localhost:3000/'));
