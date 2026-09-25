import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/transaction/vendor/invoice/'

interface VendorInvoiceListResponse<T> extends ListResponse<T> {
  total_netamt: number;
}


export const invoiceApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listInvoice: build.query<VendorInvoiceListResponse<any>, any>({
      query: ({ page, size, project, vendor, from, to, status, item_type }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${project ? `&project=${project}` : ''}${from ? `&from_date=${from}` : ''}${to ? `&to_date=${to}` : ''}${vendor ? `&vendor=${vendor}` : ''}
            ${status ? `&status=${status}` : ''}${item_type ? `&item_type=${item_type}` : ''}`
           ),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.VENDOR_INVOICE, key })),
        { type: tags.VENDOR_INVOICE, id: 'LIST' },
      ] : [{ type: tags.VENDOR_INVOICE, id: 'LIST' }],
    }),
    addInvoice: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR_INVOICE, id: 'LIST' }],
    }),
    getInvoice: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Invoice, _err, id) => [{ type: tags.VENDOR_INVOICE, id }],
    }),
    updateInvoice: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
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
