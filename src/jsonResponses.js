const fs = require('fs');
const pokemonData = require('../data/pokedex.json');


//ensure the server uses JSON parsing middleware
const express = require('express');
const app = express();
app.use(express.json());


//send response
const respondJSON = (response, status, object) => {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(object));
    response.end();
};



//poke by name
const getPokemonByName = (request, response, parsedUrl) => {
    const name = parsedUrl.searchParams.get('name');
    const result = pokemonData.find(p => p.name.toLowerCase() === name.toLowerCase());

    if (result) {
        return respondJSON(response, 200, result);
    }
    return respondJSON(response, 404, { message: 'Pokémon not found', id: 'notFound' });
};



//poke by type
const getPokemonByType = (request, response, parsedUrl) => {
    const type = parsedUrl.searchParams.get('type');
    const results = pokemonData.filter(p => p.type.includes(type));

    if (results.length > 0) {
        return respondJSON(response, 200, results);
    }
    return respondJSON(response, 404, { message: 'No Pokémon found with that type', id: 'notFound' });
};



//poke by id
const getPokemonById = (request, response, parsedUrl) => {
    const id = parseInt(parsedUrl.searchParams.get('id'), 10);
    const result = pokemonData.find(p => p.id === id);

    if (result) {
        return respondJSON(response, 200, result);
    }
    return respondJSON(response, 404, { message: 'Pokémon not found', id: 'notFound' });
};



//get evos
const getPokemonEvolution = (request, response, parsedUrl) => {
    const name = parsedUrl.searchParams.get('name');
    const pokemon = pokemonData.find(p => p.name.toLowerCase() === name.toLowerCase());

    if (!pokemon) {
        return respondJSON(response, 404, { message: 'Pokémon not found', id: 'notFound' });
    }

    //next evo in data 
    const nextEvolutions = pokemon.next_evolution ? pokemon.next_evolution.map(e => e.name) : [];

    return respondJSON(response, 200, {
        name: pokemon.name,
        evolvesTo: nextEvolutions.length > 0 ? nextEvolutions : ['None'],
    });
};




//search for criteria
const getPokemonByCriteria = (request, response, parsedUrl) => {
    let results = [...pokemonData];

    //all params
    const name = parsedUrl.searchParams.get('name')?.toLowerCase();
    const type = parsedUrl.searchParams.get('type');
    const height = parsedUrl.searchParams.get('height');
    const weight = parsedUrl.searchParams.get('weight');

    //apply if params are provided
    if (name) {
        results = results.filter(p => p.name.toLowerCase().includes(name));
    }
    if (type) {
        results = results.filter(p => p.type.includes(type));
    }
    if (height) {
        results = results.filter(p => p.height === height);
    }
    if (weight) {
        results = results.filter(p => p.weight === weight);
    }

    if (results.length > 0) {
        return respondJSON(response, 200, results);
    }
    return respondJSON(response, 404, { message: 'No Pokémon matched the given criteria', id: 'notFound' });
};



//add new 
const addPokemon = (request, response) => {
    const newPokemon = request.body;

    //are all fields provided
    if (!newPokemon.name || !newPokemon.type) {
        return respondJSON(response, 400, { message: 'Missing required Pokémon data', id: 'badRequest' });
    }

    //new id if not already
    newPokemon.id = newPokemon.id || pokemonData.length + 1;

    //add pokemon to memory data
    pokemonData.push(newPokemon);

    //write to pokededxx
    fs.writeFile('./data/pokedex.json', JSON.stringify(pokemonData, null, 2), (err) => {
        if (err) {
            return respondJSON(response, 500, { message: 'Error saving Pokémon data', id: 'serverError' });
        }
        //success message!!!!
        return respondJSON(response, 201, { message: 'Pokémon added successfully', pokemon: newPokemon });
    });
};




//save to FAVORTIE
const favoritePokemon = (request, response) => {
    const { id, name } = request.body;

    if (!id || !name) {
        return respondJSON(response, 400, { message: 'Missing required Pokémon data', id: 'badRequest' });
    }

    //read the fav file
    fs.readFile('./data/favorites.json', (err, data) => {
        const favorites = err ? [] : JSON.parse(data);

        //don't duplicate
        if (!favorites.some(fav => fav.id === id)) {
            favorites.push({ id, name });

            //save fav list
            fs.writeFile('./data/favorites.json', JSON.stringify(favorites, null, 2), (writeErr) => {
                if (writeErr) return respondJSON(response, 500, { message: 'Error saving favorite', id: 'serverError' });

                return respondJSON(response, 201, { message: 'Pokémon favorited successfully' });
            });
        } else {
            return respondJSON(response, 400, { message: 'Pokémon already in favorites', id: 'duplicate' });
        }
    });
};



//invalid routes
const notFound = (request, response) => {
    respondJSON(response, 404, { message: 'Not found', id: 'notFound' });
};


//export 
module.exports = {
    getPokemonByName,
    getPokemonByType,
    getPokemonById,
    getPokemonEvolution,
    getPokemonByCriteria,
    addPokemon,
    favoritePokemon,
    notFound,
};
