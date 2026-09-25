import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/transaction/purchase/template/'

export interface PurchaseTemplate {
  "key": any
  "docid": any
  "number": any
  "name": any
  "inactive": any
  "createdby": any
  "itemtyp_key":any
  "lastmodifiedby": any
  "lastmodifieddttm": any
  "purchs_template_items" :any
}

export const purchaseTemplateApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPurchaseTemplate: build.query<ListResponse<PurchaseTemplate>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.PURCHASE_TEMPLATE, key })),
        { type: tags.PURCHASE_TEMPLATE, id: 'LIST' },
      ] : [{ type: tags.PURCHASE_TEMPLATE, id: 'LIST' }],
    }),
    addPurchaseTemplate: build.mutation<PurchaseTemplate, Partial<PurchaseTemplate>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PURCHASE_TEMPLATE, id: 'LIST' }],
    }),
    getPurchaseTemplate: build.query<PurchaseTemplate, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_PurchaseTemplate, _err, id) => [{ type: tags.PURCHASE_TEMPLATE, id }],
    }),
    updatePurchaseTemplate: build.mutation<PurchaseTemplate, Partial<PurchaseTemplate>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (template) => [{ type: tags.PURCHASE_TEMPLATE, id: template?.key }],
    }),
    deletePurchaseTemplate: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (template) => [{ type: tags.PURCHASE_TEMPLATE, id: template?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddPurchaseTemplateMutation,
  useDeletePurchaseTemplateMutation,
  useGetPurchaseTemplateQuery,
  useListPurchaseTemplateQuery,
  useUpdatePurchaseTemplateMutation,
  useGetErrorProneQuery
} = purchaseTemplateApi

export const {
  endpoints: { getPurchaseTemplate },
} = purchaseTemplateApi
