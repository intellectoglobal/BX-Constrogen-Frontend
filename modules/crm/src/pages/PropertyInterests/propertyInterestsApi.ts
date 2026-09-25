import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'

const API_PATH = '/leads/propertyinterests/'

export interface PropertyInterest {
  key: number
  descr: string;
}

export const propertyInterestsApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPropertyInterests: build.query<PropertyInterest[], void>({
      query: () => ({
        url: API_PATH,
      }),
      providesTags: (result) => result ? [
        ...result.map(({ key }) => ({ type: tags.CRM_PROPERTY_INTEREST, id: key })),
        { type: tags.CRM_PROPERTY_INTEREST, id: 'LIST' },
      ] : [{ type: tags.CRM_PROPERTY_INTEREST, id: 'LIST' }],
    }),
    addPropertyInterest: build.mutation<PropertyInterest, Partial<PropertyInterest>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CRM_PROPERTY_INTEREST, id: 'LIST' }],
    }),
    getPropertyInterest: build.query<PropertyInterest, number>({
      query: (key) => `${API_PATH}${key}`,
      providesTags: (_PropertyInterest, _err, key) => [{ type: tags.CRM_PROPERTY_INTEREST, id: key }],
    }),
    updatePropertyInterest: build.mutation<PropertyInterest, Partial<PropertyInterest>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (propertyInterest) => [
        { type: tags.CRM_PROPERTY_INTEREST, id: propertyInterest?.key },
        { type: tags.CRM_PROPERTY_INTEREST, id: 'LIST' }
      ],
    }),
    deletePropertyInterest: build.mutation<{ success: boolean; key: number }, number>({
      query(key) {
        return {
          url: `${API_PATH}${key}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (propertyInterest) => [
        { type: tags.CRM_PROPERTY_INTEREST, id: propertyInterest?.key },
        { type: tags.CRM_PROPERTY_INTEREST, id: 'LIST' }
      ],
    }),
  }),
})

export const {
  useAddPropertyInterestMutation,
  useDeletePropertyInterestMutation,
  useGetPropertyInterestQuery,
  useListPropertyInterestsQuery,
  useUpdatePropertyInterestMutation,
} = propertyInterestsApi

export const {
  endpoints: { getPropertyInterest },
} = propertyInterestsApi
