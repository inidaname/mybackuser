/**
 * Handler of API addresse through here
 *
 * @summary API Addresses
 * @author Hassan Sani
 *
 * Created at     : 2018-08-09 03:36:43 
 * Last modified  : 2018-08-13 06:26:01
 */

import mongodb from "mongodb";
import { userMethod, tokenMethod, groupMethod } from "../handlers/handlerMethods.mjs";


const handlers = {

    // The Users api for reg
    users(data, callback){
        
        // declaring the acceptable API methods
        const _acceptableMethods = ["post", "get", "put", "delete"];
        // Check if the method sent exist
        if (_acceptableMethods.indexOf(data.method) > -1){
            handlers._users[data.method](data, callback); // if the method exist return the callback with the data
        } else {
            callback(405); // if not we return not allowed http code
        }
    },

    // Declaring the user methods
    _users: userMethod,

    // token for verification
    tokens(data, callback){
        // declaring the acceptable API methods
        const _acceptableMethods = ["post", "get", "put", "delete"];
        // Check if the method sent exist
        if (_acceptableMethods.indexOf(data.method) > -1){
            handlers._tokens[data.method](data, callback); // if the method exist return the callback with the data
        } else {
            callback(405); // if not we return not allowed http code
        }
    },

    _tokens: tokenMethod,

    // API for user grouping begins here
    groups(data, callback){
        // declaring the acceptable API methods
        const _acceptableMethods = ["post", "get", "put", "delete"];
        // Check if the method sent exist
        if (_acceptableMethods.indexOf(data.method) > -1){
            handlers._groups[data.method](data, callback); // if the method exist return the callback with the data
        } else {
            callback(405); // if not we return not allowed http code
        }
    },

    _groups: groupMethod,

    // ping for uptime monitoring
    ping: function (data, callback) {
        callback(200);
    },


    // Not found handler
    notFound: function (data, callback) {
        callback(404, {"Error": "Thank you, but you missed your road!"});
    }
};
export default handlers;
export const { users, tokens, groups, ping, notFound} = handlers;