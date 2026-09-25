import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/transaction/payment/items'

export interface VendorPaymentItem {
  invoicedate :any
  invoiceno : any
  invoicetotal : any
  stilldue : any
  amtallocated : any
  apply? :any
  status? : any
  key? : any
}

export interface VendorPaymentItemPost {
  vendor_payment_id: number,
  items: VendorPaymentItem[];
}

export const vendorApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listVendorPaymentItem: build.query<ListResponse<VendorPaymentItem>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.VENDOR_PAYMENT_ITEM_ITEM, key })),
        { type: tags.VENDOR_PAYMENT_ITEM_ITEM, id: 'LIST' },
      ] : [{ type: tags.VENDOR_PAYMENT_ITEM_ITEM, id: 'LIST' }],
    }),
    addVendorPaymentItems: build.mutation<VendorPaymentItemPost, Partial<VendorPaymentItemPost>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR_PAYMENT_ITEM_ITEM, id: 'LIST' },{ type: tags.TRANSACTION, id: 'LIST' }],
    }),
    getVendorPaymentItem: build.query<VendorPaymentItem, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_VendorPaymentItem, _err, id) => [{ type: tags.VENDOR_PAYMENT_ITEM_ITEM, id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddVendorPaymentItemsMutation,
  useGetVendorPaymentItemQuery,
  useListVendorPaymentItemQuery,
  useGetErrorProneQuery
} = vendorApi

export const {
  endpoints: { getVendorPaymentItem },
} = vendorApi
