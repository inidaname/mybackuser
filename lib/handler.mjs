/**
 * Handler of API addresse through here
 *
 * @summary API Addresses
 * @author Hassan Sani
 *
 * Created at     : 2018-08-09 03:36:43 
 * Last modified  : 2018-08-13 06:26:01
 */

import dataLib from "./dataLib";
import { generateID, createRandomString } from "./helperLib.mjs";
import mongodb from "mongodb";


export const handlers = {

    // The Users api for reg
    users(data, callback){
        
        // declaring the acceptable API methods
        var _acceptableMethods = ["post", "get", "put", "delete"];
        // Check if the method sent exist
        if (_acceptableMethods.indexOf(data.method) > -1){
            handlers._users[data.method](data, callback); // if the method exist return the callback with the data
        } else {
            callback(405); // if not we return not allowed http code
        }
    },

    // Declearing the user methods
    _users: {
        // Users list with required fields and methods
        // Required data: Name, Email, TosAgreement
        // Optional: Location, Interest, Phone, Social
        post: function(data, callback){
            // declaring variables
            let fullname = typeof(data.payload.fullname) == "string" && data.payload.fullname.length >= 5 ? data.payload.fullname : false;
            let email = typeof(data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
            let tosAgreement = typeof (data.payload.tosAgreement) == "boolean" && data.payload.tosAgreement == true ? true : false;

            if(fullname && email && tosAgreement){
                dataLib.read("users", email, function(err, userData){
                    if(!userData){
                        let genStr = createRandomString(24);
                        let dateCreated = new Date();
                        let userObj = {
                            "fullname": fullname,
                            "email": email,
                            "tosAgreement": tosAgreement,
                            "oldStr": [],
                            "socials": {
                                "github": "",
                                "twitter": "",
                                "facebook": "",
                                "stackoverflow": "",
                                "medium": "",
                                "personal": ""
                            },
                            "interests": [],
                            "userGroups": [],
                            "genStr": genStr,
                            "createdAt": new mongodb.Timestamp(dateCreated)
                        };

                        // Creating user for database
                        dataLib.create("users", userObj, function(err, userCreated){
                            if(!err, userCreated){
                                callback(200);
                            } else {
                                callback(500, {"Error": "Unable to create User"});
                            }
                        });
                    } else {
                        callback(400, {"Error": "A user with that email already exist"});
                    }
                });
            } else {
                callback(400, {"Error":"Required fields must be provided"});
            }
        },


        get(data, callback) {
            // declaring variables
            let email = typeof(data.queryStringObject.email) == "string" && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
            let id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 24 ? new mongodb.ObjectID(data.queryStringObject.id.trim()) : false;

            let getData = (id === false) ? email : id;
            if (email || id){
                let token = typeof (data.headers.token) == "string" && data.headers.token.trim().length == 24 ? new mongodb.ObjectID(data.headers.token.trim()) : false;
                
                if(token){
                    handlers._tokens.verifyToken(token, getData, function(tokenValid){
                        if(tokenValid){
                            dataLib.read("users", getData, function(err, userData){
                                if(!err && userData){
                                    callback(200, userData);
                                } else {
                                    callback(400, {"Error": "User dose not exist"});
                                }
                            });
                        } else {
                            callback(400, {"Error": "Invalid token provided"});
                        }
                    });
                } else {
                    callback(400, {"Error": "Token was not provided"});
                }
            } else {
                callback(400, {"Error": "Missing required field"});
            }
        },

        // Udpating user profile
        put: function(data, callback){
            // required feilds is id
            // Optional fields are others
            let id = typeof(data.payload.id) == "string" && data.payload.id.trim().length == 24 ? new mongodb.ObjectID(data.payload.id.trim()) : false;
            // let email = typeof(data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
            // Disable change of email for now

            let fullname = typeof(data.payload.fullname) == "string" && data.payload.fullname.trim().length >= 5 ? data.payload.fullname.trim() : false;
            let location = typeof(data.payload.location) == "string" && data.payload.location.trim().length > 0 ? data.payload.location.trim() : false;
            let interests = typeof(data.payload.interests) == "object" && data.payload.interests instanceof Array ? data.payload.interests : [];
            let phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false;
            let socials = typeof(data.payload.socials) == "object" && data.payload.socials instanceof Object ? data.payload.socials : {};
            let changeGetStr = typeof(data.payload.changeGetStr) == "boolean" && data.payload.changeGetStr == true ? true : false;
            let userGroups = typeof(data.payload.userGroups) == "object" && data.payload.userGroups instanceof Array ? data.payload.userGroups : [];

            if(id){
                let token = typeof (data.headers.token) == "string" && data.headers.token.trim().length == 24 ? new mongodb.ObjectID(data.headers.token.trim()) : false;

                if(token){
                    handlers._tokens.verifyToken(token, id, function(tokenValid){
                        if (tokenValid) {
                            // Get the user data for update
                            dataLib.read("users", id, function(err, userData){
                                if(!err && userData){

                                    //User request for login string
                                    if(changeGetStr){
                                        let newStr = createRandomString(24);
                                        let oldStr = userData.oldStr
                                        newStr = (oldStr.indexOf(newStr) == -1) ? newStr : createRandomString(24);

                                        oldStr.push(genStr);
                                        userData.genStr = newStr;
                                        userData.oldStr = oldStr;
                                    }

                                    // User request for other info change
                                    let groupLists = userData.userGroups, interestLists = userData.interests;

                                    if(socials){
                                        userData.socials = socials;
                                    }
                                    if(groupLists.length > 0){
                                        let finalRet = [];
                                        groupLists.forEach((e1) =>{
                                            userGroups.forEach((e2) => {
                                                if (e1 !== e2){
                                                    finalRet.push(e2);
                                                }
                                            });
                                        });
                                        let theFinal = [groupLists, ...finalRet];

                                        userData.userGroups = theFinal;
                                    } else {
                                        userData.userGroups = [groupLists, ...userGroups];
                                    }
                                    
                                    if(interestLists.length > 0){
                                        let finalRet = [];
                                        interestLists.forEach((e1) =>{
                                            interests.forEach((e2) => {
                                                if (e1 !== e2){
                                                    finalRet.push(e2);
                                                }
                                            });
                                        });
                                        let theFinal = [interestLists, ...finalRet];

                                        userData.interests = theFinal;
                                    } else {
                                        userData.interests = [interestLists, ...interests];
                                    }

                                    if(location){
                                        userData.location = location;
                                    }

                                    if(phone){
                                        userData.phone = phone;
                                    }

                                    if(fullname){
                                        userData.fullname = fullname;
                                    }

                                    if(location || fullname || phone || interests || socials || userGroups || changeGetStr){
                                        userData.updatedOn =new mongodb.Timestamp(new Date());
                                    }

                                    // @TODO: Send mail on change of any especial new genstr

                                    dataLib.update("users", id, userData, function(err){
                                        if(!err){
                                            callback(200);
                                        } else {
                                            callback(500, {"Error": "Could not update the user info"});
                                        }
                                    });
                                } else {
                                    callback(404, {"Error": "User does not exist"});
                                }
                            });
                        } else {
                            callback(400, {"Error": "Invalid Token provided"});
                        }
                    });
                } else {
                    callback(400, {"Error": "Token was not provided"});
                }
            } else {
                callback(400, {"Error": "Required field not provided I think"});
            }
        },

        delete(data, callback){
            // @TODO: delete groups he may belong to
            let id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 24 ? new mongodb.ObjectID(data.queryStringObject.id.trim()) : false;
            if(id){
                let token = typeof (data.headers.token) == "string" && data.headers.token.trim().length == 24 ? new mongodb.ObjectID(data.headers.token.trim()) : false;
                if(token){
                    handlers._tokens.verifyToken(token, id, function(tokenValid){
                        if(tokenValid){
                            dataLib.read("users", id, function(err, docs){
                                if(!err && docs){
                                    // handle groups user created
                                } else {
                                    callback(404, {"Error": "User does not exist"});
                                }
                            });
                        } else {
                            callback(400, {"Error": "Invalid token provided"});
                        }
                    });    
                } else {
                    callback(400, {"Error": "Token was not provided"});
                }
            }
        }

    },

    // token for verification
    tokens(data, callback){
        // declaring the acceptable API methods
        var _acceptableMethods = ["post", "get", "put", "delete"];
        // Check if the method sent exist
        if (_acceptableMethods.indexOf(data.method) > -1){
            handlers._tokens[data.method](data, callback); // if the method exist return the callback with the data
        } else {
            callback(405); // if not we return not allowed http code
        }
    },

    _tokens:{
        // Post for token creation
        // required fields ID and email
        post(data, callback){
            let genStr = typeof(data.payload.genStr) == "string" && data.payload.genStr.trim().length == 24 ? data.payload.genStr.trim() : false;
            let email = typeof(data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

            if(email && genStr){
                // Get and check the generated string is correct
                dataLib.read("users", email, function(err, userData){
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
                dataLib.read("tokens", id, function(err, tokenData){
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
                dataLib.read("tokens", id, function(err, tokenData){
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
            dataLib.read("tokens", id, function (err, data) {
                let today = new mongodb.Timestamp(Date.now());
                if (!err && data) {
                    // check data for match phone and has not expires
                    if ((typeof(userId) == "object") ? userId.equals(data.userID): data.email == userId && today.lessThanOrEqual(data.expires)) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                } else {
                    callback(false);
                }
            });
        }
    },

    // API for user grouping begins here
    groups(data, callback){
        // declaring the acceptable API methods
        var _acceptableMethods = ["post", "get", "put", "delete"];
        // Check if the method sent exist
        if (_acceptableMethods.indexOf(data.method) > -1){
            handlers._groups[data.method](data, callback); // if the method exist return the callback with the data
        } else {
            callback(405); // if not we return not allowed http code
        }
    },

    _groups:{
        // Group creation by user
        post(data, callback){
            // required fields: Group Name, max-leader, group-unique-name, userID
            // optional: group desc, group closing date, max-members, group min-members, group-image, group-purpose, group-category,
            let groupname = typeof(data.payload.groupname) == "string" && data.payload.groupname.trim().length > 0 ? data.payload.groupname.trim() : false;
            let groupID = typeof(data.payload.groupID) == "string" && data.payload.groupID.trim().length > 0 && data.payload.groupID.trim().length < 15 ? data.payload.groupID.trim() : false;
            let groupCreator = typeof(data.payload.groupCreator) == "string" && data.payload.groupCreator.trim().length > 0 ? new mongodb.ObjectID(data.payload.groupCreator.trim()) : false;
            let leadersCount = typeof(data.payload.leadersCount) == "number" && data.payload.leadersCount % 1 == 0 && data.payload.leadersCount > 1 ? data.payload.leadersCount : false;
            let token = typeof (data.headers.token) == "string" && data.headers.token.trim().length == 24 ? new mongodb.ObjectID(data.headers.token.trim()) : false;

            
            //Optionals
            let groupImg = typeof(data.payload.groupImg) == "string" && data.payload.groupImg.trim().length > 0 ? data.payload.groupImg.trim() : false;
            let description = typeof(data.payload.description) == "string" && data.payload.description.trim().length > 0 && data.payload.description.trim().length < 400 ? data.payload.description.trim() : false;
            let maxMember = typeof(data.payload.maxMember) == "number" && data.payload.maxMember % 1 == 0 ? data.payload.maxMember : 0;
            let minMember = typeof(data.payload.minMember) == "number" && data.payload.minMember % 1 == 0 ? data.payload.minMember : 0;
            let groupCat = typeof(data.payload.groupCat) == "string" && data.payload.groupCat.trim().length > 0 ? data.payload.groupCat.trim() : false;
            let groupPurpose = typeof(data.payload.groupPurpose) == "string" && data.payload.groupPurpose.trim().length > 0 ? data.payload.groupPurpose.trim() : false;

            if(token){
                handlers._tokens.verifyToken(token, groupCreator, function(tokenValid){
                    if (tokenValid){
                        if (groupname && groupID && leadersCount){
                        } else {
                            callback(400, {"Error": "Required fields not provided"});
                        }
                    } else {
                        callback(400, {"Error": "Invalid token provided"});
                    }
                });
            } else {
                callback(400, {"Error": "Token not provided"});
            }
        }
    },

    // ping for uptime monitoring
    ping: function (data, callback) {
        callback(200);
    },


    // Not found handler
    notFound: function (data, callback) {
        callback(404, {"Error": "Thank you, but you missed your road!"});
    }
}