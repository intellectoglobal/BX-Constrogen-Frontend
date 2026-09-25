import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/project/payterm/'

export interface PaymentTerm {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const paymentTermApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPaymentTerm: build.query<ListResponse<PaymentTerm>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.PAYMENT_TERM, id })),
        { type: tags.PAYMENT_TERM, id: 'LIST' },
      ] : [{ type: tags.PAYMENT_TERM, id: 'LIST' }],
    }),
    addPaymentTerm: build.mutation<PaymentTerm, Partial<PaymentTerm>>({
      query: (body) => ({
        url: API_PATH ,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PAYMENT_TERM, id: 'LIST' }],
    }),
    getPaymentTerm: build.query<PaymentTerm, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_PaymentTerm, _err, id) => [{ type: tags.PAYMENT_TERM, id }],
    }),
    updatePaymentTerm: build.mutation<PaymentTerm, Partial<PaymentTerm>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (payment) => [{ type: tags.PAYMENT_TERM, id: payment?.id }],
    }),
    deletePaymentTerm: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (payment) => [{ type: tags.PAYMENT_TERM, id: payment?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddPaymentTermMutation,
  useDeletePaymentTermMutation,
  useGetPaymentTermQuery,
  useListPaymentTermQuery,
  useUpdatePaymentTermMutation,
  useGetErrorProneQuery,
} = paymentTermApi

export const {
  endpoints: { getPaymentTerm },
} = paymentTermApi
