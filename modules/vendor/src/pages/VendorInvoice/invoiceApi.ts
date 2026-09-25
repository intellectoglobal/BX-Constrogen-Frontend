import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/transaction/vendor/invoice/'

export interface Invoice {
  "key" : any
  "docid": any
  "vouchno": any
  "invoicedate": any
  "loctyp": any
  "delivnotes": any
  "docstatus": any
  "purtmpl_key": any
  "vend_key": any
  "proj_key": any
  "wh_key": any
  "apterm_days": any
  "invoice_items" : any
  "itemtype_key" :any
}

export const invoiceApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listInvoice: build.query<ListResponse<Invoice>, any>({
      query: ({ page, size, project, vendor }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${project ? `&project=${project}` : ''}${vendor ? `&vendor=${vendor}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.VENDOR_INVOICE, key })),
        { type: tags.VENDOR_INVOICE, id: 'LIST' },
      ] : [{ type: tags.VENDOR_INVOICE, id: 'LIST' }],
    }),
    addInvoice: build.mutation<Invoice, Partial<Invoice>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR_INVOICE, id: 'LIST' }],
    }),
    getInvoice: build.query<Invoice, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Invoice, _err, id) => [{ type: tags.VENDOR_INVOICE, id }],
    }),
    updateInvoice: build.mutation<Invoice, Partial<Invoice>>({
      query(data) {
        const body = data
        console.log(body)
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (order) => [{ type: tags.VENDOR_INVOICE, id: order?.key }],
    }),
    deleteInvoice: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (order) => [{ type: tags.VENDOR_INVOICE, id: order?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetInvoiceQuery,
  useListInvoiceQuery,
  useUpdateInvoiceMutation,
  useGetErrorProneQuery
} = invoiceApi

export const {
  endpoints: { getInvoice },
} = invoiceApi
