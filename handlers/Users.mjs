import mongodb from "mongodb";
import dataLib from "../lib/dataLib";
import { createRandomString } from "../lib/helperLib";
import tokens from "../lib/handler";


export const userMethod = {
    // Users list with required fields and methods
    // Required data: Name, Email, TosAgreement
    // Optional: Location, Interest, Phone, Social
    post: function(data, callback){
        // declaring variables
        let fullname = typeof(data.payload.fullname) == "string" && data.payload.fullname.length >= 5 ? data.payload.fullname : false;
        let email = typeof(data.payload.email) == "string" && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
        let tosAgreement = typeof (data.payload.tosAgreement) == "boolean" && data.payload.tosAgreement == true ? true : false;

        if(fullname && email && tosAgreement){
            dataLib.read("users", {email: email}, function(err, userData){
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
                        "genStr": genStr,
                        "createdAt": dateCreated
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
        // let groups = typeof(data.queryStringObject.groups) == "string" && data.queryStringObject.groups.trim().length > 0 ? data.queryStringObject.groups.trim() : false;

        let getData = (id === false) ? email : id;
        if (email || id){
            let token = typeof (data.headers.token) == "string" && data.headers.token.trim().length == 24 ? new mongodb.ObjectID(data.headers.token.trim()) : false;
            
            if(token){
                tokens._tokens.verifyToken(token, getData, function(tokenValid){
                    if(tokenValid){
                        dataLib.read("users", {$or: [{"_id": id}, {email: email}]}, function(err, userData){
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
        // let interests = typeof(data.payload.interests) == "object" && data.payload.interests instanceof Array ? data.payload.interests : [];
        let phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false;
        let socials = typeof(data.payload.socials) == "object" && data.payload.socials instanceof Object ? data.payload.socials : {};
        let changeGetStr = typeof(data.payload.changeGetStr) == "boolean" && data.payload.changeGetStr == true ? true : false;
        // let userGroups = typeof(data.payload.userGroups) == "object" && data.payload.userGroups instanceof Array ? data.payload.userGroups : [];

        if(id){
            let token = typeof (data.headers.token) == "string" && data.headers.token.trim().length == 24 ? new mongodb.ObjectID(data.headers.token.trim()) : false;

            if(token){
                tokens._tokens.verifyToken(token, id, function(tokenValid){
                    if (tokenValid) {
                        // Get the user data for update
                        dataLib.read("users", {"_id": id}, function(err, userData){
                            if(!err && userData){

                                //User request for login string
                                if(changeGetStr){
                                    let newStr = createRandomString(24);
                                    let oldStr = userData.oldStr;
                                    newStr = (oldStr.indexOf(newStr) == -1 && newStr !== userData.genStr) ? newStr : createRandomString(24);

                                    oldStr.push(userData.genStr);
                                    userData.genStr = newStr;
                                    userData.oldStr = oldStr;
                                }

                                // User request for other info change
                                // let groupLists = userData.userGroups, interestLists = userData.interests;

                                if(socials){
                                    userData.socials = socials;
                                }
                                // if(groupLists.length > 0){
                                //     let finalRet = [];
                                //     groupLists.forEach((e1) =>{
                                //         userGroups.forEach((e2) => {
                                //             if (e1 !== e2){
                                //                 finalRet.push(e2);
                                //             }
                                //         });
                                //     });
                                //     let theFinal = [groupLists, ...finalRet];

                                //     userData.userGroups = theFinal;
                                // } else {
                                //     userData.userGroups = [groupLists, ...userGroups];
                                // }
                                
                                // if(interestLists.length > 0){
                                //     let finalRet = [];
                                //     interestLists.forEach((e1) =>{
                                //         interests.forEach((e2) => {
                                //             if (e1 !== e2){
                                //                 finalRet.push(e2);
                                //             }
                                //         });
                                //     });
                                //     let theFinal = [interestLists, ...finalRet];

                                //     userData.interests = theFinal;
                                // } else {
                                //     userData.interests = [interestLists, ...interests];
                                // }

                                if(location){
                                    userData.location = location;
                                }

                                if(phone){
                                    userData.phone = phone;
                                }

                                if(fullname){
                                    userData.fullname = fullname;
                                }

                                if(location || fullname || phone || socials || changeGetStr){
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
                tokens._tokens.verifyToken(token, id, function(tokenValid){
                    if(tokenValid){
                        dataLib.read("users", {"_id": id}, function(err, docs){
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

};