import { api, PAGE_SIZE, urlUtils } from '@igblsln/store'
import { ListResponse } from '@igblsln/model';

const API_PATH = '/sale/customer_purchase_receipt/'

export const Api = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listCustomerPurchase: build.query<ListResponse<any>, any>({
      query: ({ page, size, project }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE} ${project ? `&project=${project}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: "CUSTOMER_PURCHASE_RECEIPT", id })),
        { type: "CUSTOMER_PURCHASE_RECEIPT", id: 'LIST' },
      ] : [{ type: "CUSTOMER_PURCHASE_RECEIPT", id: 'LIST' }],
    }),
    addCustomerPurchase: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "CUSTOMER_PURCHASE_RECEIPT", id: 'LIST' }],
    }),
    getCustomerPurchase: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_CustomerPurchase, _err, id) => [{ type: "CUSTOMER_PURCHASE_RECEIPT", id }],
    }),
    updateCustomerPurchase: build.mutation<any, Partial<any>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: "CUSTOMER_PURCHASE_RECEIPT", id: project?.id }],
    }),
    deleteCustomerPurchase: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: "CUSTOMER_PURCHASE_RECEIPT", id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddCustomerPurchaseMutation,
  useDeleteCustomerPurchaseMutation,
  useGetCustomerPurchaseQuery,
  useListCustomerPurchaseQuery,
  useUpdateCustomerPurchaseMutation,
  useGetErrorProneQuery,
} = Api