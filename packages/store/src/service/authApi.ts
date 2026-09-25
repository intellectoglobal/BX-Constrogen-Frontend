import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import { tags } from '../constants'
import { RootState } from '../store'
import { getApiUrl } from '../constants'

// Create our authQuery instance
const authQuery = fetchBaseQuery({
  baseUrl: getApiUrl(`auth`),
  prepareHeaders: (headers, { getState }) => {
    // By default, if we have a token in the store, let's use that for authenticated requests
    const userData = (getState() as RootState).auth
    const tokens = userData.token
    if (tokens) {
      let token;
      if(typeof(tokens) == 'string')
        token = JSON.parse(tokens).access
      else if(typeof(tokens) == 'object')
        token = tokens.access
      headers.set('Authorization', `Bearer ${token}`)
      headers.set('x-account', window.btoa(`${userData.client_id}|${userData.company_id}`))
    }
    return headers
  },
})

const baseQueryWithRetry = retry(authQuery, { maxRetries: 0 })

/**
 * Create a base API to inject endpoints into elsewhere.
 * Components using this API should import from the injected site,
 * in order to get the appropriate types,
 * and to ensure that the file injecting the endpoints is loaded 
 */
export const api = createApi({
  /**
   * `reducerPath` is optional and will not be required by most users.
   * This is useful if you have multiple API definitions,
   * e.g. where each has a different domain, with no interaction between endpoints.
   * Otherwise, a single API definition should be used in order to support tag invalidation,
   * among other features
   */
  reducerPath: 'authApi',
  /**
   * A bare bones base query would just be `baseQuery: fetchBaseQuery({ baseUrl: '/' })`
   */
  baseQuery: baseQueryWithRetry,
  /**
   * Tag types must be defined in the original API definition
   * for any tags that would be provided by injected endpoints
   */
  tagTypes: [tags.SETTINGS, tags.AUTH_OTP],
  /**
   * This api has endpoints injected in adjacent files,
   * which is why no endpoints are shown below.
   * If you want all endpoints defined in the same file, they could be included here instead
   */
  endpoints: () => ({}),
})
