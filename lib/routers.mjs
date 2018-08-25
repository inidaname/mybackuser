/**
 * Router define section
 *
 * @summary for all routes
 * @author Hassan Sani
 *
 * Created at     : 2018-08-12 20:46:05 
 * Last modified  : 2018-08-13 04:39:57
 */

import { handlers } from "./handler.mjs";

export const router = {
    'users' : handlers.users,
    'tokens': handlers.tokens,
    'groups': handlers.groups,
    'ping' : handlers.ping
};
