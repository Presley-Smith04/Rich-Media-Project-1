const fs = require('fs');
const path = require('path');



//serve the html
const getIndex = (request, response) => {
    const filePath = path.resolve(__dirname, '../client/client.html');
    fs.readFile(filePath, (err, data) => {
        if (err) {

            //badrequest
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.write('Error loading page');
            return response.end();
        }

        //write to html, the resoinse
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        return response.end();
    });
};



//css file stuff 
const getCSS = (request, response) => {
    const filePath = path.resolve(__dirname, '../client/style.css');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            //badrequest
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.write('Error loading styles');
            return response.end();
        }

        //write based on css file params
        response.writeHead(200, { 'Content-Type': 'text/css' });
        response.write(data);
        return response.end();
    });
};


//exp
module.exports = { getIndex, getCSS };
