//initial const
const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');


//choose port
const port = process.env.PORT || process.env.NODE_PORT || 3000;



//URL structure map
//4 get requests = Name, Type, ID, Evolution (next and or previous if it has one)
// ( or get all? get all that match a certain criteria (i.e. grass + name bulbasaur = results; and fire type + name bulbasaur = no data)


//2 Post requests = Add Pokemon, or favortie? (save favorite data to a file, and get that data so it doesnt get deleted after a certain amount of time)

//maybe have like different filters?
const urlStruct = {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/getPokemonByName': jsonHandler.getPokemonByName,
    '/getPokemonByType': jsonHandler.getPokemonByType,
    '/getPokemonEvolution': jsonHandler.getPokemonEvolution,
    '/getPokemonById': jsonHandler.getPokemonById,
    '/addPokemon': jsonHandler.addPokemon,
    '/deletePokemon': jsonHandler.deletePokemon, //when deleted kil from all evolution lists (this should be fine with getting restored after i think its auto 30 min?)
    notFound: jsonHandler.notFound,
};



//parse body
const parseBody = (request, response, handler) => {
    const body = [];

    request.on('error', (err) => {
        console.error('Request error:', err);
        response.statusCode = 400;
        response.end();
    });

    request.on('data', (chunk) => {
        console.log('Received chunk:', chunk.toString()); // Debug incoming data
        body.push(chunk);
    });

    request.on('end', () => {
        const bodyString = Buffer.concat(body).toString();
        console.log('Full request body:', bodyString); // Log full body string

        try {
            request.body = JSON.parse(bodyString); // Fix: Parse JSON instead of querystring
            console.log('Parsed request body:', request.body); // Debug parsed body
        } catch (err) {
            console.error('Error parsing JSON:', err);
            response.statusCode = 400;
            response.end('Invalid JSON');
            return;
        }

        handler(request, response);
    });
};



//post request func
const handlePost = (request, response, parsedUrl) => {
    //check if path exists, and process body 
    if (urlStruct[parsedUrl.pathname]) {
        return parseBody(request, response, urlStruct[parsedUrl.pathname]);
    }
};



//main handler request response thingys 
const onRequest = (request, response) => {
    //http or https
    const protocol = request.connection.encrypted ? 'https' : 'http';

    //parse url request
    const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

    //post request = handle post function
    if (request.method === 'POST') {
        return handlePost(request, response, parsedUrl);
    }

    //if url is real in struct -> call cooresponding handler
    if (urlStruct[parsedUrl.pathname]) {
        return urlStruct[parsedUrl.pathname](request, response, parsedUrl);
    }

    //not found = call not found handler
    return urlStruct.notFound(request, response);
};



//make the serva
http.createServer(onRequest).listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
});
