import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/transaction/payment/items'

export interface ContractorPaymentItem {
  invoicedate :any
  invoiceno : any
  invoicetotal : any
  stilldue : any
  amtallocated : any
  apply? :any
  status? : any
  key? : any
}

export interface ContractorPaymentItemPost {
  vendor_payment_id: number,
  items: ContractorPaymentItem[];
}

export const contractorApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listContractorPaymentItem: build.query<ListResponse<ContractorPaymentItem>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.VENDOR_PAYMENT_ITEM, key })),
        { type: tags.VENDOR_PAYMENT_ITEM, id: 'LIST' },
      ] : [{ type: tags.VENDOR_PAYMENT_ITEM, id: 'LIST' }],
    }),
    addContractorPaymentItems: build.mutation<ContractorPaymentItemPost, Partial<ContractorPaymentItemPost>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR_PAYMENT_ITEM, id: 'LIST' },{ type: tags.TRANSACTION, id: 'LIST' }],
    }),
    getContractorPaymentItem: build.query<ContractorPaymentItem, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ContractorPaymentItem, _err, id) => [{ type: tags.VENDOR_PAYMENT_ITEM, id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddContractorPaymentItemsMutation,
  useGetContractorPaymentItemQuery,
  useListContractorPaymentItemQuery,
  useGetErrorProneQuery
} = contractorApi
