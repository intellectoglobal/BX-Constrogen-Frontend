import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/contract/contractors/'

export interface Contractor {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
  type?: any
  itemtype_keys?: any
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

export const contractorApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listContractor: build.query<ListResponse<Contractor>, any>({
      query: ({ page, size, type }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&type=${type}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: "CONTRACTORS", id })),
        { type: "CONTRACTORS", id: 'LIST' },
      ] : [{ type: "CONTRACTORS", id: 'LIST' }],
    }),
    addContractor: build.mutation<Contractor, Partial<Contractor>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "CONTRACTORS", id: 'LIST' }],
    }),
    getContractor: build.query<Contractor, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Contractor, _err, id) => [{ type: "CONTRACTORS", id }],
    }),
    updateContractor: build.mutation<Contractor, Partial<Contractor>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: "CONTRACTORS", id: project?.id }],
    }),
    deleteContractor: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: "CONTRACTORS", id: project?.id }],
    }),
    getStates: build.query<StatesResponse, void>({
      query: () => {
        return {
          url: urlUtils("/geo/state/"),
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
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddContractorMutation,
  useDeleteContractorMutation,
  useGetContractorQuery,
  useListContractorQuery,
  useUpdateContractorMutation,
  useGetErrorProneQuery,
  useGetStatesQuery,
  useGetCitiesQuery
} = contractorApi