/**
 * long description for the file
 *
 * @summary API for random user and group generator
 * @author Hassan Sani <inidaname>
 *
 * Created at     : 2018-08-09 01:16:49 
 * Last modified  : 2018-08-12 20:39:59
 */

import {server} from "./lib/server";

const app = {

    // instatiating the app
    init: function(){

        // Start ther server
        server.init();


    }
};

app.init();