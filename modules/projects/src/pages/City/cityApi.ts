import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'

const API_PATH = '/geo/city/'

export interface City {
  id : any
  key: any
  name: any
}
type CitiesResponse = City[]

export interface State {
  key: any
  name: any
}

type StatesResponse = State[]

export const cityApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getCities: build.query<CitiesResponse, void>({
      query: () => {
        return {
          url: urlUtils(API_PATH),
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.CITIES, id } as const)),
        { type: tags.CITIES, id: 'LIST' },
      ],
    }),
    addCity: build.mutation<City, Partial<City>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CITIES, id: 'LIST' }],
    }),
    getCity: build.query<City, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_City, _err, id) => [{ type: tags.CITIES, id }],
    }),
    updateCity: build.mutation<City, Partial<City>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (city) => [{ type: tags.CITIES, id: city?.id }],
    }),
    deleteCity: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (city) => [{ type: tags.CITIES, id: city?.id }],
    }),
    getStates: build.query<StatesResponse, void>({
      query: () => {
        return {
          url: "/geo/state/",
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.STATES, id } as const)),
        { type: tags.STATES, id: 'LIST' },
      ],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddCityMutation,
  useDeleteCityMutation,
  useGetCityQuery,
  useGetCitiesQuery,
  useUpdateCityMutation,
  useGetErrorProneQuery,
  useGetStatesQuery
} = cityApi

export const {
  endpoints: { getCity },
} = cityApi
