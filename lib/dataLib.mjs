/**
 * The data storage structure, with the space of not to use database
 * This will be restructure for mongoDB pure API
 *
 * @summary Data Storage
 * @author Hassan Sani
 *
 * Created at     : 2018-08-09 04:24:08 
 * Last modified  : 2018-08-13 00:20:06
 */

import fs from "fs";
import path from "path";
import expose from "./expose";
import {ParsedJSON} from "./helperLib";
import mongodb from "mongodb";
import assert from "assert";
import config from "./config";

const MongoClient = mongodb.MongoClient;

// Connecting to mongodb
// const client = await MongoClient.connect(config.MongoURL);
// const client = connect.db(config.MongoDB);


const {__dirname} = expose;

export default {

    async create(collection, data, callback){
        
        let client;
        try {
            client = await MongoClient.connect(config.MongoURL, { useNewUrlParser: true });
            const db = client.db(config.MongoDB);
            let r = await db.collection(collection).insertOne(data, function(err, resp){
                if(!err && resp) {
                    callback(false, resp.ops[0]);
                } else {
                    callback("Error could not store data" + err);
                }
            });
        } catch (error) {
            callback(error);
            
        }
        client.close();
    },

    async read(collection, readID, callback){
        let client;
        try {
            client = await MongoClient.connect(config.MongoURL,{ useNewUrlParser: true });
            const db = client.db(config.MongoDB);
            let r = await db.collection(collection).findOne({$or: [{"_id": readID}, {email: readID}, {groupID: readID}]}, function(err, doc){
                if(!err && doc){
                    callback(false, doc);
                } else {
                    callback(err);
                }
            });
        } catch(error){
            callback(error);
        }

        client.close();
    },

    async readAll(collection, callback){
        let client;
        try {
            client = await MongoClient.connect(config.MongoURL, { useNewUrlParser: true });
            const db = client.db(config.MongoDB);
            let r = await db.collection(collection).find({}).each(function(err, docs){
                if(!err && doc){
                    callback(false, docs);
                } else {
                    callback(err);
                }
            });
        } catch (error) {
            callback(error);
        }

        client.close();
    },

    async update(collection, updateID, UpdateData, callback){
        let client;
        try {
            client = await MongoClient.connect(config.MongoURL, { useNewUrlParser: true });
            const db = client.db(config.MongoDB);

            let r = await db.collection(collection).findOneAndUpdate({_id: updateID}, {$set: UpdateData}, function(err, result){
                if(!err && result){
                    callback(false, result);
                } else {
                    callback(err);
                }    
            });
        } catch (error) {
            callback(error);
        }

        client.close();
    },

    async delete(collection, deleteID, callback){
        let client;
        try {
            client = await MongoClient.connect(config.MongoURL, { useNewUrlParser: true });
            const db = client.db(config.MongoDB);
            let r = await db.collection(collection).deleteOne({_id: deleteID}, function(err, delResp){
                if(!err && delResp){
                    callback(false, delResp);
                } else {
                    callback(err);
                }
            });
        } catch (error) {
            callback(error);
        }

        client.close();
    }
};