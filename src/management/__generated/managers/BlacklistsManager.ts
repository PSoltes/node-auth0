import * as runtime from '../../runtime';
import type { InitOverrideFunction, ApiResponse } from '../../runtime';
import type { Token } from '../models';

const { BaseAPI } = runtime;

export type InitOverrides = RequestInit | InitOverrideFunction;

export interface GetTokensRequest {
  /**
   * Optional filter on the JWT's aud claim (the client_id to which the JWT was issued).
   * @type {string}
   */
  aud?: string;
}

/**
 *
 */
export class BlacklistsManager extends BaseAPI {
  /**
   * Retrieve the `jti` and `aud` of all tokens that are blacklisted.
   *
   * Note: The <a href="https://auth0.com/docs/jwt">JWT specification</a> states that the `jti` field can be used to prevent replay attacks. Though Auth0 tokens do not include a `jti`, you can nevertheless blacklist a `jti` to prevent a token being used more than a predetermined number of times. This behavior is similar to implementing a nonce (where the token's signature can be thought of as the nonce). If a token gets stolen, it (or the tokens issued after it) should be blacklisted and let expire.
   *
   * Get blacklisted tokens
   * @throws {RequiredError}
   */
  async getAllRaw(
    requestParameters: GetTokensRequest,
    initOverrides?: InitOverrides
  ): Promise<ApiResponse<Array<Token>>> {
    const queryParameters = runtime.applyQueryParams(requestParameters, [
      {
        key: 'aud',
        config: {},
      },
    ]);

    const response = await this.request(
      {
        path: `/blacklists/tokens`,
        method: 'GET',
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response);
  }

  /**
   * Retrieve the `jti` and `aud` of all tokens that are blacklisted.<br/><br/>Note: The <a href=\"https://auth0.com/docs/jwt\">JWT specification</a> states that the `jti` field can be used to prevent replay attacks. Though Auth0 tokens do not include a `jti`, you can nevertheless blacklist a `jti` to prevent a token being used more than a predetermined number of times. This behavior is similar to implementing a nonce (where the token\'s signature can be thought of as the nonce). If a token gets stolen, it (or the tokens issued after it) should be blacklisted and let expire.<br/>
   * Get blacklisted tokens
   */
  async getAll(
    requestParameters: GetTokensRequest = {},
    initOverrides?: InitOverrides
  ): Promise<Array<Token>> {
    const response = await this.getAllRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Add the token identified by the `jti` to a blacklist for the tenant.
   *
   * Blacklist a token
   * @throws {RequiredError}
   */
  async addRaw(bodyParameters: Token, initOverrides?: InitOverrides): Promise<ApiResponse<void>> {
    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/blacklists/tokens`,
        method: 'POST',
        headers: headerParameters,
        body: bodyParameters,
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Add the token identified by the `jti` to a blacklist for the tenant.<br/>
   * Blacklist a token
   */
  async add(bodyParameters: Token, initOverrides?: InitOverrides): Promise<void> {
    await this.addRaw(bodyParameters, initOverrides);
  }
}