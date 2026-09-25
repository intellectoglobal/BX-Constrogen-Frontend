import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, SaveResponse } from '@igblsln/model';

const API_PATH = '/transaction/tds/challan/'

export interface TDSChallan {
  "key": any
  "docid": any
  "number": any
  "date": any
  "loctyp": any
  "delivnotes": any
  "docstatus": any
  "purtmpl_key": any
  "vend_key": any
  "proj_key": any
  "itemtyp_key": any
  "wh_key": any
  "purchs_odr_items": any
}


export interface DropDownData {
  key: any
  name?: any
  desc?: any
  id?: any
}


export const tdsChallanApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listTDSChallan: build.query<ListResponse<TDSChallan>, any>({
      query: ({ page, size, project, status }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${project ? `&project=${project}` : ''}${status ? `&status=${status}` : ''}`),
        };
      },
      transformResponse(baseQueryReturnValue: ListResponse<TDSChallan>, meta, arg) {
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
    addTDSChallan: build.mutation<TDSChallan, Partial<TDSChallan>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PURCHASE_ORDER, id: 'LIST' }],
    }),
    getTDSChallan: build.query<TDSChallan, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_TDSChallan, _err, id) => [{ type: tags.PURCHASE_ORDER, id }],
    }),
    updateTDSChallan: build.mutation<TDSChallan, Partial<TDSChallan>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (challan) => [{ type: tags.PURCHASE_ORDER, id: challan?.key }],
    }),
    deleteTDSChallan: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (challan) => [{ type: tags.PURCHASE_ORDER, id: challan?.id }],
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
  useAddTDSChallanMutation,
  useDeleteTDSChallanMutation,
  useGetTDSChallanQuery,
  useListTDSChallanQuery,
  useUpdateTDSChallanMutation,
  useAddVendorInvoiceMutation,
  useAddContractInvoiceMutation,
  useGetErrorProneQuery,
} = tdsChallanApi
