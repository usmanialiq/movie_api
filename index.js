const express = require('express');
const morgan = require('morgan');
const app = express();
const fs = require('fs');

const path = require('path');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
mongoose.connect('mongodb://localhost:27017/myFlixDB', {
    useNewUrlParser: true, useUnifiedTopology: true});

app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.send("Welcome to my movie app where you can find movies that were the most popular when they came out");
});

//CREATE NEW USERS & USERS ID 
app.post('/users', async (req, res) => {
    try {
        const { UserName, Name, Password, Email, Birthday } = req.body;

        const findUser = await Users.findOne({ UserName });
        if (findUser) {
            throw `${UserName} already exists`;
        }
        const newUser = new Users({
            Name,
            UserName,
            Password,
            Email,
            birthday: Birthday
        });
        const saveUser = await newUser.save();
        if (!saveUser) {
            throw 'Failed to save the user';
        }
        return res.status(201).json(saveUser);
    } catch(error) {
        res.status(400).send('Error: ' + error)
    } 
});

//GET ALL OF THE USERS
app.get('/users', (req, res) => {
    Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send ('error: ' + error)
    });
});

//GET USER BY USERNAME 
app.get('/users/:Username', (req, res) => {
    Users.findOne({UserName: req.params.UserName})
    .then ((user) => {
        res.json(user);
    })
    .catch((error) => {
        console.error(error);
        res.status(201).send ('error ' + error)
    })
})

//UPDATE USERS NAME 
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({UserName: req.params.UserName}, 
        { $set: {
        Name: req.body.Name,
        UserName: req.body.UserName,
        Password: req.body.Password,
        Email: req.body.Email,
        birthday: req.body.Birthday
        }
    },
    { new:true},
    (error,updatedUser) => {
        if(error) {
            console.error(error);
            res.status(201).send( 'error: ' + error);
        } else {
            res.json(updatedUser);
        }
    });
});


//POST A MOVIE TO A USERS ARRAY OF FAVORITE MOVIES
app.post('/users/:Username/movies/:MovieID', (req, res) => {
Users.findOneAndUpdate({Username: req.params.Username},
    { 
        $push: {favoriteMovies: req.params.MovieID}
    },
    {new: true},
    (error, UpdatedUser) => {
        if(error){
            console.log(error);
            res.status(201).send('error: ' + error);
        } else{
            res.json(UpdatedUser)
        }
    });
});


//DELETE A MOVIE FROM THE USERS ARRAY OF FAVORITE MOVIES
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if(user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle )
        res.status(201).send(`${movieTitle} has been removed from user ${id}'s array`);
    }else{
        res.status(400).send('user does not exist')
    }
})

//DELETE USERS 
app.delete('/users/:Username ', (req, res) => {
    Users.findOneAndRemove({Username: req.params.Username })
    .then ((user) => {
        if(!user) {
            res.status(400).send(req.params.Username + 'was not found');
        } else{ 
            res.status(200).send(req.params.Username + 'was deleted');
        }
    })
    .catch((error) =>{
        console.error(error);
        res.status(500).send('error:' + error)
    })
})

//READ ALL OF THE MOVIES IN THE DATABASE
app.get('/movies', (req, res) => {
    Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((error) =>{
        console.error(error);
        res.status(500).send('error:' + error);
    });
})

//READ MOVIES BY THE TITLE 
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.Title === title);
    
    if (movie){
        res.status(200).json(movie);
    } else{
        res.status(400).send('movie not found');
    }
})

//READ MOVIES BY GENRE NAME
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;
    
    if (genre){
        res.status(200).json(genre);
    } else{
        res.status(400).send('genre not found');
    }
})

//READ MOVIES BY DIRECTOR NAME 
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;
    
    if (director){
       return res.status(200).json(director);
    } else{
        res.status(400).send('director not found');
    } 
})

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
