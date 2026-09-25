import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/columnbody/'

export interface ColumnBody {
  "key" : any
  "name": any
  "base_qty": any
  "projblk_key": any
  "uom_key": any
  "proj_key": any
  "descr": any
}


export const columnBodyApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listColumnBody: build.query<ListResponse<ColumnBody>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.COLUMN_BODY, key })),
        { type: tags.COLUMN_BODY, id: 'LIST' },
      ] : [{ type: tags.COLUMN_BODY, id: 'LIST' }],
    }),
    addColumnBody: build.mutation<ColumnBody, Partial<ColumnBody>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.COLUMN_BODY, id: 'LIST' }],
    }),
    getColumnBody: build.query<ColumnBody, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ColumnBody, _err, id) => [{ type: tags.COLUMN_BODY, id }],
    }),
    updateColumnBody: build.mutation<ColumnBody, Partial<ColumnBody>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (data) => [{ type: tags.COLUMN_BODY, id: data?.key }],
    }),
    deleteColumnBody: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (data) => [{ type: tags.COLUMN_BODY, id: data?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddColumnBodyMutation,
  useDeleteColumnBodyMutation,
  useGetColumnBodyQuery,
  useListColumnBodyQuery,
  useUpdateColumnBodyMutation,
  useGetErrorProneQuery,
} = columnBodyApi
