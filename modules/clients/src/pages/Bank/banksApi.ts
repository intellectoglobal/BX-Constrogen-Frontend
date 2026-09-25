import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/client/bank/'

export interface Bank {
  id: number;
  key: number;
  bank_name: string;
  role:any;
  bank:any;
  client_id:any;
  bank_accounts?:any[]
  project_status:any;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const bankApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listBank: build.query<ListResponse<Bank>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: `${API_PATH}?page=${page || 1}&page_size=${size || PAGE_SIZE}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.results.map(({ key }) => ({ type: "BANK", key })),
        { type: "BANK", id: 'LIST' },
      ] : [{ type: "BANK", id: 'LIST' }],
    }),
    addBank: build.mutation<Bank, Partial<Bank>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "BANK", id: 'LIST' }],
    }),
    getBank: build.query<Bank, any>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Bank, _err, id) => [{ type: "BANK", id }],
    }),
    updateBank: build.mutation<Bank, Partial<Bank>>({
      query(data) {
        const { id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: "BANK", id: project?.id }],
    }),
    deleteBank: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: "BANK", id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddBankMutation,
  useDeleteBankMutation,
  useGetBankQuery,
  useListBankQuery,
  useUpdateBankMutation,
  useGetErrorProneQuery
} = bankApi

