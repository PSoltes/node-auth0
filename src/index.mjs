import { createRequire } from 'module';
const require = createRequire(import.meta.url);
/**
 * Simple facade for consuming a REST API endpoint.
 *
 * @external RestClient
 * {@link https://github.com/ngonzalvez/rest-facade}
 */
export const ManagementClient = require('./management/index.js');
export const AuthenticationClient = require('./auth/index.js');
export default { ManagementClient, AuthenticationClient }
