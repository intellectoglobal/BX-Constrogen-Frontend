import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/project/project/'

export interface Project {
  addr1: any
  addr2: any
  briefdescr: any
  city_key: any
  createdby: any
  createddttm: any
  elevationimage: any
  id: string
  key: any
  lastmodifiedby: any
  lastmodifieddttm: any
  name: any
  possessionby: any
  projstatus_key: any
  projtyp_key: any
  sqftprice: any
  state_key: any
  totallandarea: any
  latest_proj_status?: any;
  latest_proj_price?: any;
  state: {
    key: any
    id: any
    name: any
  }
  city: {
    city_key: any
    city_name: any
  }
  status: {
    key: any
    descr: any
  }
  pro_type: {
    key: any
    id: any
    descr: any
  }
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

export interface ProjectStatus {
  key: any
  descr: any
  client_id?: any
  company?: any
  is_active?: any
}

type ProjectStatusesResponse = ProjectStatus[]

export const projectApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listProject: build.query<ListResponse<Project>, any>({
      query: ({ page, size, status }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&status=${status}`),
        };
      },
      transformResponse: (baseQueryReturnValue: any, meta, arg) => {
        let temp = baseQueryReturnValue?.results?.map((d: any, index: any) => {
          return {
            ...d,
            sno: index + 1
          }
        })

        return {
          ...baseQueryReturnValue,
          results : temp
        }
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.PROJECT, id })),
        { type: tags.PROJECT, id: 'LIST' },
      ] : [{ type: tags.PROJECT, id: 'LIST' }],
    }),
    addProject: build.mutation<Project, Partial<Project>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PROJECT, id: 'LIST' }],
    }),
    getProject: build.query<Project, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Project, _err, id) => [{ type: tags.PROJECT, id }],
    }),
    updateProject: build.mutation<Project, Partial<Project>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.PROJECT, id: project?.id }],
    }),
    deleteProject: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.PROJECT, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
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
          url: state ? `/geo/city/?state=${state}` : `/geo/city/`,
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ city_key: id }) => ({ type: tags.CITIES, id } as const)),
        { type: tags.CITIES, id: 'LIST' },
      ],
    }),
    getProjectStatuses: build.query<ProjectStatusesResponse, any>({
      query: () => {
        return {
          url: "/project/status/",
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.PROJECT_STATUS, id } as const)),
        { type: tags.PROJECT_STATUS, id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useAddProjectMutation,
  useDeleteProjectMutation,
  useGetProjectQuery,
  useListProjectQuery,
  useUpdateProjectMutation,
  useGetErrorProneQuery,
  useGetCitiesQuery,
  useGetStatesQuery,
  useGetProjectStatusesQuery
} = projectApi

export const {
  endpoints: { getProject },
} = projectApi
