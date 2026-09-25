import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/templates/customer_payment_schedule/'


export const endpointApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listCustomerPaymentSchedule: build.query<ListResponse<any>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: `${API_PATH}?page=${page || 1}&page_size=${size || PAGE_SIZE}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: "CustomerPaymentSchedule", id })),
        { type: "CustomerPaymentSchedule", id: 'LIST' },
      ] : [{ type: "CustomerPaymentSchedule", id: 'LIST' }],
    }),
    addCustomerPaymentSchedule: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "CustomerPaymentSchedule", id: 'LIST' }],
    }),
    getCustomerPaymentSchedule: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_PaymentSchedule, _err, id) => [{ type: "CustomerPaymentSchedule", id }],
    }),
    updateCustomerPaymentSchedule: build.mutation<any, Partial<any>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: "CustomerPaymentSchedule", id: project?.id }],
    }),
    deleteCustomerPaymentSchedule: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: "CustomerPaymentSchedule", id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddCustomerPaymentScheduleMutation,
  useDeleteCustomerPaymentScheduleMutation,
  useGetCustomerPaymentScheduleQuery,
  useListCustomerPaymentScheduleQuery,
  useUpdateCustomerPaymentScheduleMutation,
  useGetErrorProneQuery
} = endpointApi

