//initial const
const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');


//choose port
const port = process.env.PORT || process.env.NODE_PORT || 3000;



//URL structure map
//4 get requests = Name, Type, ID, Evolution (maybe weakness, or get all?)
//2 Post requests = Add Pokemon, and either remove? or favortie?

//maybe have like different filters?
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



//parse body
const parseBody = (request, response, handler) => {
    //collect data
    const body = []; 
    

    //error handle
    request.on('error', (err) => {
        //log error
        //bad request status
        console.error(err);
        response.statusCode = 400;
        response.end();
    });

    //get data 
    request.on('data', (chunk) => {
        //append each piece of data
        body.push(chunk);
    });

    //process body when data is recieved 
    request.on('end', () => {
        //convert data to a string and parse into an ovject
        const bodyString = Buffer.concat(body).toString();
        request.body = query.parse(bodyString);

        //call request and response
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
