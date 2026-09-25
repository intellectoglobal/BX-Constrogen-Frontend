import { api } from '../service';
import { tags } from '../constants';

const API_PATH = '/geo/city/'

export interface City {
  city_key: any
  city_name: any
}

type CitiesResponse = City[]

export const citiesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getCities: build.query<CitiesResponse, any>({
      query: (state) => {
        return {
          url: state ? `${API_PATH}?state=${state}` : API_PATH,
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ city_key: id }) => ({ type: tags.CITIES, id } as const)),
        { type: tags.CITIES, id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetCitiesQuery
} = citiesApi
