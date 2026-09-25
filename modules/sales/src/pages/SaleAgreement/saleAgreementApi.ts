import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { ListResponse, PagingQueryWithProject } from '@igblsln/model';

const API_PATH = '/sale/agreement/'


export interface DropDownData {
  key: any
  name?: any
  desc?: any
  id?: any
}


export const SaleAgreementApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listSaleAgreement: build.query<ListResponse<any>, PagingQueryWithProject>({
      query: ({ page, size, projectId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&project=${projectId || ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.SALE_AGREEMENT, key })),
        { type: tags.SALE_AGREEMENT, id: 'LIST' },
      ] : [{ type: tags.SALE_AGREEMENT, id: 'LIST' }],
    }),
    addSaleAgreement: build.mutation<any, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.SALE_AGREEMENT, id: 'LIST' }],
    }),
    getSaleAgreement: build.query<any, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_SaleAgreement, _err, id) => [{ type: tags.SALE_AGREEMENT, id }],
    }),
    getTransactionsForSaleAgreement: build.query<any, number>({
      query: (id) => `/sale/sale_receipt/?agreement_id=${id}&without_pagination=1`,
    }),
    updateSaleAgreement: build.mutation<any, Partial<any>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (order) => [{ type: tags.SALE_AGREEMENT, id: order?.key }],
    }),
    deleteSaleAgreement: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (order) => [{ type: tags.SALE_AGREEMENT, id: order?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddSaleAgreementMutation,
  useDeleteSaleAgreementMutation,
  useGetSaleAgreementQuery,
  useListSaleAgreementQuery,
  useUpdateSaleAgreementMutation,
  useGetTransactionsForSaleAgreementQuery,
  useGetErrorProneQuery,
} = SaleAgreementApi
