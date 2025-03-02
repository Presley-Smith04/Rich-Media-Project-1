//initial const
const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');



//choose port
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// URL structure map
// 4 get requests = Name, Type, ID, Evolution (next and or previous if it has one)
// (or get all? get all that match a certain criteria (i.e. grass + name bulbasaur = results; and fire type + name bulbasaur = no data)

// 2 Post requests = Add Pokemon, or favorite? (save favorite data to a file, and get that data so it doesn't get deleted after a certain amount of time)

// Maybe have like different filters?

//url struct
const urlStruct = {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/getPokemonByName': jsonHandler.getPokemonByName,
    '/getPokemonByType': jsonHandler.getPokemonByType,
    '/getPokemonEvolution': jsonHandler.getPokemonEvolution,
    '/getPokemonById': jsonHandler.getPokemonById,
    '/addPokemon': jsonHandler.addPokemon,
    '/deletePokemon': jsonHandler.deletePokemon, // When deleted, kill from all evolution lists (this should be fine with getting restored after I think it's auto 30 min?)
    notFound: jsonHandler.notFound,
};

//parse body
const parseBody = (request, response, handler) => {
    //collect data
    const body = [];

    //error handle
    request.on('error', (err) => {
        //log error - bad request status
        console.error(err);
        response.statusCode = 400;
        response.end();
    });

    //get data
    request.on('data', (chunk) => {
        body.push(chunk);
    });

    //process body when data is received
    request.on('end', () => {
        //data to a string and parse into an object
        const bodyString = Buffer.concat(body).toString();
        request.body = query.parse(bodyString);

        //call request and response handler
        handler(request, response);
    });
};

//post request func
const handlePost = (request, response, parsedUrl) => {
    //xheck if path exists, and process body
    if (urlStruct[parsedUrl.pathname]) {
        return parseBody(request, response, urlStruct[parsedUrl.pathname]);
    } else {
        response.statusCode = 404;
        response.end(JSON.stringify({ message: 'Post request path not found' }));
    }
};

//main handler request response thingys
const onRequest = (request, response) => {
    //http or https
    const protocol = request.connection.encrypted ? 'https' : 'http';

    //parse URL request
    const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

    //handle POST request
    if (request.method === 'POST') {
        return handlePost(request, response, parsedUrl);
    }

    //if URL is valid in struct -> call corresponding handler
    if (urlStruct[parsedUrl.pathname]) {
        return urlStruct[parsedUrl.pathname](request, response, parsedUrl);
    }

    //not found -> call not found handler
    return urlStruct.notFound(request, response);
};



//make the serva
http.createServer(onRequest).listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
});
