import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/sale/customer/'

export interface Customer {
  id: string
  key: number
  name: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
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

export const customerApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listCustomer: build.query<ListResponse<Customer>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.CUSTOMER, id })),
        { type: tags.CUSTOMER, id: 'LIST' },
      ] : [{ type: tags.CUSTOMER, id: 'LIST' }],
    }),
    addCustomer: build.mutation<Customer, Partial<Customer>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CUSTOMER, id: 'LIST' }],
    }),
    getCustomer: build.query<Customer, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Customer, _err, id) => [{ type: tags.CUSTOMER, id }],
    }),
    updateCustomer: build.mutation<Customer, Partial<Customer>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.CUSTOMER, id: project?.id }],
    }),
    getStates: build.query<StatesResponse, void>({
      query: () => {
        return {
          url: "/geo/state/",
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ state_key: id }) => ({ type: tags.STATES, id } as const)),
        { type: tags.STATES, id: 'LIST' },
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
    deleteCustomer: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.CUSTOMER, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerQuery,
  useListCustomerQuery,
  useUpdateCustomerMutation,
  useGetErrorProneQuery,
  useGetCitiesQuery,
  useGetStatesQuery
} = customerApi

export const {
  endpoints: { getCustomer },
} = customerApi
