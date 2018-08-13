/**
 * File for function helpers
 *
 * @summary helpers
 * @author Hassan Sani
 *
 * Created at     : 2018-08-09 05:08:02 
 * Last modified  : 2018-08-13 00:49:22
 */

import crypto from 'crypto';
import dataLib from './dataLib';
import configMjs from './config.mjs';

export function ParsedJSON(str) {
    
    try {
        let obj = JSON.parse(str);
        return obj;
    } catch (error) {
        return {};
    }
}

export function generateID(str){
    if (typeof (str) == 'string' && str.length > 0) {
        let hash = crypto.createHmac('sha256', configMjs.hashSecret).update(str).digest('hex');
        // get the user from master file to check if id exist
        dataLib.read('master', 'users', function(err, listUsers){
            if(!err && listUsers.length > 0){
                listUsers.find(gotten => {
                    if (gotten.id === hash) {
                        return generateID(str);
                    }
                })
            }
        });
        return hash;
    } else {
        return false;
    }
};

// Adding new user to the master list
export function addNewUser(objData){
    return new Promise((reso, rej) => {
        dataLib.read('master', 'users', function(err, listUsers){
            if(!err){
                if(listUsers.length > 0){
                    listUsers.find(gotten => {
                        if(gotten.email !== objData.email || gotten.id !== objData.id){
                            listUsers.push(objData);
                            dataLib.update('master', 'users', listUsers, function(err){
                                if(!err){
                                    reso(true);
                                } else {
                                    rej('Could not update the file');
                                }
                            });
                        } else {
                            rej(false);
                        }
                    });
                } else {
                    listUsers.push(objData);
                    dataLib.update('master', 'users', listUsers, function(err){
                        if(!err){
                            reso(true);
                        } else {
                            rej('Could not update the file');
                        }
                    });
                }
            } else {
                rej(false);
            }
        });
    });
};

export function createRandomString(strlength) {
    strlength = typeof (strlength) == 'number' && strlength > 0 ? strlength : false;
    if (strlength) {
        // define the possible character for the string
        let possibleCHR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefjghijjklmnopqrstuvwxyz0123456789';

        let str = '';

        for (let i = 1; i <= strlength; i++) {
            let randomChr = possibleCHR.charAt(Math.floor(Math.random() * possibleCHR.length));

            str += randomChr;
        }

        return str;
    } else {
        return false;
    }
};
