/**
 * Server configurations
 *
 * @summary The server library for random user generator
 * @author Hassan Sani <inidaname>
 *
 * Created at     : 2018-08-09 01:19:01 
 * Last modified  : 2018-08-13 06:01:12
 */

// Dependencies
import http from 'http';
import url from 'url';
import StringDecoder from 'string_decoder';
import util from 'util';
// const https = require('https');
// const util = require('util');
// const debug = util.debuglog('server');
// const StringDecoder = require('string_decoder').StringDecoder;
// const path = require('path');
// const fs = require('fs');
import config from "./config";
import { handlers } from "./handler.mjs";
import { ParsedJSON } from './helperLib.mjs';
import { router } from './routers.mjs';

const debug = util.debuglog('server');


// Defining request router




export const server = {
    httpServer: http.createServer(function(req, res) {
        
        // Getting and setting up the URLs
        let parsedUrl = url.parse(req.url, true); // Get the address url and parse it
        let {query, path} = parsedUrl;
        // let path = parsedUrl.path; // Get the path of the url
        let trimPath = path.replace(/^\/+|\/+$/g, ''); // removing white spaces
        // var queryStringObject = parsedUrl.query; // Get the address where it maybe for GET query
        

        //Getting and setting up the methods
        let method = req.method.toLowerCase(); // forcing lowercase on method parsed

        // Getting Header as an object and setting up
        let headers = req.headers; // Getting headers as parsed on req

        // Getting POST data parsed as payloads if any
        let StringDe = StringDecoder.StringDecoder;
        let decoder = new StringDe('utf-8');
        let buffer = '';
        req.on('data', function(data) {
            buffer += decoder.write(data); // decoding content
        });

        // Ending the request with configure of server
        req.on('end', function(){
            buffer += decoder.end(); // Ending the decoding content
            // choose the handler or not found
            var choosenHandler = typeof(router[trimPath]) !== 'undefined' ? router[trimPath] : handlers.notFound;

            const {...queryStringObject} = query;
            
            // Construct the data object
            let data = {
                'trimPath' : trimPath,
                "queryStringObject" : queryStringObject,
                'method' : method,
                'headers' : headers,
                'payload' : ParsedJSON(buffer)
            };


            
            // routing to links
            choosenHandler(data, function(statusCode, payload, contentType){

                // Determine content-type (Default to JSON)
                contentType = typeof(contentType) == 'string' ? contentType : 'json';

                //Use the status code called back by the handlers
                statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
    
                
                if (contentType == 'json') {
                    //use the payload call backed
                    payload = typeof(payload) == 'object' ? payload : {};
        
                    // Convert payload to string
                    var payloadString = JSON.stringify(payload);
        
                    // Return the response
                    res.setHeader('Content-Type', 'application/json');
                } 
    
                res.writeHead(statusCode);
    
                res.end(payloadString);
                if(statusCode == 200){
                    debug('\x1b[35m%s\x1b[0m', method.toUpperCase()+' /'+trimPath+' '+statusCode);
                } else {
                    debug('\x1b[31m%s\x1b[0m', method.toUpperCase()+' /'+trimPath+' '+statusCode);
                }
            });
        });
    }),

    init: function(){
        this.httpServer.listen(config.httpPort, ()=>{
            console.log('\x1b[34m%s\x1b[0m', 'Listening to port ' + config.httpPort);
        });
    },

}