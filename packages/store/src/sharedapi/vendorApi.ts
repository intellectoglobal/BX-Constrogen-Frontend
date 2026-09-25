import { api } from '../service';
import { tags } from '../constants';
import { urlUtils } from '../util';
import { ListResponse, ModalBase } from '@igblsln/model';

const API_PATH = '/vendor/vendor/'

export interface Vendor extends ModalBase {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
  type?: any
}

export const vendorApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    activeVendors: build.query<ModalBase[], void>({
      query: () => {
        return {
          url: `${API_PATH}all/active`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: tags.ACTIVE_VENDOR, id })),
        { type: tags.ACTIVE_VENDOR, id: 'LIST' },
      ] : [{ type: tags.ACTIVE_VENDOR, id: 'LIST' }],
    }),
    allVendorsFiltered: build.query<ModalBase[], void>({
      query: () => {
        return {
          url: `${API_PATH}?filter=1`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: tags.ACTIVE_VENDOR, id })),
        { type: tags.ACTIVE_VENDOR, id: 'LIST' },
      ] : [{ type: tags.ACTIVE_VENDOR, id: 'LIST' }],
    }),
    activeContractors: build.query<ModalBase[], void>({
      query: () => {
        return {
          url: `/contract/contractors/?without_pagination=1`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: tags.ACTIVE_CONTRACTOR, id })),
        { type: tags.ACTIVE_CONTRACTOR, id: 'LIST' },
      ] : [{ type: tags.ACTIVE_CONTRACTOR, id: 'LIST' }],
    }),
    getAllVendorType: build.query<any[], void>({
      query: () => {
        return {
          url: `/vendor/type/?without_pagination=1`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: "ALL_VENDOR_TYPE", id })),
        { type: "ALL_VENDOR_TYPE", id: 'LIST' },
      ] : [{ type: "ALL_VENDOR_TYPE", id: 'LIST' }],
    }),
    getAllContractorType: build.query<any[], void>({
      query: () => {
        return {
          url: `/contract/type/?without_pagination=1`,
        };
      },
      // transformResponse:(baseQueryReturnValue:any[], meta, arg) => {
      //   baseQueryReturnValue = baseQueryReturnValue.filter(d =>{
      //     return d.contractor === "Y"
      //   })
      //   return baseQueryReturnValue
      // },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: "ALL_CONTARCTOR_TYPE", id })),
        { type: "ALL_CONTARCTOR_TYPE", id: 'LIST' },
      ] : [{ type: "ALL_CONTARCTOR_TYPE", id: 'LIST' }],
    }),
    invoiceForVendor: build.query<any[], number>({
      query: (vendorId) => {
        return {
          url: `/transaction/vendor/invoice/?vendor=${vendorId}&status=U|P|S`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: tags.INVOICE_FOR_VENDOR, id })),
        { type: tags.INVOICE_FOR_VENDOR, id: 'LIST' },
      ] : [{ type: tags.INVOICE_FOR_VENDOR, id: 'LIST' }],
    }),
    invoiceForContractor: build.query<any[], number>({
      query: (vendorId) => {
        return {
          url: `/transaction/vendor/invoice/?vendor=${vendorId}&status=U|P`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: tags.INVOICE_FOR_CONTRACTOR, id })),
        { type: tags.INVOICE_FOR_CONTRACTOR, id: 'LIST' },
      ] : [{ type: tags.INVOICE_FOR_CONTRACTOR, id: 'LIST' }],
    }),
  }),
})

export const {
  useActiveVendorsQuery,
  useActiveContractorsQuery,
  useGetAllVendorTypeQuery,
  useGetAllContractorTypeQuery,
  useInvoiceForVendorQuery,
  useAllVendorsFilteredQuery,
  useInvoiceForContractorQuery,
} = vendorApi
