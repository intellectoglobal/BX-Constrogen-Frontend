import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/vendor/vendor/'

export interface Vendor {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
  type?: any,
  itemtypes?: any
  inactive?: any
}

export interface State {
  state_key: any
  state_name: any
}

type StatesResponse = State[]

export interface City {
  city_key: any
  city_name: any
}

type CitiesResponse = City[]

export const vendorApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listVendor: build.query<ListResponse<Vendor>, any>({
      query: ({ page, size, type }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${type ? `&vendor=${type}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.VENDOR, id })),
        { type: tags.VENDOR, id: 'LIST' },
      ] : [{ type: tags.VENDOR, id: 'LIST' }],
    }),
    addVendor: build.mutation<Vendor, Partial<Vendor>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.VENDOR, id: 'LIST' }],
    }),
    getVendor: build.query<Vendor, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Vendor, _err, id) => [{ type: tags.VENDOR, id }],
    }),
    updateVendor: build.mutation<Vendor, Partial<Vendor>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.VENDOR, id: project?.id }],
    }),
    deleteVendor: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.VENDOR, id: project?.id }],
    }),
    getStates: build.query<StatesResponse, void>({
      query: () => {
        return {
          url: urlUtils("/geo/state/"),
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ state_key: id }) => ({ type: 'States', id } as const)),
        { type: 'States' as const, id: 'LIST' },
      ],
    }),
    getCities: build.query<CitiesResponse, any>({
      query: (state) => {
        return {
          url: `/geo/city/?state=${state}`,
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ city_key: id }) => ({ type: tags.CITIES, id } as const)),
        { type: tags.CITIES, id: 'LIST' },
      ],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddVendorMutation,
  useDeleteVendorMutation,
  useGetVendorQuery,
  useListVendorQuery,
  useUpdateVendorMutation,
  useGetErrorProneQuery,
  useGetStatesQuery,
  useGetCitiesQuery
} = vendorApi

export const {
  endpoints: { getVendor },
} = vendorApi
