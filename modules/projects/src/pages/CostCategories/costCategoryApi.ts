import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/client/cost_category/'

export interface CostCategory {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const costCategoryApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listCostCategory: build.query<ListResponse<CostCategory>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.COST_CATEGORIES, id })),
        { type: tags.COST_CATEGORIES, id: 'LIST' },
      ] : [{ type: tags.COST_CATEGORIES, id: 'LIST' }],
    }),
    addCostCategory: build.mutation<CostCategory, Partial<CostCategory>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.COST_CATEGORIES, id: 'LIST' }],
    }),
    getCostCategory: build.query<CostCategory, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_CostCategory, _err, id) => [{ type: tags.COST_CATEGORIES, id }],
    }),
    updateCostCategory: build.mutation<CostCategory, Partial<CostCategory>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.COST_CATEGORIES, id: project?.id }],
    }),
    deleteCostCategory: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.COST_CATEGORIES, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddCostCategoryMutation,
  useDeleteCostCategoryMutation,
  useGetCostCategoryQuery,
  useListCostCategoryQuery,
  useUpdateCostCategoryMutation,
  useGetErrorProneQuery,
} = costCategoryApi

export const {
  endpoints: { getCostCategory },
} = costCategoryApi
