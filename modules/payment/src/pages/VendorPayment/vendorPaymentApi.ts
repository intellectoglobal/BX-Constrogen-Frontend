import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/vendor/payment/'

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
  payment_allocations: any[]
}

interface VendorPaymentPaginated {
  count: number;
  next: string | null;
  previous: string | null;
  results: VendorPayment[];
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

interface VendorPaymentInvoice {
  key: number;
  project_name: string;
  invoiceno: string;
  invoicedate: string;
  invamt: string; // API returns string like "192422.48"
  pending_amount: number;
  vendor_details: {
    key: number;
    name: string;
    type: string | null;
  };
  allocated_amount: number | null;
  allocated_amount_details: any | null; // Replace 'any' with a specific type if details are known
  netamt: string; // API returns string like "227059.00"
}

// Define the paginated response interface
interface VendorInvoice {
  count: number;
  next: string | null;
  previous: string | null;
  results: VendorPaymentInvoice[];
}



export const vendorPaymentApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listVendorPayment: build.query<VendorPaymentPaginated, { page: number; size: number; year?: number; month?: number }>({
      query: ({ page, size, year, month }) => {
        let url = urlUtils(API_PATH, `all?page=${page}&page_size=${size || PAGE_SIZE}&pay_vendor=1`);
        if (year) url += `&year=${year}`;
        if (month) url += `&month=${month}`;
        return { url };
      },
      providesTags: (result) => result ? [
        ...result.results.map(({ key }) => ({ type: "VENDOR_PAYMENT", key })),
        { type: "VENDOR_PAYMENT", id: 'LIST' },
      ] : [{ type: "VENDOR_PAYMENT", id: 'LIST' }],
    }),
    listVendorPaymentInvoice: build.query<VendorInvoice, { page: number; size: number; year?: number; month?: number }>({
      query: ({ page, size, year, month }) => {
        let url = urlUtils(API_PATH, `all?page=${page}&page_size=${size || PAGE_SIZE}&pay_invoice=1`);
        if (year) url += `&year=${year}`;
        if (month) url += `&month=${month}`;
        return { url };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ key }) => ({ type: 'VENDOR_PAYMENT_INVOICE' as const, id: key })),
              { type: 'VENDOR_PAYMENT_INVOICE' as const, id: 'LIST' },
            ]
          : [{ type: 'VENDOR_PAYMENT_INVOICE' as const, id: 'LIST' }],
    }),
    listVendorPaymentVoucher: build.query<ListResponse<any>, any>({
      query: ({ page, size, year, month }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&year=${year}&month=${month}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: "VENDOR_PAYMENT_VOUCHER", key })),
        { type: "VENDOR_PAYMENT_VOUCHER", id: 'LIST' },
      ] : [{ type: "VENDOR_PAYMENT_VOUCHER", id: 'LIST' }],
    }),
    getInvoicesByVendor: build.query<any[], any>({
      query: ({ vendor }) => {
        return {
          url: urlUtils("/vendor/inv_alloc_amt/", `?vendor_id=${vendor}&without_pagination=1`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }) => ({ type: "GetInvoicesByVendor", key })),
        { type: "GetInvoicesByVendor", id: 'LIST' },
      ] : [{ type: "GetInvoicesByVendor", id: 'LIST' }],
    }),
    allocateInvoiceAmountForVendor: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `/vendor/inv_alloc_amt/${id}`,
          method: 'PUT',
          body,
        }
      },
    }),
    listBank: build.query<Array<any>, void>({
      query: () => {
        return {
          url: `/client/bank/?without_pagination=1`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }) => ({ type: "BANK", key })),
        { type: "BANK", id: 'LIST' },
      ] : [{ type: "BANK", id: 'LIST' }],
    }),
    addVendorPayment: build.mutation<VendorPayment, Partial<VendorPayment>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR_PAYMENT, id: 'LIST' }],
    }),
    getVendorPayment: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_VendorPayment, _err, id) => [{ type: "CONTRACTOR_PAYMENT", id }],
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
    updatePaymentAllocation: build.mutation<any, Partial<any>>({
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
  useListVendorPaymentInvoiceQuery,
  useAllocateInvoiceAmountForVendorMutation,
  useListVendorPaymentVoucherQuery,
  useUpdateVendorPaymentMutation,
  useUpdatePaymentAllocationMutation,
  useGetVendorQuery,
  useGetInvoicesByVendorQuery,
  useListBankQuery,
  useGetErrorProneQuery,
} = vendorPaymentApi