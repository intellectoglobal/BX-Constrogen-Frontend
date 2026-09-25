import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/transaction/vendor/invoice/items/'

export interface InvoiceItem {
  "key": any
  "createddttm": any
  "itemnotes": any
  "createdby": any
  "lastmodifiedby": any
  "lastmodifieddttm": any
  "purtmpl_key": any
  "item_key": any
  "itemuom_key": any
}

export interface InvoiceItemPost {
  invoice_id: number,
  items: InvoiceItem[];
}


export const invoiceItemApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listInvoiceItem: build.query<ListResponse<InvoiceItem>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.INVOICE_ITEM, key })),
        { type: tags.INVOICE_ITEM, id: 'LIST' },
      ] : [{ type: tags.INVOICE_ITEM, id: 'LIST' }],
    }),
    addInvoiceItem: build.mutation<InvoiceItemPost, Partial<InvoiceItemPost>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.INVOICE_ITEM_ITEM, id: 'LIST' },{ type: tags.TRANSACTION, id: 'LIST' }],
    }),
    getInvoiceItem: build.query<InvoiceItem, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_InvoiceItem, _err, id) => [{ type: tags.INVOICE_ITEM, id }],
    }),
    updateInvoiceItem: build.mutation<InvoiceItem, Partial<InvoiceItem>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (orderItem) => [{ type: tags.INVOICE_ITEM, id: orderItem?.key }],
    }),
    deleteInvoiceItem: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (orderItem) => [{ type: tags.INVOICE_ITEM, id: orderItem?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddInvoiceItemMutation,
  useDeleteInvoiceItemMutation,
  useGetInvoiceItemQuery,
  useListInvoiceItemQuery,
  useUpdateInvoiceItemMutation,
  useGetErrorProneQuery,
} = invoiceItemApi

export const {
  endpoints: { getInvoiceItem },
} = invoiceItemApi
