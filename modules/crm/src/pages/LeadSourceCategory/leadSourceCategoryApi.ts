import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'

const API_PATH = '/leads/leadsourcecategory/'

export interface LeadsourceCategory {
  key: any
  descr: any
}
type LeadsourceCategoriesResponse = LeadsourceCategory[]

export const leadsourceCategoryApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getLeadsourceCategories: build.query<LeadsourceCategoriesResponse, void>({
      query: () => {
        return {
          url: urlUtils(API_PATH),
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.LEADSOURCECATEGORIES, id } as const)),
        { type: tags.LEADSOURCECATEGORIES, id: 'LIST' },
      ],
    }),
    addLeadsourceCategory: build.mutation<LeadsourceCategory, Partial<LeadsourceCategory>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.LEADSOURCECATEGORIES, id: 'LIST' }],
    }),
    getLeadsourceCategory: build.query<LeadsourceCategory, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_LeadsourceCategory, _err, id) => [{ type: tags.LEADSOURCECATEGORIES, id }],
    }),
    updateLeadsourceCategory: build.mutation<LeadsourceCategory, Partial<LeadsourceCategory>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (leadsourceCategory) => [
        { type: tags.LEADSOURCECATEGORIES, id: leadsourceCategory?.key },
        { type: tags.LEADSOURCECATEGORIES, id: 'LIST' }
      ],
    }),
    deleteLeadsourceCategory: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (leadsourceCategory) => [
        { type: tags.LEADSOURCECATEGORIES, id: leadsourceCategory?.id },
        { type: tags.LEADSOURCECATEGORIES, id: 'LIST' }
      ],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddLeadsourceCategoryMutation,
  useDeleteLeadsourceCategoryMutation,
  useGetLeadsourceCategoriesQuery,
  useUpdateLeadsourceCategoryMutation,
  useGetErrorProneQuery
} = leadsourceCategoryApi
