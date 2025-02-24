const fs = require('fs');
const pokemonData = require('../data/pokedex.json');



//respond to server
const respondJSON = (response, status, object) => {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(object));
    response.end();
};




//get name
const getPokemonByName = (request, response, parsedUrl) => {
    //get name parameter from json file
    const name = parsedUrl.searchParams.get('name');
    const result = pokemonData.find(p => p.name.toLowerCase() === name.toLowerCase());

    if (result) {
        //post from json file
        return respondJSON(response, 200, result);
    }
    return respondJSON(response, 404, { message: 'Pokémon not found', id: 'notFound' });
};





//get by type
const getPokemonByType = (request, response, parsedUrl) => {
    //search for type parameter in the file
    const type = parsedUrl.searchParams.get('type');
    const results = pokemonData.filter(p => p.type.includes(type));

    //post type data from json file
    if (results.length > 0) {
        return respondJSON(response, 200, results);
    }
    return respondJSON(response, 404, { message: 'No Pokémon found with that type', id: 'notFound' });
};




// GET Pokémon by ID
const getPokemonById = (request, response, parsedUrl) => {
    //get id parameter from json file
    const id = parseInt(parsedUrl.searchParams.get('id'), 10);
    const result = pokemonData.find(p => p.id === id);

    if (result) {
        //post data from json file
        return respondJSON(response, 200, result);
    }
    return respondJSON(response, 404, { message: 'Pokémon not found', id: 'notFound' });
};




//next/orev evo )
const getPokemonEvolution = (request, response, parsedUrl) => {
    //get evolution??/
    //need next/prev/any????
    const name = parsedUrl.searchParams.get('name');
    const pokemon = pokemonData.find(p => p.name.toLowerCase() === name.toLowerCase());

};



//multiple criteria one, like filters n stuff
const getPokemonByCriteria = (request, response, parsedUrl) => {
    const name = parsedUrl.searchParams.get('name')?.toLowerCase();
    const type = parsedUrl.searchParams.get('type');
};



//adding pokemon
const addPokemon = (request, response) => {
    const newPokemon = request.body;

    //add pokemon with the criteria of the other one
    if (!newPokemon.name || !newPokemon.id || !newPokemon.type) {
        return respondJSON(response, 400, { message: 'Missing required Pokémon data', id: 'badRequest' });
    }

    //push to file 
    pokemonData.push(newPokemon);
    return respondJSON(response, 201, { message: 'Pokémon added successfully', pokemon: newPokemon });
};



//save pokemon and add to external file 
const favoritePokemon = (request, response) => {
    const { id, name } = request.body;


    //bad request
    if (!id || !name) {
        return respondJSON(response, 400, { message: 'Missing required Pokémon data', id: 'badRequest' });
    }


    //push pokemon from pokemon json to favorites json
    fs.readFile('./data/favorites.json', (err, data) => {

        //update idss
        const favorites = err ? [] : JSON.parse(data);
        if (!favorites.some(fav => fav.id === id)) {
            favorites.push({ id, name });

            //write to data/fav json
            fs.writeFile('./data/favorites.json', JSON.stringify(favorites, null, 2), (writeErr) => {
                if (writeErr) return respondJSON(response, 500, { message: 'Error saving favorite', id: 'serverError' });

                return respondJSON(response, 201, { message: 'Pokémon favorited successfully' });
            });
        } else {
            //already made in the favorites 
            return respondJSON(response, 400, { message: 'Pokémon already in favorites', id: 'duplicate' });
        }
    });
};



//not found
const notFound = (request, response) => {
    respondJSON(response, 404, { message: 'Not found', id: 'notFound' });
};



//export functions
//not done; evo, vriteria, fav?
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
