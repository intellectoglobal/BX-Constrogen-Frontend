import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/inventory/purpose/'

export interface Purposes {
  id: string
  key: number
  descr: string;
  name: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const purposesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPurposes: build.query<ListResponse<Purposes>, PagingQuery>({
      query: ({ page, size, type }) => {
        return {
          // url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&filter=${filter}`),
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${type ? `&type=${type}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.INVENTORY_MFGR, id })),
        { type: tags.INVENTORY_MFGR, id: 'LIST' },
      ] : [{ type: tags.INVENTORY_MFGR, id: 'LIST' }],
    }),
    addPurposes: build.mutation<Purposes, Partial<Purposes>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.INVENTORY_MFGR, id: 'LIST' }],
    }),
    getPurposes: build.query<Purposes, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Purposes, _err, id) => [{ type: tags.INVENTORY_MFGR, id }],
    }),
    updatePurposes: build.mutation<Purposes, Partial<Purposes>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.INVENTORY_MFGR, id: project?.id }],
    }),
    deletePurposes: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.INVENTORY_MFGR, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddPurposesMutation,
  useDeletePurposesMutation,
  useGetPurposesQuery,
  useListPurposesQuery,
  useUpdatePurposesMutation,
  useGetErrorProneQuery,
} = purposesApi

export const {
  endpoints: { getPurposes },
} = purposesApi
