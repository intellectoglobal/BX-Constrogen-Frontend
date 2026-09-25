import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/client/client/'

export interface Client {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const clientApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listClient: build.query<Array<Client>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: tags.CLIENTS, id })),
        { type: tags.CLIENTS, id: 'LIST' },
      ] : [{ type: tags.CLIENTS, id: 'LIST' }],
    }),
    addClient: build.mutation<Client, Partial<Client>>({
      query: (body) => ({
        url: API_PATH ,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CLIENTS, id: 'LIST' }],
    }),
    getClient: build.query<Client, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Client, _err, id) => [{ type: tags.CLIENTS, id }],
    }),
    updateClient: build.mutation<Client, Partial<Client>>({
      query(data) {
        const { id: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (client) => [{ type: tags.CLIENTS, id: client?.id }],
    }),
    deleteClient: build.mutation<{ success: boolean; id: any }, any>({
      query(id) {
        console.log(id)
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (client) => [{ type: tags.CLIENTS, id: client?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddClientMutation,
  useDeleteClientMutation,
  useGetClientQuery,
  useListClientQuery,
  useUpdateClientMutation,
  useGetErrorProneQuery,
} = clientApi

export const {
  endpoints: { getClient },
} = clientApi
