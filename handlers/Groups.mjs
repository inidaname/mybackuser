import mongodb from "mongodb";
import dataLib from "../lib/dataLib";
import { createRandomString } from "../lib/helperLib";
import tokens from "../lib/handler";

export const groupMethod = {
    // Group creation by user
    post(data, callback){
        // required fields: Group Name, max-leader, group-unique-name, userID
        // optional: group desc, group closing date, max-members, group min-members, group-image, group-purpose, group-category,
        let groupName = typeof(data.payload.groupName) == "string" && data.payload.groupName.trim().length > 0 ? data.payload.groupName.trim() : false;
        let groupID = typeof(data.payload.groupID) == "string" && data.payload.groupID.trim().length > 0 && data.payload.groupID.trim().length < 15 ? data.payload.groupID.trim() : false;
        let groupCreator = typeof(data.payload.groupCreator) == "string" && data.payload.groupCreator.trim().length > 0 ? new mongodb.ObjectID(data.payload.groupCreator.trim()) : false;
        let leadersCount = typeof(data.payload.leadersCount) == "number" && data.payload.leadersCount % 1 == 0 && data.payload.leadersCount > 1 ? data.payload.leadersCount : false;
        let token = typeof (data.headers.token) == "string" && data.headers.token.trim().length == 24 ? new mongodb.ObjectID(data.headers.token.trim()) : false;

        
        //Optionals
        let groupImg = typeof(data.payload.groupImg) == "string" && data.payload.groupImg.trim().length > 0 ? data.payload.groupImg.trim() : false;
        let description = typeof(data.payload.description) == "string" && data.payload.description.trim().length > 0 && data.payload.description.trim().length < 400 ? data.payload.description.trim() : false;
        // let maxMember = typeof(data.payload.maxMember) == "number" && data.payload.maxMember % 1 == 0 ? data.payload.maxMember : 0;
        // let minMember = typeof(data.payload.minMember) == "number" && data.payload.minMember % 1 == 0 ? data.payload.minMember : 0;
        let groupCat = typeof(data.payload.groupCat) == "string" && data.payload.groupCat.trim().length > 0 ? data.payload.groupCat.trim() : false;
        let groupPurpose = typeof(data.payload.groupPurpose) == "string" && data.payload.groupPurpose.trim().length > 0 ? data.payload.groupPurpose.trim() : false;

        if(token){
            tokens._tokens.verifyToken(token, groupCreator, function(tokenValid){
                if (tokenValid){
                    if (groupName && groupID){
                        dataLib.read("groups", {groupID: groupID}, function(err, groupData){
                            if(!err && groupData){
                                callback(400, {"Error": "This group unique name already exist"});
                            } else {
                                let groupLeads = (leadersCount) ? leadersCount : 1;
                                // @TODO: Send sub group link to group leaders
                                // let groupMainLink = createRandomString(24);
                                let groupLeadLink = createRandomString(24);
                                let groupMemLink = createRandomString(24);
                                let dateCreated = new Date();
                                let groupObj = {
                                    "groupCreator": groupCreator,
                                    "groupName": groupName,
                                    "groupID": groupID,
                                    "groupImg": groupImg,
                                    "groupCat": groupCat,
                                    "description": description,
                                    "groupPurpose": groupPurpose,
                                    "groupLeadLink": groupLeadLink,
                                    "groupMemLink": groupMemLink,
                                    "dateCreated": dateCreated,
                                    "active": true,
                                    "leadsCount": groupLeads
                                };

                                dataLib.create("groups", groupObj, function(err, created){
                                    if(!err && created){
                                        callback(200, created);
                                    } else {
                                        callback(500, {"Error": "Could not create group"});
                                    }
                                });
                            }
                        });
                    } else {
                        callback(400, {"Error": "Must provide a Group Name and a Group ID"});
                    }
                } else {
                    callback(400, {"Error": "Invalid token provided"});
                }
            });
        } else {
            callback(400, {"Error": "Token not provided"});
        }
    },

    get(data, callback){
        let id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 24 ? new mongodb.ObjectID(data.queryStringObject.id.trim()) : false;
        let userID = typeof(data.queryStringObject.userID) == "string" && data.queryStringObject.userID.trim().length == 24 ? new mongodb.ObjectID(data.queryStringObject.userID.trim()) : false;
        let groupID = typeof(data.queryStringObject.groupID) == "string" && data.queryStringObject.groupID.trim().length > 0 ? data.queryStringObject.groupID.trim() : false;
        let groupLeadLink = typeof(data.queryStringObject.groupLeadLink) == "string" && data.queryStringObject.groupLeadLink.trim().length == 24 ? data.queryStringObject.groupLeadLink.trim() : false;
        let groupMemLink = typeof(data.queryStringObject.groupMemLink) == "string" && data.queryStringObject.groupMemLink.trim().length == 24 ? data.queryStringObject.groupMemLink.trim() : false;
        let contents = typeof(data.queryStringObject.contents) == "string" && data.queryStringObject.contents.trim().length > 0 ? data.queryStringObject.contents.trim() : false;
        let token = typeof(data.headers.token) == "string" && data.headers.token.trim().length == 24 ? new mongodb.ObjectID(data.headers.token.trim()) : false;
        
        if (id || userID){
            if(token){
                tokens._tokens.verifyToken(token, userID, function(tokenValid){
                    if(tokenValid){
                        if(groupID){
                            dataLib.read("groups", {groupID: groupID}, function(err, groupData){
                                if(!err && groupData){
                                    callback(200, groupData);
                                } else {
                                    callback(404, {"Error": "Group does not exist"});
                                }
                            });
                        } else if(contents == "user" && userID){
                            dataLib.readAll("groups", {groupCreator: userID}, function(err, groups){
                                if(!err && groups){
                                    callback(200, groups);
                                } else {
                                    callback(200, {});
                                }
                            });
                        } else if(contents == "lead" && groupLeadLink){
                            dataLib.read("groups", {groupLeadLink: groupLeadLink}, function(err, groupData){
                                if(!err && groupData){
                                    callback(200, groupData);
                                } else {
                                    callback(404, {"Error": "Group does not exist"});
                                }
                            });
                        } else if (contents == "member" && groupMemLink){
                            dataLib.read("groups", {groupMemLink: groupMemLink}, function(err, group){
                                if(!err && group){
                                    callback(200, group);
                                } else {
                                    callback(404, {"Error": "Group does not exist"});
                                }
                            });
                        } else {
                            callback(400, {"Error": "Missing required fields"});
                        }
                    } else {
                        callback(400, {"Error": "Invalid token provided"});
                    }
                });
            } else {
                callback(400, {"Error": "No token provided"});
            }
        } else {
            callback(400, {"Error": "Missing required fields"});
        }
    },

    put(data, callback){
        let id = typeof(data.payload.id) == "string" && data.payload.id.trim().length == 24 ? new mongodb.ObjectID(data.payload.id.trim()) : false;
        let userID = typeof(data.payload.userID) == "string" && data.payload.userID.trim().length == 24 ? new mongodb.ObjectID(data.payload.userID.trim()) : false;
        let groupName = typeof(data.payload.groupName) == "string" && data.payload.groupName.trim().length > 0 ? data.payload.groupName.trim() : false;
        let groupID = typeof(data.payload.groupID) == "string" && data.payload.groupID.trim().length > 0 && data.payload.groupID.trim().length < 15 ? data.payload.groupID.trim() : false;
        let leadersCount = typeof(data.payload.leadersCount) == "number" && data.payload.leadersCount % 1 == 0 && data.payload.leadersCount > 1 ? data.payload.leadersCount : false;
        let groupImg = typeof(data.payload.groupImg) == "string" && data.payload.groupImg.trim().length > 0 ? data.payload.groupImg.trim() : false;
        let description = typeof(data.payload.description) == "string" && data.payload.description.trim().length > 0 && data.payload.description.trim().length < 400 ? data.payload.description.trim() : false;
        let groupCat = typeof(data.payload.groupCat) == "string" && data.payload.groupCat.trim().length > 0 ? data.payload.groupCat.trim() : false;
        let groupPurpose = typeof(data.payload.groupPurpose) == "string" && data.payload.groupPurpose.trim().length > 0 ? data.payload.groupPurpose.trim() : false;
        let token = typeof(data.headers.token) == "string" && data.headers.token.trim().length == 24 ? new mongodb.ObjectID(data.headers.token.trim()) : false;
        if(token && userID){
            tokens._tokens.verifyToken(token, userID, function(tokenValid){
                if(tokenValid){
                    //
                } else {
                    callback(400, {"Error": "Invalid token provided"});
                }
            });
        } else {
            callback(400, {"Error": "No token provided"});
        }
    }
};