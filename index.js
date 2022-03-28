//JavaScript Document

const express = require('express'),
	morgan = require('morgan');

const app = express();

app.use(morgan('common'));

//These are 10 of my favorite films in no particular order
let topMovies = [
	{
		title: 'Anastasia',
		genre: 'Animation'
	},
	{
		title: 'Spiderman: No Way Home',
		genre: 'Action'
	},
	{
		title: 'Star Wars: Empire Strikes Back',
		genre: 'Sci Fi'
	},
	{
		title: 'Kiki\'s Delivery Service',
		genre: 'Animation'
	},
	{
		title: 'Knives Out',
		genre: 'Mystery'
	},
	{
		title: 'The Lord of The Rings: The Fellowship of the Ring',
		genre: 'Fantasy'
	},
	{
		title: 'Tangled',
		genre: 'Animation'
	},
	{
		title: 'Interstellar',
		genre: 'Sci Fi'
	},
	{
		title: 'How to Train Your Dragon',
		genre: 'Animation'
	},
	{
		title: 'Jurassic Park',
		genre: 'Sci Fi'
	}
];

app.get('/', (req, res) => {
  res.send('Let\'s watch and enjoy movies!'); //In need of a better slogan
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

//Morgan log
app.get('/', (req, res) => {
	res.send('Welcome to the movies!');
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
