import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/project/expense/'

export interface Expense {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
  type?: any
  itemtype_keys?: any
}




export const expenseApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listExpense: build.query<ListResponse<Expense>, any>({
      query: ({ page, size, project }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE} ${project ? `&project=${project}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: "EXPENSES", id })),
        { type: "EXPENSES", id: 'LIST' },
      ] : [{ type: "EXPENSES", id: 'LIST' }],
    }),
    addExpense: build.mutation<Expense, Partial<Expense>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "EXPENSES", id: 'LIST' }],
    }),
    getExpense: build.query<Expense, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Expense, _err, id) => [{ type: "EXPENSES", id }],
    }),
    updateExpense: build.mutation<Expense, Partial<Expense>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: "EXPENSES", id: project?.id }],
    }),
    deleteExpense: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: "EXPENSES", id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseQuery,
  useListExpenseQuery,
  useUpdateExpenseMutation,
  useGetErrorProneQuery,
} = expenseApi