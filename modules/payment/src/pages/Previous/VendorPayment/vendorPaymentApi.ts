import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/transaction/payment/'

export interface VendorPayment {
  key: any
  docid: any
  number: any
  date: any
  loctyp: any
  delivnotes: any
  docstatus: any
  purtmpl_key: any
  vend_key: any
  proj_key: any
  wh_key: any
  chqdate: any
  paidamt: any
  refnumber: any
  allocatedamt: any
  modeofpay?:any
  vendor: any,
  invoice_list :any[]
  payment_allocations: VendorPaymentItem[]
}

export interface Vendor {
  id: string
  key: number
  descr: string;
  invoice_list?: any[]
  lastmodifiedby?: any
  lastmodifieddttm?: any
  type?: any
}

export interface VendorPaymentItem {
  invoicedate?: any
  invoiceno?: any
  invoicetotal?: any
  stilldue?: any
  amtallocated?: any
  apply?: any
  status?: any
  vendinv_key?: any
}

export interface VendorPaymentItemPost {
  pay_key: number,
  payment_allocations: VendorPaymentItem[];
}

export const vendorPaymentApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listVendorPayment: build.query<VendorPayment[], any>({
      query: ({ page, size, project, paymentfrom, paymentto }) => {
        return {
          url: urlUtils(API_PATH, `?vendor_type=vendor&page=${page || 1}&page_size=${size || PAGE_SIZE}&project=${project}&paymentfrom=${paymentfrom}&paymentto=${paymentto}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }) => ({ type: tags.VENDOR_PAYMENT, key })),
        { type: tags.VENDOR_PAYMENT, id: 'LIST' },
      ] : [{ type: tags.VENDOR_PAYMENT, id: 'LIST' }],
    }),
    addVendorPayment: build.mutation<VendorPayment, Partial<VendorPayment>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR_PAYMENT, id: 'LIST' }],
    }),
    getVendorPayment: build.query<VendorPayment, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_VendorPayment, _err, id) => [{ type: tags.VENDOR_PAYMENT, id }],
    }),
    updateVendorPayment: build.mutation<VendorPayment, Partial<VendorPayment>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (payment) => [{ type: tags.VENDOR_PAYMENT, id: payment?.key }],
    }),
    updatePaymentAllocation: build.mutation<any, Partial<VendorPaymentItemPost>>({
      query(data) {
        const { ...body } = data
        return {
          url: `${API_PATH}allocation/`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (payment) => [{ type: tags.VENDOR_PAYMENT, id: payment?.key }],
    }),
    deleteVendorPayment: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (payment) => [{ type: tags.VENDOR_PAYMENT, id: payment?.id }],
    }),
    getVendor: build.query<Vendor, number>({
      query: (id) => `/vendor/vendor/${id}`,
      providesTags: (_Vendor, _err, id) => [{ type: tags.VENDOR, id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddVendorPaymentMutation,
  useDeleteVendorPaymentMutation,
  useGetVendorPaymentQuery,
  useListVendorPaymentQuery,
  useUpdateVendorPaymentMutation,
  useUpdatePaymentAllocationMutation,
  useGetVendorQuery,
  useGetErrorProneQuery,
} = vendorPaymentApi