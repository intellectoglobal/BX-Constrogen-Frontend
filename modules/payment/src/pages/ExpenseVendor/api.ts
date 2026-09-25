import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'

const API_PATH = '/project/expense_vendor/'

export interface ExpenseVendor {
  id : any
  key: any
  name: any
}
type ExpenseVendorsResponse = ExpenseVendor[]

export const expenseVendorApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getExpenseVendors: build.query<ExpenseVendorsResponse, void>({
      query: () => {
        return {
          url: urlUtils(API_PATH,`?without_pagination=1`),
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.EXPENSE_VENDORS, id } as const)),
        { type: tags.EXPENSE_VENDORS, id: 'LIST' },
      ],
    }),
    addExpenseVendor: build.mutation<ExpenseVendor, Partial<ExpenseVendor>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.EXPENSE_VENDORS, id: 'LIST' }],
    }),
    getExpenseVendor: build.query<ExpenseVendor, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ExpenseVendor, _err, id) => [{ type: tags.EXPENSE_VENDORS, id }],
    }),
    updateExpenseVendor: build.mutation<ExpenseVendor, Partial<ExpenseVendor>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (expense_vendor) => [{ type: tags.EXPENSE_VENDORS, id: expense_vendor?.id }],
    }),
    deleteExpenseVendor: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (expense_vendor) => [{ type: tags.EXPENSE_VENDORS, id: expense_vendor?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddExpenseVendorMutation,
  useDeleteExpenseVendorMutation,
  useGetExpenseVendorQuery,
  useGetExpenseVendorsQuery,
  useUpdateExpenseVendorMutation,
  useGetErrorProneQuery,
} = expenseVendorApi

export const {
  endpoints: { getExpenseVendor },
} = expenseVendorApi
