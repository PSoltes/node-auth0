import zlib from 'zlib';
import * as dotenv from 'dotenv';
import nock from 'nock';
dotenv.config({
  path: './examples/playground/.env',
});

if (process.env.RECORD) {
  type Definition = nock.Definition & { rawHeaders: string[]; responseIsBinary: boolean };

  const parseNockDef = (def: Definition) => {
    const headers = def.rawHeaders;
    // nock doesn't handle Brotli compression.
    if (headers[headers.indexOf('Content-Encoding') + 1] === 'br') {
      def.response = JSON.parse(
        zlib
          .brotliDecompressSync(Buffer.from((def.response as string[]).join(''), 'hex'))
          .toString('utf-8')
      );
    }
    const { rawHeaders, reqheaders, responseIsBinary, ...ret } = def;
    return ret;
  };

  nock.recorder.rec({
    output_objects: true,
    use_separator: false,
    async logging(content: Definition) {
      console.log(JSON.stringify(parseNockDef(content), null, 2));
    },
  } as any);
}

import {
  ManagementClient,
  ManagementClientOptionsWithClientAssertion,
  ManagementClientOptionsWithClientSecret,
  AuthenticationClient,
} from '../../src';

const opts = {
  domain: process.env.AUTH0_DOMAIN as string,
  clientId: process.env.AUTH0_CLIENT_ID as string,
};

if (process.env.AUTH0_CLIENT_SECRET) {
  (opts as ManagementClientOptionsWithClientSecret).clientSecret = process.env.AUTH0_CLIENT_SECRET;
}

if (process.env.AUTH0_CLIENT_ASSERTION_SIGING_KEY) {
  (opts as ManagementClientOptionsWithClientAssertion).clientAssertionSigningKey =
    process.env.AUTH0_CLIENT_ASSERTION_SIGING_KEY;
}

const mgmntClient = new ManagementClient(
  opts as ManagementClientOptionsWithClientAssertion | ManagementClientOptionsWithClientSecret
);

async function testClients() {
  const { data: newClient } = await mgmntClient.clients.create({
    name: 'Test',
  });

  console.log('Create a client: ' + newClient.name);

  const { data: client } = await mgmntClient.clients.get({
    id: newClient.client_id as string,
  });

  console.log('Get the client: ' + client.name);

  const { data: updatedClient } = await mgmntClient.clients.update(
    {
      id: client.client_id as string,
    },
    { name: 'Test2' }
  );

  console.log('Updated the client: ' + updatedClient.name);

  await mgmntClient.clients.delete({
    id: newClient.client_id as string,
  });

  console.log('Removed the client: ' + updatedClient.name);
}

async function testAuth() {
  const auth = new AuthenticationClient(opts);

  if (process.env.AUTH0_USERNAME) {
    const { data: tokenSet } = await auth.oauth.passwordGrant({
      username: process.env.AUTH0_USERNAME,
      password: process.env.AUTH0_PASSWORD as string,
      realm: process.env.AUTH0_CONNECTION || 'Username-Password-Authentication',
      scope: 'offline_access openid',
    });
    console.log('Logged in with password grant', tokenSet.id_token);
    const { data: newTokenSet } = await auth.oauth.refreshTokenGrant({
      refresh_token: tokenSet.refresh_token as string,
    });
    console.log('refreshed tokens with refresh grant', newTokenSet.id_token);
  }
}

async function main() {
  await testClients();
  await testAuth();
}

main();
