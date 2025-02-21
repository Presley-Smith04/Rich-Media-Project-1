const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || 3000;


//URL structure map
const urlStruct = {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/getPokemonByName': jsonHandler.getPokemonByName,
    '/getPokemonByType': jsonHandler.getPokemonByType,
    '/getPokemonEvolution': jsonHandler.getPokemonEvolution,
    '/getPokemonById': jsonHandler.getPokemonById,
    '/addPokemon': jsonHandler.addPokemon,
    '/deletePokemon': jsonHandler.deletePokemon,
    notFound: jsonHandler.notFound,
};

//parse the request body
const parseBody = (request, response, handler) => {
    const body = [];

    request.on('error', (err) => {
        console.error(err);
        response.statusCode = 400;
        response.end();
    });

    request.on('data', (chunk) => {
        body.push(chunk);
    });

    request.on('end', () => {
        const bodyString = Buffer.concat(body).toString();
        request.body = query.parse(bodyString);
        handler(request, response);
    });
};

//Post request handler
const handlePost = (request, response, parsedUrl) => {
    if (urlStruct[parsedUrl.pathname]) {
        return parseBody(request, response, urlStruct[parsedUrl.pathname]);
    }
};

//main handler
const onRequest = (request, response) => {
    const protocol = request.connection.encrypted ? 'https' : 'http';
    const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

    if (request.method === 'POST') {
        return handlePost(request, response, parsedUrl);
    }

    if (urlStruct[parsedUrl.pathname]) {
        return urlStruct[parsedUrl.pathname](request, response, parsedUrl);
    }

    return urlStruct.notFound(request, response);
};

//make the serva
http.createServer(onRequest).listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
});
