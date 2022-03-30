//JavaScript Document

const express = require('express'),
	bodyParser = require('body-parser'),
 	uuid = require('uuid'),
	morgan = require('morgan');

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));

let users = [];

let movies = [
	{
		title: 'Anastasia',
		description: '...',
		genre: {
			name: 'Animation',
			description: '...'
		},
		director: {
			name: 'Don Bluth',
			bio: '...',
			birth: '1937',
			death: '-'
		},
		imageURL: '...'
	},
	{
		title: 'Spiderman: No Way Home',
		description: '...',
		genre: {
			name: 'Action',
			description: '...'
		},
		director: {
			name: 'Jon Watts',
			bio: '...',
			birth: '1981',
			death: '-'
		},
		imageURL: '...'
	},
	{
		title: 'Star Wars: Empire Strikes Back',
		description: '...',
		genre: {
			name: 'Sci Fi',
			description: '...'
		},
		director: {
			name: 'Irvin Kershner',
			bio: '...',
			birth: '1923',
			death: '2010'
		},
		imageURL: '...'
	},
	{
		title: 'Raiders of The Lost Ark',
		description: '...',
		genre: {
			name: 'Adventure',
			description: '...'
		},
		director: {
			name: 'Steven Spielburg',
			bio: '...',
			birth: '1946',
			death: '-'
		},
		imageURL: '...'
	},
	{
		title: 'Knives Out',
		description: '...',
		genre: {
			name: 'Mystery',
			description: '...'
		},
		director: {
			name: 'Rian Johnson',
			bio: '...',
			birth: '1973',
			death: '-'
		},
		imageURL: '...'
	},
	{
		title: 'The Lord of The Rings: The Fellowship of the Ring',
		description: '...',
		genre: {
			name: 'Fantasy',
			description: '...'
		},
		director: {
			name: 'Peter Jackson',
			bio: '...',
			birth: '1961',
			death: '-'
		},
		imageURL: '...'
	},
	{
		title: 'Mean Girls',
		description: '...',
		genre: {
			name: 'Comedy',
			description: '...'
		},
		director: {
			name: 'Mark Waters',
			bio: '...',
			birth: '1964',
			death: '-'
		},
		imageURL: '...'
	},
	{
		title: 'Interstellar',
		description: '...',
		genre: {
			name: 'Sci Fi',
			description: '...'
		},
		director: {
			name: 'Christopher Nolan',
			bio: '...',
			birth: '1970',
			death: '-'
		},
		imageURL: '...'
	},
	{
		title: 'The Notebook',
		description: '...',
		genre: {
			name: 'Romance',
			description: '...'
		},
		director: {
			name: 'Nick Cassavetes',
			bio: '...',
			birth: '1959',
			death: '-'
		},
		imageURL: '...'
	},
	{
		title: 'Gone Girl',
		description: '...',
		genre: {
			name: 'Thriller',
			description: '...'
		},
		director: {
			name: 'David Fincher',
			bio: '...',
			birth: '1962',
			death: '-'
		},
		imageURL: '...'
	}
];

app.get('/', (req, res) => {
  res.send('Let\'s watch and enjoy movies!'); //In need of a better slogan
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.post('/users', (req, res) => {
	const newUser = req.body;
	
	if (newUser.name) {
		newUser.id = uuid.v4();
		users.push(newUser);
		res.status(201).json(newUser);
	} else{
		res.status(400).send('User needs name');
	}
});

app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

app.get('/movies/:title', (req, res) => {
	const title = req.params.title;
	const movie = movies.find(movie => movie.title === title);

	if (movie) {
		res.status(200).json(movie);
	} else {
		res.status(400).send('No such movie');
	}
});

app.get('/movies/genre/:genreName', (req, res) => {
	const { genreName } = req.params;
	const genre = movies.find(movie => movie.genre.name === genreName).genre;

	if (genre) {
		res.status(200).json(genre);
	} else {
		res.status(400).send('No such genre');
	}
});

app.get('/movies/director/:directorName', (req, res) => {
	const { directorName } = req.params;
	const director = movies.find(movie => movie.director.name === directorName).director;

	if (director) {
		res.status(200).json(director);
	} else {
		res.status(400).send('No such director');
	}
});

app.use(express.static('public'));

//Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//Port Number
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
