import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/inventory/item_uom/'

export interface UOMs {
  id: string
  key: number
  descr: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const UOMsApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listUOMs: build.query<ListResponse<UOMs>, PagingQuery>({
      query: ({ page, size, type }) => {
        return {
          // url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&filter=${filter}`),
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${type ? `&type=${type}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.UOM, id })),
        { type: tags.UOM, id: 'LIST' },
      ] : [{ type: tags.UOM, id: 'LIST' }],
    }),
    addUOMs: build.mutation<UOMs, Partial<UOMs>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.UOM, id: 'LIST' }],
    }),
    getUOMs: build.query<UOMs, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_UOMs, _err, id) => [{ type: tags.UOM, id }],
    }),
    updateUOMs: build.mutation<UOMs, Partial<UOMs>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.UOM, id: project?.id }],
    }),
    deleteUOMs: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.UOM, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddUOMsMutation,
  useDeleteUOMsMutation,
  useGetUOMsQuery,
  useListUOMsQuery,
  useUpdateUOMsMutation,
  useGetErrorProneQuery,
} = UOMsApi

export const {
  endpoints: { getUOMs },
} = UOMsApi
