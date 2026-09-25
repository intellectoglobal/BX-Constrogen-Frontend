import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQueryWithProject, ListResponse } from '@igblsln/model';


export const customApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getOverallExpense: build.query<any, { projectId?: number }>({
      query: ({ projectId }) => ({
        url: urlUtils("/expense/overall-expenses/", `${projectId ? `?project_id=${projectId}` : ''}`),
      }),
    }),
    getMaterialExpenses: build.query<[], PagingQueryWithProject>({
      query: ({ page, size, projectId }) => {
        return {
          url: urlUtils("/expense/material-expenses/", `?without_pagination=1&page=${page || 1}&page_size=${size || PAGE_SIZE}${projectId ? `&project_id=${projectId}` : ''}`),
        };
      }
    }),
    getContractExpenses: build.query<ListResponse<any>, PagingQueryWithProject>({
      query: ({ page, size, projectId }) => {
        return {
          url: urlUtils("/expense/contract-expenses/", `?page=${page || 1}&page_size=${size || PAGE_SIZE}${projectId ? `&project_id=${projectId}` : ''}`),
        };
      }
    }),
    getExtraExpenses: build.query<ListResponse<any>, PagingQueryWithProject>({
      query: ({ page, size, projectId }) => {
        return {
          url: urlUtils("/expense/extra-expenses/", `?page=${page || 1}&page_size=${size || PAGE_SIZE}${projectId ? `&project_id=${projectId}` : ''}`),
        };
      }
    }),
    getSalaryExpenses: build.query<ListResponse<any>, PagingQueryWithProject>({
      query: ({ page, size, projectId }) => {
        return {
          url: urlUtils("/expense/salary-expenses/", `?page=${page || 1}&page_size=${size || PAGE_SIZE}${projectId ? `&project_id=${projectId}` : ''}`),
        };
      }
    }),

    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useGetOverallExpenseQuery,
  useGetMaterialExpensesQuery,
  useGetContractExpensesQuery,
  useGetExtraExpensesQuery,
  useGetSalaryExpensesQuery,
  useGetErrorProneQuery,
} = customApi

