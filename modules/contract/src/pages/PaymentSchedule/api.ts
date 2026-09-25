import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/templates/payment_schedule/'


export const endpointApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPaymentSchedule: build.query<ListResponse<any>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: `${API_PATH}?page=${page || 1}&page_size=${size || PAGE_SIZE}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: "PaymentSchedule", id })),
        { type: "PaymentSchedule", id: 'LIST' },
      ] : [{ type: "PaymentSchedule", id: 'LIST' }],
    }),
    addPaymentSchedule: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "PaymentSchedule", id: 'LIST' }],
    }),
    getPaymentSchedule: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_PaymentSchedule, _err, id) => [{ type: "PaymentSchedule", id }],
    }),
    updatePaymentSchedule: build.mutation<any, Partial<any>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: "PaymentSchedule", id: project?.id }],
    }),
    deletePaymentSchedule: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: "PaymentSchedule", id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddPaymentScheduleMutation,
  useDeletePaymentScheduleMutation,
  useGetPaymentScheduleQuery,
  useListPaymentScheduleQuery,
  useUpdatePaymentScheduleMutation,
  useGetErrorProneQuery
} = endpointApi

