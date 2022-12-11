const express = require('express');
const morgan = require('morgan');
const app = express();
const fs = require('fs');
const path = require('path');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(morgan('combined', {stream: accessLogStream}));

let topMovies = [

    {
        title: "Avengers",
        director: "Russo Brothers",
    },

    {
        title: "kill Bill",
        director: "Quentin Tarantino",
    },

    {
        title: "Tar",
        director: "Todd Field",
    },

    {
        title: "The Fabelmans",
        director: "Steven Spielberg",
    },

    {
        title: "The Batman",
        director: "Matt Reeves",
    },

    {
        title:"Bros",
        director:"Nicholas Stoller",
    },

    {
        title:"Navalny",
        director:"Daniel Roher",
    },

    {
        title:"Holy Spider",
        director:"Ali Abbasi",
    },

    {
        title:"I Wanna Dance With Somebody",
        director:"Kasi Lemmons",
    },

    {
        title:"Vengeance",
        director:"B. J. Novak",
    }
    
];

app.use(express.static('public'));
app.use(morgan("common"));


app.get("/", (req, res) => {
  res.send("Welcome to my movie app where you can find movies that were the most popular when they came out");
});

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
