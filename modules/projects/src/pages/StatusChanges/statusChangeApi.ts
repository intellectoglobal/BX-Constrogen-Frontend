import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQueryWithProject, ListResponse } from '@igblsln/model';

const API_PATH = '/project/history/status/'

export interface StatusChange {
  id: any
  key: number
  effdate: any
  projstatus_key : any
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const statusChangeApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listStatusChange: build.query<ListResponse<StatusChange>, PagingQueryWithProject>({
      query: ({ page, size, projectId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&project=${projectId || ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.STATUS_CHANGE, id })),
        { type: tags.STATUS_CHANGE, id: 'LIST' },
      ] : [{ type: tags.STATUS_CHANGE, id: 'LIST' }],
    }),
    addStatusChange: build.mutation<StatusChange, Partial<StatusChange>>({
      query: (body) => ({
        url: API_PATH ,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.STATUS_CHANGE, id: 'LIST' }],
    }),
    getStatusChange: build.query<StatusChange, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_StatusChange, _err, id) => [{ type: tags.STATUS_CHANGE, id }],
    }),
    updateStatusChange: build.mutation<StatusChange, Partial<StatusChange>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (status) => [{ type: tags.STATUS_CHANGE, id: status?.id }],
    }),
    deleteStatusChange: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (status) => [{ type: tags.STATUS_CHANGE, id: status?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddStatusChangeMutation,
  useDeleteStatusChangeMutation,
  useGetStatusChangeQuery,
  useListStatusChangeQuery,
  useUpdateStatusChangeMutation,
  useGetErrorProneQuery,
} = statusChangeApi

export const {
  endpoints: { getStatusChange },
} = statusChangeApi
