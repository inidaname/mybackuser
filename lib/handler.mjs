/**
 * Handler of API addresse through here
 *
 * @summary API Addresses
 * @author Hassan Sani
 *
 * Created at     : 2018-08-09 03:36:43 
 * Last modified  : 2018-08-13 06:26:01
 */

import dataLib from './dataLib';
import { addNewUser, generateID, createRandomString } from './helperLib.mjs';



export const handlers = {

    // The Users api for reg
    users(data, callback){
        // declaring the acceptable API methods
        var _acceptableMethods = ['post', 'get', 'put', 'delete'];
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
            let fullname = typeof(data.payload.fullname) == 'string' && data.payload.fullname.length >= 5 ? data.payload.fullname : false;
            let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
            let tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

            
            if (fullname && email && tosAgreement){
            // get the user list from master file to check if it already exist
                dataLib.read('master', 'users', function(err, listUsers){
                    if(!err){
                        if(listUsers.length > 0){
                            listUsers.find(gotten => {
                                if (gotten.email !== email) {
                                    // Hash the password
                                    const theID = Date.now() + email;
                                    let hashedID = generateID(theID);
                                    let genStr = createRandomString(24);
                                    if (hashedID && genStr) {
                                        // create the user object
                                        let userObj = {
                                            'id': hashedID,
                                            'fullname': fullname,
                                            'email': email,
                                            'genStr': genStr,
                                            'oldStrs': [],
                                            'tosAgreement': tosAgreement,
                                            'created': new Date()
                                        };
            
                                        let userMaster = {
                                            'id': hashedID,
                                            'email': email
                                        }
            
                                        // store the user
                                        dataLib.create('users', hashedID, userObj, function (err) {
                                            if (!err) {
                                                addNewUser(userMaster);
                                                // TODO create email and send to user with hashedID
                                                callback(200);
                                            } else {
                                                callback(500, {
                                                    'Error': 'Could not create user'
                                                });
                                            }
                                        });
                                    } else {
                                        callback(500, {
                                            'Error': 'Could not hash password'
                                        });
                                    }
                                } else {
                                    callback(400, {'Error': 'A user with that email already exist, if you are the owner please check your mail to login'})
                                }
                            })
                        } else {
                            // Hash the password
                            const theID = Date.now() + email;
                            let hashedID = generateID(theID);
                            let genStr = createRandomString(24);
                            if (hashedID && genStr) {
                                // create the user object
                                let userObj = {
                                    'id': hashedID,
                                    'fullname': fullname,
                                    'email': email,
                                    'genStr': genStr,
                                    'oldStrs': [],
                                    'tosAgreement': tosAgreement,
                                    'created': new Date()
                                };

                                let userMaster = {
                                    'id': hashedID,
                                    'email': email
                                }

                                // store the user
                                dataLib.create('users', hashedID, userObj, function (err) {
                                    if (!err) {
                                        addNewUser(userMaster);
                                        // TODO create email and send to user with hashedID
                                        callback(200);
                                    } else {
                                        callback(500, {
                                            'Error': 'Could not create user'
                                        });
                                    }
                                });
                            } else {
                                callback(500, {
                                    'Error': 'Could not hash password'
                                });
                            }
                        }
                    }
                });
            } else {
                callback(400, {'Error': 'You must fill the required informations'});
            }
        },


        get: function(data, callback) {
            // declaring variables
            let email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
            let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id.trim() : false;

            if (email || id){
                let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                if(token){
                    handlers._tokens.varifyToken(token, id, function(tokenValid){
                        if(tokenValid){
                            // Check user in the master list
                            dataLib.read('master', 'users', function(err, listUsers){
                                if (!err && listUsers.length > 0){
                                    listUsers.find(getUser => {
                                        if (getUser.email === email) {
                                            let userId = getUser.id;
                                            dataLib.read('users', userId, function(err, userData){
                                                if(!err && userData){
                                                    // Sending login datial
                                                    callback(200, userData);
                                                } else {
                                                    callback(500, {'Error': 'Internal error please request for new login details'});
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    callback(400, {'Error': 'This User does not exist!'});
                                }
                            });
                        } else {
                            callback(400, {'Error': 'Invalid token provided'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'Token was not provided'});
                }
            } else {
                callback(400, {'Error': 'Missing required field'});
            }
        },

        // Udpating user profile
        put: function(data, callback){
            // required feilds is id
            // Optional fields are others
            let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length > 0 ? data.payload.id.trim() : false;
            // let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
            // Disable change of email for now

            let fullname = typeof(data.payload.fullname) == 'string' && data.payload.fullname.trim().length >= 5 ? data.payload.fullname.trim() : false;
            let location = typeof(data.payload.location) == 'string' && data.payload.location.trim().length > 0 ? data.payload.location.trim() : false;
            // let interests = typeof(data.payload.interests) == 'object' && data.payload.interests instanceof Array ? data.payload.interests : [];
            let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false;
            // let socials = typeof(data.payload.socials) == 'object' && data.payload.socials instanceof Array ? data.payload.socials : [];
            let changeGetStr = typeof(data.payload.changeGetStr) == 'boolean' && data.payload.changeGetStr == true ? true : false;
            let ThenewgenStr = {}

            if(id){
                let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

                if(token){
                    handlers._tokens.varifyToken(token, id, function(tokenValid){
                        if(tokenValid){
                            if (changeGetStr) {

                                // making sure the similar string is not generated
                                function newgenStr(exStr, strArray){
                                    ThenewgenStr.newStr = createRandomString(24);
                                    if (ThenewgenStr.newStr !== exStr && strArray.indexOf(ThenewgenStr.newStr) === -1){
                                        strArray.push(exStr);
                                        ThenewgenStr.newstrArray = strArray;
                                        return ThenewgenStr;
                                    } else {
                                        newgenStr(exStr, strArray);
                                    }
                                }
            
                                dataLib.read('users'. id, function(err, data){
                                    if(!err && data){
                                        // @TODO: Send a new email for change of string
                                        let strArray = data.oldStrs;
                                        let exStr = data.genStr;
                                        newgenStr(exStr, strArray);
            
                                        data.oldStrs = ThenewgenStr.newstrArray;
                                        data.genStr = ThenewgenStr.newStr;
                                        data.updatedTime = new Date();
            
                                        // updating the user file
                                        dataLib.update('users', id, data, function(err){
                                            if(!err){
                                                callback(200, data);
                                            } else {
                                                callback(500, {'Error': 'Could not update the user'});
                                            }
                                        });
            
                                    } else {
                                        callback(400, {'Error': 'User does not exist'});
                                    }
                                })
                            }
            
                            if(fullname || location ||  phone){
                                dataLib.read('users', id, function(err, userData){
                                    if(!err && userData){
                                        if(fullname){
                                            userData.fullname = fullname;
                                        }
            
                                        if(location){
                                            userData.location = location;
                                        }
                                        if(phone){
                                            userData.phone = phone
                                        }
                                        userData.updatedTime = new Date();
                                        dataLib.update('users', id, userData, function(err){
                                            if(!err){
                                                callback(200, userData);
                                            } else {
                                                callback(500, {'Error': 'Could not update user data'});
                                            }
                                        })
                                    } else {
                                        callback(500, {'Error': 'Could not find the user'});
                                    }
                                })
                            }            
                        } else {
                            callback(400, {'Error': 'Invalid token provided'});
                        }
                    })
                } else {
                    callback(400, {'Error': 'Token was not provided'});
                }
            } else {
                callback(400, {'Error': 'Required field not provided'})
            }
        },

        delete(data, callback){
            // @TODO: delete groups he may belong to
            let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id : false;
            if(id){
                let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                if(token){
                    handlers._tokens.varifyToken(token, id, function(tokenValid){
                        if(tokenValid){
                            dataLib.read('master', 'users', function(err, listUsers){
                                if(!err && listUsers.length > 0){
                                    listUsers.find((getUser, index) => {
                                        if(getUser.id === id){
                                            listUsers.splice(index, 1);
                                            dataLib.delete('users', id, function(err){
                                                if(!err){
                                                    callback(200);
                                                } else {
                                                    callback(500);
                                                }
                                            });
                                        } else {
                                            callback(404);
                                        }
                                    });
                                } else {
                                    callback(500);
                                }
                            });        
                        } else {
                            callback(400, {'Error': 'Invalid token provided'});
                        }
                    });    
                } else {
                    callback(400, {'Error': 'Token was not provided'});
                }
            }
        }

    },

    // token for verification
    tokens(data, callback){
        // declaring the acceptable API methods
        var _acceptableMethods = ['post', 'get', 'put', 'delete'];
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
            let genStr = typeof(data.payload.genStr) == 'string' && data.payload.genStr.trim().length == 24 ? data.payload.genStr.trim() : false;
            let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

            if(email && genStr) {
                // check the master file for the email
                dataLib.read('master', 'users', function(err, listUsers){
                    if(!err && listUsers.length > 0){
                        listUsers.find(getUser => {
                            if (getUser.email === email){
                                let userId = getUser.id;
                                dataLib.read('users', userId, function(err, userData){
                                    if(!err && userData){
                                        if(genStr === userData.genStr){
                                            let tokenId = createRandomString(16);
                                            let expires = Date.now() + 24000 * 60 * 60;
                                            let tokenObj = {
                                                'userId': userId,
                                                'tokenId': tokenId,
                                                'expires': expires
                                            };

                                            // create token and store for user
                                            dataLib.create('tokens', tokenId, tokenObj, function(err){
                                                if(!err){
                                                    callback(200, tokenObj);
                                                } else {
                                                    callback(500, {'Error': 'Failed to create Token'});
                                                }
                                            });
                                        } else {
                                            callback(400, {'Error': 'Provided email link is invalid, please request for a new one'});
                                        }
                                    } else {
                                        callback(500, {'Error': 'Could not read user'});
                                    }
                                });
                            } else {
                                callback(400, {'Error': 'This user is not registered'});
                            }
                        });
                    } else {
                        callback(400, {'Error': 'This user is not registered'});
                    }
                });
            } else {
                callback(400, {'Error': 'Missing Required fields'});
            }
        },

        // get the tokens
        get(data, callback){
            
            let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 16 ? data.queryStringObject.id.trim() : false;
            if(id){
                dataLib.read('tokens', id, function(err, tokenData){
                    if(!err && tokenData){
                        callback(200, tokenData);
                    } else {
                        callback(404);
                    }
                })
            } else {
                callback(400, {'Error': 'No token id provided'});
            }
        },

        // to posibily update token data
        put(data, callback){
            // check for valid number
            let id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 24 ? data.payload.id.trim() : false;
            let extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
            
            if(id && extend) {
                dataLib.read('tokens', id, function(err, tokenData){
                    if(!err && tokenData){
                        if(tokenData.expires > Date.now()){
                            // set the expiration to an hour
                            tokenData.expires = Date.now() + 1000 * 60 * 60;

                            // update the new lenght
                            dataLib.update('tokens', id, tokenData, function (err) {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, {
                                        'Error': 'Could not update the token'
                                    });
                                }
                            });
                        } else {
                            callback(400, {'Error': 'Token provided has already expired'});
                        }
                    } else {
                        callback(400, {'Error': 'Token provided is invalid'});
                    }
                });
            } else {
                callback(400, {'Error': 'Required fields not provided'});
            }
        },

        // Deleting token to log out user
        delete(data, callback){
            // required phone
            // optional none
            // TODO: Only allow an authenticated user

            // check for valid number
            let id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

            if (id) {
                // Look up the user
                _data.read('tokens', id, function (err, data) {
                    if (!err && data) {
                        dataLib.delete('tokens', id, function (err) {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, {'Error': 'Could not delete the Token'});
                            }
                        });
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(400, {'Error': 'Missing required feild'});
            }
        },

        // Verify if a given token id is for a given user
        varifyToken(id, userId, callback) {
            dataLib.read('tokens', id, function (err, data) {
                if (!err && data) {
                    // check data for match phone and has not expires
                    if (data.userId == userId && data.expires <= Date.now()) {
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
        var _acceptableMethods = ['post', 'get', 'put', 'delete'];
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
            // optional: group desc, group closing date, max-members, group min-members, group-purpose, group-category,
            let groupname = typeof(data.payload.groupname) == 'string' && data.payload.groupname.trim().length > 0 ? data.payload.groupname.trim() : false;
            let groupID = typeof(data.payload.groupID) == 'string' && data.payload.groupID.trim().length > 0 && data.payload.groupID.trim().length < 15 ? data.payload.groupID.trim() : false;
            let groupCreator = typeof(data.payload.groupCreator) == 'string' && data.payload.groupCreator.trim().length > 0 ? data.payload.groupCreator.trim() : false;
            let leadersCount = typeof(data.payload.leadersCount) == 'number' && data.payload.leadersCount % 1 == 0 && data.payload.leadersCount > 1 ? data.payload.leadersCount : false;
            let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

            
            //Optionals
            let description = typeof(data.payload.description) == 'string' && data.payload.description.trim().length > 0 && data.payload.description.trim().length < 400 ? data.payload.description.trim() : false;
            let maxMember = typeof(data.payload.maxMember) == 'number' && data.payload.maxMember % 1 == 0 ? data.payload.maxMember : 0;
            let minMember = typeof(data.payload.minMember) == 'number' && data.payload.minMember % 1 == 0 ? data.payload.minMember : 0;
            let groupCat = typeof(data.payload.groupCat) == 'string' && data.payload.groupCat.trim().length > 0 ? data.payload.groupCat.trim() : false;
            let groupPurpose = typeof(data.payload.groupPurpose) == 'string' && data.payload.groupPurpose.trim().length > 0 ? data.payload.groupPurpose.trim() : false;
        }
    },

    // ping for uptime monitoring
    ping: function (data, callback) {
        callback(200);
    },


    // Not found handler
    notFound: function (data, callback) {
        callback(404);
    }
}