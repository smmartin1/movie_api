//JavaScript Document

/**
 * Movie API
 */
const express = require('express'),
	bodyParser = require('body-parser'),
 	uuid = require('uuid'),
	morgan = require('morgan');

const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

const passport = require('passport');
require('./passport');

mongoose.connect(process.env.CONNECTION_URI || 'mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

const cors = require('cors');

const { check, validationResult } = require('express-validator');

const app = express();

const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(cors({origin: '*'}));

/* let allowedOrigins = [
	'http://localhost:8080',
	'https://fathomless-peak-84165.herokuapp.com',
	'http://localhost:1234',
  'http://localhost:4200',
  'http://localhost:3000',
  'https://smmartin1.github.io'
];

 app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
})); */

let auth = require('./auth')(app);

/**
 * Welcome Message
 * @returns Welcome message
 */
app.get('/', (req, res) => {
  res.send('Let\'s watch and enjoy movies!');
});

/**
 * Documentation page
 * @returns Documentation
 */
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

/**
 * Create a New User
 * @returns a new user information
 */
app.post('/users',
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username cannot contain special characters.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

		let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
		Users.findOne({ Username: req.body.Username }).then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }).then((user) => {
          res.status(201).json(user)
        }).catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
      }
    }).catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
  });

	/**
	 * Update User
	 * @param {string} Username
	 * @returns updated info on user
	 * @requires passport
	 */
app.put('/users/:Username', passport.authenticate('jwt', {session: false}),
	[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username cannot contain special characters.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
		Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

/**
 * Get all users
 * @returns an array of users
 * @requires passport
 */
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.find().then((users) => {
    res.status(201).json(users);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * Get an user by username
 * @param {string} Username
 * @returns User information
 * @requires passport
 */
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOne({ Username: req.params.Username }).then((users) => {
    res.json(users);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * Get a user's favorite movie list
 * @param {string} Username
 * @returns User's favorite movies
 * @requires passport
 */
app.get('/users/:Username/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOne({ Username: req.params.Username }).then((user) => {
		if (user) {
			res.status(200).json(user.FavoriteMovies);
		} else {
			res.status(400).send('Could not find favorite movies or user does not have any');
		}
	});
});

/**
 * Add a movie to a user's favorite movie list
 * @param {string} Username
 * @param {string} MovieID
 * @returns User's favorite movies
 * @requires passport
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

/**
 * Delete a movie from a User's List
 * @param {string} Username
 * @param {string} MovieID
 * @returns User's favorite movies
 * @requires passport
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
  },
  { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

/**
 * Delete a user
 * @param {string} Username
 * @returns an updated list of users
 * @requires passport
 */
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username }).then((users) => {
    if (!users) {
      res.status(400).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * Get all movies
 * @returns an array of movies from a database
 * @requires passport
 */
app.get('/movies', /*passport.authenticate('jwt', {session: false}),*/ (req, res) => {
  Movies.find().then((movie) => {
    res.status(201).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * Get a single movie information
 * @param {string} Title
 * @returns a movie's information
 * @requires passport
 */
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title }).then((movies) => {
    res.json(movies);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * Get a genre by name
 * @param {string} Name
 * @returns a genre's information
 * @requires passport
 */
app.get('/genre/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find({ 'Genre.Name': req.params.Name }).then((movies) => {
    res.json(movies);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/**
 * Get a director's information
 * @param {string} Name
 * @returns a director's information
 * @requires passport
 */
app.get('/director/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
	Movies.find({ 'Director.Name': req.params.Name }).then((movies) => {
    res.json(movies);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Express
app.use(express.static('public'));

//Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//Port Number
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on port ' + port);
});
