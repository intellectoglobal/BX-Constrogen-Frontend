import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/transaction/purchase/template/items/'

export interface PurchaseTemplateItem {
  key: number,
  createddttm: string;
  itemnotes: string;
  createdby: string;
  lastmodifiedby: string;
  lastmodifieddttm: string;
  purtmpl_key: number;
  item_key: number;
  itemuom_key: number;
}

export interface PurchaseTemplateItemPost {
  p_template_id: number,
  items: PurchaseTemplateItem[];
}

export const vendorApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPurchaseTemplateItem: build.query<ListResponse<PurchaseTemplateItem>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ item_key }) => ({ type: tags.PURCHASE_TEMPLATE_ITEM, item_key })),
        { type: tags.PURCHASE_TEMPLATE_ITEM, id: 'LIST' },
      ] : [{ type: tags.PURCHASE_TEMPLATE_ITEM, id: 'LIST' }],
    }),
    addPurchaseTemplateItems: build.mutation<PurchaseTemplateItemPost, Partial<PurchaseTemplateItemPost>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PURCHASE_TEMPLATE_ITEM, id: 'LIST' },{ type: tags.TRANSACTION, id: 'LIST' }],
    }),
    deletePurchaseTemplateItems: build.mutation<any, any>({
      query(data) {
        const key = data.key;
        const body = data.body;
        return {
          url: `${API_PATH}${key}`,
          method: 'DELETE',
          body
        }
      },
    }),
    getPurchaseTemplateItem: build.query<PurchaseTemplateItem, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_PurchaseTemplateItem, _err, id) => [{ type: tags.PURCHASE_TEMPLATE_ITEM, id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddPurchaseTemplateItemsMutation,
  useGetPurchaseTemplateItemQuery,
  useListPurchaseTemplateItemQuery,
  useDeletePurchaseTemplateItemsMutation,
  useGetErrorProneQuery
} = vendorApi

export const {
  endpoints: { getPurchaseTemplateItem },
} = vendorApi
