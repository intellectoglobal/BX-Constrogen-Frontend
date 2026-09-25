import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, SaveResponse, ModalBase } from '@igblsln/model';

const API_PATH = '/sale/sale_invoice/'

export const contractInvoiceApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    addSaleInvoice: build.mutation<SaveResponse<any>, Partial<any>>({
      query: (body) => ({
        url: '/sale/invoice/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "SALE_INVOICE", id: 'LIST' }],
    }),
    getSaleInvoice: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_SaleInvoice, _err, id) => [{ type: "SALE_INVOICE", id }],
    }),
    updateSaleInvoice: build.mutation<SaveResponse<any>, Partial<any>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `/sale/invoice/${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: [{ type: "SALE_INVOICE", id: 'LIST' }],
    }),
    deleteSaleInvoice: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `/sale/invoice/${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: "SALE_INVOICE", id: project?.id }],
    }),
    getSaleInvoiceForParams: build.query<any[], { projectId: any, agreementId: any }>({
      query: ({ projectId, agreementId }) => {
        return {
          url: `${API_PATH}all?project_id=${projectId}&agreement_id=${agreementId}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }) => ({ type: "SALE_INVOICE", key })),
        { type: "SALE_INVOICE", id: 'LIST' },
      ] : [{ type: "SALE_INVOICE", id: 'LIST' }],
    }),
    getSaleAgreementForParams: build.query<any[], { projectId: any, unitId: any }>({
      query: ({ projectId, unitId}) => {
        return {
          url: `${API_PATH}all?project_id=${projectId}&unit_id=${unitId}`,
        };
      },
    }),
    getPaymentSchedulesForSaleAgreement: build.query<any[], { agreementId: any }>({
      query: ({ agreementId }) => {
        return {
          url: `${API_PATH}all?agreement_id=${agreementId}`,
        };
      },
    }),
    getAllPaymentSchedulesForSaleAgreement: build.query<any[], { agreementId: any }>({
      query: ({ agreementId }) => {
        return {
          url: `${API_PATH}all?agreement_id=${agreementId}&all_schedules=1`,
        };
      },
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddSaleInvoiceMutation,
  useDeleteSaleInvoiceMutation,
  useUpdateSaleInvoiceMutation,
  useGetSaleAgreementForParamsQuery,
  useGetPaymentSchedulesForSaleAgreementQuery,
  useGetAllPaymentSchedulesForSaleAgreementQuery,
  useGetSaleInvoiceForParamsQuery,
  useGetErrorProneQuery,
} = contractInvoiceApi
