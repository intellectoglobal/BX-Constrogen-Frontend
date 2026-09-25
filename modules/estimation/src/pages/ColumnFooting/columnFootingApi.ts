import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/columnfooting/'

export interface ColumnFooting {
  "key" : any
  "name": any
  "base_qty": any
  "projblk_key": any
  "uom_key": any
  "proj_key": any
  "descr": any
}


export const columnFootingApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listColumnFooting: build.query<ListResponse<ColumnFooting>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.COLUMN_FOOTING, key })),
        { type: tags.COLUMN_FOOTING, id: 'LIST' },
      ] : [{ type: tags.COLUMN_FOOTING, id: 'LIST' }],
    }),
    addColumnFooting: build.mutation<ColumnFooting, Partial<ColumnFooting>>({
      query: (footing) => ({
        url: API_PATH,
        method: 'POST',
        footing,
      }),
      invalidatesTags: [{ type: tags.COLUMN_FOOTING, id: 'LIST' }],
    }),
    getColumnFooting: build.query<ColumnFooting, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ColumnFooting, _err, id) => [{ type: tags.COLUMN_FOOTING, id }],
    }),
    updateColumnFooting: build.mutation<ColumnFooting, Partial<ColumnFooting>>({
      query(data) {
        const footing = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          footing,
        }
      },
      invalidatesTags: (data) => [{ type: tags.COLUMN_FOOTING, id: data?.key }],
    }),
    deleteColumnFooting: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (data) => [{ type: tags.COLUMN_FOOTING, id: data?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddColumnFootingMutation,
  useDeleteColumnFootingMutation,
  useGetColumnFootingQuery,
  useListColumnFootingQuery,
  useUpdateColumnFootingMutation,
  useGetErrorProneQuery,
} = columnFootingApi
