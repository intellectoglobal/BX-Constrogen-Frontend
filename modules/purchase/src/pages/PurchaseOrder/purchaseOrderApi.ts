import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, SaveResponse } from '@igblsln/model';

const API_PATH = '/transaction/purchase/order/'

export interface DropDownData {
  key: any
  name?: any
  desc?: any
  id?: any
}


export const purchaseOrderApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPurchaseOrder: build.query<ListResponse<any>, any>({
      query: ({ page, size, project, vendor, from, to }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${project ? `&project=${project}` : ''}${from ? `&from_date=${from}` : ''}${to ? `&to_date=${to}` : ''}&status=O${vendor ? `&vendor=${vendor}` : ''}`),
        };
      },
      transformResponse(baseQueryReturnValue: ListResponse<any>, meta, arg) {
        baseQueryReturnValue['results'] = baseQueryReturnValue.results.map((d, index) => {
          return {
            ...d,
            sno: index + 1
          }
        })
        return baseQueryReturnValue
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.PURCHASE_ORDER, key })),
        { type: tags.PURCHASE_ORDER, id: 'LIST' },
      ] : [{ type: tags.PURCHASE_ORDER, id: 'LIST' }],
    }),
    addPurchaseOrder: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PURCHASE_ORDER, id: 'LIST' }],
    }),
    getPurchaseOrder: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_PurchaseOrder, _err, id) => [{ type: tags.PURCHASE_ORDER, id }],
    }),
    updatePurchaseOrder: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (order) => [{ type: tags.PURCHASE_ORDER, id: order?.key }],
    }),
    deletePurchaseOrder: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (order) => [{ type: tags.PURCHASE_ORDER, id: order?.id }],
    }),
    addVendorInvoice: build.mutation<SaveResponse<any>, Partial<any>>({
      query: (body) => ({
        url: '/transaction/vendor/invoice/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR_INVOICE, id: 'LIST' }],
    }),
    addContractInvoice: build.mutation<SaveResponse<any>, Partial<any>>({
      query: (body) => ({
        url: '/contract/invoice/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CONTRACT_INVOICE, id: 'LIST' }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddPurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useGetPurchaseOrderQuery,
  useListPurchaseOrderQuery,
  useUpdatePurchaseOrderMutation,
  useAddVendorInvoiceMutation,
  useAddContractInvoiceMutation,
  useGetErrorProneQuery,
} = purchaseOrderApi
