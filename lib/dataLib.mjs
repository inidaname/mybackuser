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

import fs from 'fs';
import path from 'path';
import expose from './expose'
import {ParsedJSON} from './helperLib'

const {__dirname} = expose;

export default {
    baseDir: path.join(__dirname, '/../.data/'), // Base directory of where to store the data

    // Creating the file for storage
    create(dir, file, data, callback){
        // Open the file for inserting Data then close
        let self = this
        fs.open(self.baseDir+dir+'/'+file+'.json', 'wx', function(err, fd){

            if(!err && fd){
                // Stringify the data for JSOn storage
                let stringData = JSON.stringify(data);

                // Store the data in the file and create the file
                fs.writeFile(self.baseDir+dir+'/'+file+'.json', stringData, function(err){
                    if(!err){
                        fs.close(fd, function(err){
                            if(!err){
                                callback(false);
                            } else {
                                callback('Error closing file');
                            }
                        });
                    } else {
                        callback('Error writing the file for storage');
                    }
                });
            } else {
                callback('Could not store the data');
            }
        });
    },

    // Reading the file for access
    read(dir, file, callback){
        let self = this;
        fs.readFile(self.baseDir+dir+'/'+file+'.json', function(err, data){
            if(!err && data){
                let parsedData = ParsedJSON(data); //TODO if error check here
                callback(false, parsedData)
            } else {
                callback(err, data);
            }
        });
    },

    update(dir, file, data, callback){
        // Open file first to set up update
        let self = this;
        fs.open(self.baseDir+dir+'/'+file+'.json', 'r+', function(err, fd){
            if(!err, fd){
                let stringData = JSON.stringify(data);

                // truncate the coming data
                fs.truncate(self.baseDir+dir+'/'+file+'.json',function(err){
                    if(!err){
                        // Write data to file to update content
                        fs.writeFile(self.baseDir+dir+'/'+file+'.json', stringData, function(err){
                            if(!err){
                                // Close file
                                fs.close(fd, function(err){
                                    if(!err){
                                        callback(false);
                                    } else {
                                        callback('Failed to close file');
                                    }
                                });
                            } else {
                                callback('Failed to write data into file for update');
                            }
                        });
                    } else {
                        callback('Failed to truncate the file for updating');
                    }
                });
            } else {
                callback('Failed to open file for updating');
            }
        });
    },

    delete(dir, callback){
        let self = this;
        fs.unlink(self.baseDir+dir+'/'+file+'.json', function(err){
            if(!err){
                callback(false);
            } else {
                callback('Failed to delete the file, It may not exist');
            }
        });
    },

    list(dir, callback){
        let self = this
        fs.readdir(self.baseDir+dir+'/', function(err, data){
            if(!err && data && data.length > 0){
                // Array of file names
                let trimmedFile = [];
                data.forEach(fileName => {
                    trimmedFile.push(fileName.replace('.json', ''));
                });
                callback(false, trimmedFile);
            } else {
                callback(err, data);
            }
        });
    }
};