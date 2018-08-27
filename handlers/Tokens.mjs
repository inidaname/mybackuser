import dataLib from "../lib/dataLib";
import mongodb from "mongodb";

export const tokenMethod = {
    // Post for token creation
    // required fields ID and email
    post(data, callback){
        let genStr = typeof(data.payload.genStr) == "string" && data.payload.genStr.trim().length == 24 ? data.payload.genStr.trim() : false;
        let email = typeof(data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

        if(email && genStr){
            // Get and check the generated string is correct
            dataLib.read("users", {email: email}, function(err, userData){
                if(!err && userData){
                    if(userData.genStr === genStr){
                        let expires = Date.now() + 24000 * 60 * 60;
                        // Create token for verification
                        let tokenData = {
                            "email": email,
                            "userID": userData._id,
                            "expires": new mongodb.Timestamp(expires)
                        };

                        // Start to create the token
                        dataLib.create("tokens", tokenData, function(err, responded){
                            if(!err && responded){
                                callback(200, responded);
                            } else {
                                callback(500, {"Error": "Unable to register token"});
                            }
                        });
                    } else {
                        callback(400, {"Error": "Login  link provided is not valid"});
                    }
                } else {
                    callback(404, {"Error": "User not found"});
                }
            });
        }
    },

    // get the tokens
    get(data, callback){
        
        let id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 24 ? new mongodb.ObjectID(data.queryStringObject.id.trim()) : false;
        if(id){
            dataLib.read("tokens", {"_id":id}, function(err, tokenData){
                if(!err && tokenData){
                    callback(200, tokenData);
                } else {
                    callback(404);
                }
            });
        } else {
            callback(400, {"Error": "No token id provided"});
        }
    },

    // to posibily update token data
    put(data, callback){
        // check for valid number
        let id = typeof (data.payload.id) == "string" && data.payload.id.trim().length == 24 ? new mongodb.ObjectID(data.payload.id.trim()) : false;
        let extend = typeof (data.payload.extend) == "boolean" && data.payload.extend == true ? true : false;
        
        if(id && extend) {
            // Read token for update
            dataLib.read("tokens", {"_id":id}, function(err, tokenData){
                if(!err && tokenData){
                    let today = new mongodb.Timestamp(Date.now());
                    if(tokenData.expires > today){
                        let extendedTime = Date.now() + 1000 * 60 * 60;
                        tokenData.expires = new mongodb.Timestamp(extendedTime);
                        dataLib.update("tokens", id, tokenData, function(err, updated){
                            if(!err && updated){
                                callback(false, updated);
                            } else {
                                callback(500, {"Error": "Unable to update the data"});
                            }
                        });
                    }
                } else {
                    callback(400, {"Error": "Invalid token provided"});
                }
            });
        } else {
            callback(400, {"Error": "Required fields not provided"});
        }
    },

    // Deleting token to log out user
    delete(data, callback){
        // required phone
        // optional none
        // TODO: Only allow an authenticated user

        // check for valid number
        let id = typeof (data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 24 ? new mongodb.ObjectID(data.queryStringObject.id.trim()) : false;

        if(id){
            dataLib.delete("tokens", id, function(err, resp){
                if(!err && resp){
                    callback(200);
                } else {
                    callback(500, {"Error": "Unable to delete Token"});
                }
            });
        }
    },

    // Verify if a given token id is for a given user
    verifyToken(id, userId, callback) {
        dataLib.read("tokens", {"_id":id}, function (err, data) {
            let today = new mongodb.Timestamp(Date.now());
            if (!err && data) {
                // check data for match phone and has not expires
                if ((typeof(userId) == "object") ? userId.equals(data.userID): data.email == userId && today.lessThanOrEqual(new mongodb.Timestamp(data.expires))) {
                    callback(true);
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        });
    }
};