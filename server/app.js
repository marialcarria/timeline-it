const express = require('express');
const bodyParser = require('body-parser');
const categorias = require('./data/categorias');
const subcategorias = require('./data/subcategorias');
const eventos = require('./data/eventos');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.listen(8081);

app.get('/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send('Hello!');
});

app.get('/categorias', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(categorias);
});

app.get('/subcategorias', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(subcategorias);
});

app.get('/eventos', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(eventos);
});