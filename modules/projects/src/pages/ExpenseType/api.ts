import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = 'project/expense/type/'

export interface ExpenseType {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const expenseTypeApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listExpenseType: build.query<ListResponse<ExpenseType>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: "EXPENSE_TYPE", id })),
        { type: "EXPENSE_TYPE", id: 'LIST' },
      ] : [{ type: "EXPENSE_TYPE", id: 'LIST' }],
    }),
    addExpenseType: build.mutation<ExpenseType, Partial<ExpenseType>>({
      query: (body) => ({
        url: API_PATH ,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "EXPENSE_TYPE", id: 'LIST' }],
    }),
    getExpenseType: build.query<ExpenseType, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ExpenseType, _err, id) => [{ type: "EXPENSE_TYPE", id }],
    }),
    updateExpenseType: build.mutation<ExpenseType, Partial<ExpenseType>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (expense) => [{ type: "EXPENSE_TYPE", id: expense?.id }],
    }),
    deleteExpenseType: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (expense) => [{ type: "EXPENSE_TYPE", id: expense?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddExpenseTypeMutation,
  useDeleteExpenseTypeMutation,
  useGetExpenseTypeQuery,
  useListExpenseTypeQuery,
  useUpdateExpenseTypeMutation,
  useGetErrorProneQuery,
} = expenseTypeApi

