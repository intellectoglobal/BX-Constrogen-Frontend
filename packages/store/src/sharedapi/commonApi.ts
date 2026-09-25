import { ListResponse, ModalBase } from '@igblsln/model';
import { api } from '../service';
import { tags } from '../constants';
import { urlUtils } from '../util';

export const commonApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getNextDocNo: build.query<any, string>({
      query: (docid) => {
        return {
          url: urlUtils(`/transaction/doc/id/next?docid=${docid}`),
        };
      },
    }),
    activeCustomers: build.query<any[], void>({
      query: () => {
        return {
          // url: `/sale/customer/all/active`,
          url: `/sale/customer/?without_pagination=1`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: tags.ACTIVE_CUSTOMERS, id })),
        { type: tags.ACTIVE_CUSTOMERS, id: 'LIST' },
      ] : [{ type: tags.ACTIVE_CUSTOMERS, id: 'LIST' }],
    }),
    activeBookings: build.query<ModalBase[], void>({
      query: () => {
        return {
          url: `/sales/bookings/all/active`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: tags.ACTIVE_BOOKINGS, id })),
        { type: tags.ACTIVE_BOOKINGS, id: 'LIST' },
      ] : [{ type: tags.ACTIVE_BOOKINGS, id: 'LIST' }],
    }),
    getModeOfPayments: build.query<ModalBase[], any>({
      query: () => {
        return {
          url: `/transaction/payment/mode/`,
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.MODE_OF_PAYMENT, id } as const)),
        { type: tags.MODE_OF_PAYMENT, id: 'LIST' },
      ],
    }),
    getProjectUnitStatus: build.query<ModalBase[], any>({
      query: () => {
        return {
          url: `/project/unit/status/`,
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.PROJECT_UNIT_STATUS, id } as const)),
        { type: tags.PROJECT_UNIT_STATUS, id: 'LIST' },
      ],
    }),
    getGRNNumbers: build.query<ModalBase[], any>({
      query: () => {
        return {
          url: `/transaction/goods/receipts/?only_grn_number=True`,
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.GRN_NUMBER, id } as const)),
        { type: tags.GRN_NUMBER, id: 'LIST' },
      ],
    }),
    getItemKitsForParams: build.query<ModalBase[], any>({
      query: ({itemType, purpose}) => {
        return {
          url: `/templates/item_kit?without_pagination=1${itemType ? `&item_type=${itemType}` : ''}${purpose ? `&purpose_key=${purpose}` : ''}`,
        };
      },
    }),
    getItemKitsDetail: build.query<any, number>({
      query: (id) => {
        return {
          url: `/templates/item_kit/${id}`,
        };
      },
    }),
    getActivePurchaseTemplates: build.query<ModalBase[], any>({
      query: () => {
        return {
          url: `/transaction/purchase/template/all/active`,
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: "ACTIVE_PURCHASE_TEMPLATE", id } as const)),
        { type: "ACTIVE_PURCHASE_TEMPLATE", id: 'LIST' },
      ],
    }),
    getActiveProjects: build.query<ModalBase[], any>({
      query: () => {
        return {
          url: `/project/project/all/active`,
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: "ACTIVE_PROJECT", id } as const)),
        { type: "ACTIVE_PROJECT", id: 'LIST' },
      ],
    }),
    getActivePurchaseTemplatesForItemType: build.query<ModalBase[], any>({
      query: (number) => {
        return {
          url: `/transaction/purchase/template/all/active?item_type=${number}`,
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.PURCHASE_TEMPLATE, id } as const)),
        { type: tags.PURCHASE_TEMPLATE, id: 'LIST' },
      ],
    }),
    downloadExportedData: build.query<any, any>({
      query: ({ name, filter }) => {
        return {
          url: `/exportdata?table=${name}&filter=${filter}`,
        };
      },
    }),
    getPurposesForItemTypes: build.query<any[], number>({
      query: (id) => {
        return {
          url: urlUtils(`/inventory/purpose/${id}?without_pagination=1`),
        };
      },
    }),
    getAllSaleAgreementPaymentTemplates: build.query<any[], void>({
      query: () => {
        return {
          url: urlUtils(`templates/customer_payment_schedule/?without_pagination=1`),
        };
      },
    }),
        getBrands: build.query<any[], any>({
          query: ({ type }) => {
            return {
              // url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&filter=${filter}`),
              url: urlUtils(`/inventory/brand/?item_type=${type}&without_pagination=1`),
            };
          },
        // providesTags: (result) => result ? [
        //   ...result?.map(({ id }) => ({ type: tags.PURCHASE_ORDER, id })),
        //   { type: tags.PURCHASE_ORDER, id: 'LIST' },
        // ] : [{ type: tags.PURCHASE_ORDER, id: 'LIST' }],
      }),
  }),
})

export const {
  useGetNextDocNoQuery,
  useActiveCustomersQuery,
  useActiveBookingsQuery,
  useGetModeOfPaymentsQuery,
  useGetProjectUnitStatusQuery,
  useGetGRNNumbersQuery,
  useGetActiveProjectsQuery,
  useGetActivePurchaseTemplatesQuery,
  useGetActivePurchaseTemplatesForItemTypeQuery,
  useDownloadExportedDataQuery,
  useGetItemKitsForParamsQuery,
  useGetItemKitsDetailQuery,
  useGetAllSaleAgreementPaymentTemplatesQuery,
  useGetBrandsQuery
  // useGetPurposesForItemTypesQuery
} = commonApi