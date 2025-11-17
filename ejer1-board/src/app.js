import express from 'express';
import mustacheExpress from 'mustache-express';
import bodyParser from 'body-parser';

import router from './router.js';
import './load_data.js';

import fs from 'fs';
import path from 'path';

const dataPath = path.resolve('./data/data.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const app = express();

app.use(express.static('./public'));

app.set('view engine', 'html');
app.engine('html', mustacheExpress(), ".html");
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.render('SELLORA', {
    // Header 
    title: "Welcome to SellOra",
    subtitle: "Your Favorite Retro Shop",
    tagline: "Vintage Consoles, Games & More",
    backgroundImage: "/img/HEADER BACKGROUND.jpg",
    homeLink: "SELLORA.html",
    logoSrc: "/img/logo.png",
    navbarText: "- SellOra",
    navItems: [
      { label: "Home", link: "#", active: "active" },
      { label: "Shop", link: "/shop", active: "" },
      { label: "About", link: "/about", active: "" },
    ],

    products,

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
