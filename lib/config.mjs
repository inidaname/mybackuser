/**
 *  Generally configuration
 *
 * @summary Generally configuration for the enviroment app
 * @author Hassan Sani
 *
 * Created at     : 2018-08-09 01:30:12 
 * Last modified  : 2018-08-09 02:39:06
 */

let enviorments = {
    dev: {
        "httpPort" : 3000,
        "httpsPort": 3001,
        "envName" : "Dev",
        "hashSecret": "thisIsIt",
        "MongoURL": "mongodb://localhost:27017",
        "MongoDB": "randomusers",
        "templateGlobals": {
            "appName": "UptimeChecker",
            "companyName": "All Hands",
            "yearCreated": "2018",
            "baseUrl": "http://localhost:3000",
        }
    },

    production: {
        "httpPort" : 3000,
        "httpsPort": 3001,
        "envName" : "Production",
        "hashSecret": "thisIsIt",
        "maxChecks": 5,
        "templateGlobals": {
            "appName": "UptimeChecker",
            "companyName": "All Hands",
            "yearCreated": "2018",
            "baseUrl": "http://localhost:3000"
        }        
    }
}


// Determine which enviorments should be exported out
let currentEnvironment = typeof(process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase() : "";

// check that current envi exist and Export the modules
export default typeof(enviorments[currentEnvironment]) == "object" ? enviorments[currentEnvironment] : enviorments.dev;
