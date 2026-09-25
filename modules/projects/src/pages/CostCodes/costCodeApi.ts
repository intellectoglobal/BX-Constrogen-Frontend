import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/client/cost_code/'

export interface CostCode {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const costCodeApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listCostCode: build.query<ListResponse<CostCode>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.COST_CODES, id })),
        { type: tags.COST_CODES, id: 'LIST' },
      ] : [{ type: tags.COST_CODES, id: 'LIST' }],
    }),
    addCostCode: build.mutation<CostCode, Partial<CostCode>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.COST_CODES, id: 'LIST' }],
    }),
    getCostCode: build.query<CostCode, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_CostCode, _err, id) => [{ type: tags.COST_CODES, id }],
    }),
    updateCostCode: build.mutation<CostCode, Partial<CostCode>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.COST_CODES, id: project?.id }],
    }),
    deleteCostCode: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.COST_CODES, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddCostCodeMutation,
  useDeleteCostCodeMutation,
  useGetCostCodeQuery,
  useListCostCodeQuery,
  useUpdateCostCodeMutation,
  useGetErrorProneQuery,
} = costCodeApi

export const {
  endpoints: { getCostCode },
} = costCodeApi
