import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/leads/budgetsrange/'

export interface BudgetRange {
  key: number
  descr: string;
}

export const budgetRangesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listBudgetRanges: build.query<BudgetRange[], void>({
      query: () => ({
        url: API_PATH,
      }),
      providesTags: (result) => result ? [
        ...result.map(({ key }) => ({ type: tags.CRM_BUDGET_RANGE, id: key })),
        { type: tags.CRM_BUDGET_RANGE, id: 'LIST' },
      ] : [{ type: tags.CRM_BUDGET_RANGE, id: 'LIST' }],
    }),
    addBudgetRanges: build.mutation<BudgetRange, Partial<BudgetRange>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CRM_BUDGET_RANGE, id: 'LIST' }],
    }),
    getBudgetRanges: build.query<BudgetRange, number>({
      query: (key) => `${API_PATH}${key}`,
      providesTags: (_BudgetRange, _err, key) => [{ type: tags.CRM_BUDGET_RANGE, id: key }],
    }),
    updateBudgetRanges: build.mutation<BudgetRange, Partial<BudgetRange>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [
        { type: tags.CRM_BUDGET_RANGE, id: project?.key },
        { type: tags.CRM_BUDGET_RANGE, id: 'LIST' }
      ],
    }),
    deleteBudgetRanges: build.mutation<{ success: boolean; key: number }, number>({
      query(key) {
        return {
          url: `${API_PATH}${key}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [
        { type: tags.CRM_BUDGET_RANGE, id: project?.key },
        { type: tags.CRM_BUDGET_RANGE, id: 'LIST' }
      ],
    }),
  }),
})

export const {
  useAddBudgetRangesMutation,
  useDeleteBudgetRangesMutation,
  useGetBudgetRangesQuery,
  useListBudgetRangesQuery,
  useUpdateBudgetRangesMutation,
} = budgetRangesApi

export const {
  endpoints: { getBudgetRanges },
} = budgetRangesApi
