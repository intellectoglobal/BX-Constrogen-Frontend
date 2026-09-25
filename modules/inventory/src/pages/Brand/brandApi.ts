import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/inventory/brand/'

export interface Brand {
  id: string
  key: number
  descr: string;
  name: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const BrandApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listBrand: build.query<ListResponse<Brand>, PagingQuery>({
      query: ({ page, size, type }) => {
        return {
          // url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&filter=${filter}`),
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${type ? `&type=${type}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.INVENTORY_MFGR, id })),
        { type: tags.INVENTORY_MFGR, id: 'LIST' },
      ] : [{ type: tags.INVENTORY_MFGR, id: 'LIST' }],
    }),
      // getBrands: build.query<Brand[], { type: string }>({
      //   query: ({ type }) => ({
      //     url: urlUtils(API_PATH, `?type=${type}&without_pagination=1`),
      //   }),
      //   transformResponse: (response: ListResponse<Brand>) => response.results, // ✅ Flatten to Brand[] directly
      //   providesTags: (result) =>
      //     result?.length
      //       ? [
      //           ...result.map(({ id }) => ({ type: tags.INVENTORY_MFGR, id })),
      //           { type: tags.INVENTORY_MFGR, id: 'LIST' },
      //         ]
      //       : [{ type: tags.INVENTORY_MFGR, id: 'LIST' }],
      // }),
    addBrand: build.mutation<Brand, Partial<Brand>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.INVENTORY_MFGR, id: 'LIST' }],
    }),
    getBrand: build.query<Brand, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Brand, _err, id) => [{ type: tags.INVENTORY_MFGR, id }],
    }),
    updateBrand: build.mutation<Brand, Partial<Brand>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.INVENTORY_MFGR, id: project?.id }],
    }),
    deleteBrand: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.INVENTORY_MFGR, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddBrandMutation,
  useDeleteBrandMutation,
  useGetBrandQuery,
  useListBrandQuery,
  useUpdateBrandMutation,
  useGetErrorProneQuery,
  // useGetBrandsQuery,
} = BrandApi

export const {
  endpoints: { getBrand },
} = BrandApi
