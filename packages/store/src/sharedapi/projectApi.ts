import { api } from '../service';
import { PAGE_SIZE, tags } from '../constants';
import { urlUtils } from '../util';
import { PagingQuery, ListResponse, ListAllResponse, ModalBase, FloorUnitQuery } from '@igblsln/model';

const API_PATH = '/project/project/'

export interface Project extends ModalBase {
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
  no_of_units: any
  state: {
    key: any
    id: any
    name: any
  }
  city: {
    key: any
    name: any
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
  latest_proj_status: {
    key: any
    descr: any
  }
  latest_proj_price: {
    effprice: any
  }
}


export const projectApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    activeProject: build.query<ModalBase[], void>({
      query: () => {
        return {
          url: `${API_PATH}all/active`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: tags.PROJECT, id })),
        { type: tags.PROJECT, id: 'LIST' },
      ] : [{ type: tags.PROJECT, id: 'LIST' }],
    }),
    getProject: build.query<Project, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Project, _err, id) => [{ type: tags.PROJECT, id }],
    }),
    listProjectsWithNoTasks: build.query<ModalBase[], any>({
      query: () => {
        return {
          url: urlUtils('/project/non/task/projects'),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: tags.PROJECTS, id })),
        { type: tags.PROJECTS, id: 'PARTIAL-LIST' },
      ] : [{ type: tags.PROJECTS, id: 'PARTIAL-LIST' }],
    }),
    stagesForProject: build.query<any[], { id: number | null }>({
      query: ({ id }) => {
        return {
          url: `/project/stage/?project=${id}&without_pagination=1`,
        };
      },
      providesTags: (result) => result ? [
        ...result.map(({ key }: any) => ({ type: tags.STAGES_FOR_PROJECT, key })),
        { type: tags.STAGES_FOR_PROJECT, id: 'LIST' },
      ] : [{ type: tags.STAGES_FOR_PROJECT, id: 'LIST' }],
    }),
    availableUnitsForProject: build.query<any[], { id: number | null }>({
      query: ({ id }) => {
        return {
          url: `/project/unit/?project=${id}&without_pagination=1`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }: any) => ({ type: tags.UNITS_FOR_PROJECT, key })),
        { type: tags.UNITS_FOR_PROJECT, id: 'LIST' },
      ] : [{ type: tags.UNITS_FOR_PROJECT, id: 'LIST' }],
    }),
    blocksForProject: build.query<ModalBase[], FloorUnitQuery>({
      query: ({ projectId }) => {
        return {
          url: urlUtils('/project/block/', `?without_pagination=1&project=${projectId || ''}`),
        };
      },
      transformResponse: (baseQueryReturnValue: any, meta, arg) => {
        baseQueryReturnValue = baseQueryReturnValue.map((d: any, index: any) => {
          return {
            ...d,
            proj_key: arg.projectId,
            sno: index + 1
          }
        })
        return baseQueryReturnValue
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: "BlocksForProject", id })),
        { type: "BlocksForProject", id: 'LIST' },
      ] : [{ type: "BlocksForProject", id: 'LIST' }],
    }),
    floorsForProject: build.query<ModalBase[], FloorUnitQuery>({
      query: ({ projectId }) => {
        return {
          url: urlUtils('/project/floor/', `?without_pagination=1&project=${projectId || ''}`),
        };
      },
      transformResponse: (baseQueryReturnValue: any, meta, arg) => {
        baseQueryReturnValue = baseQueryReturnValue?.map((d: any, index: any) => {
          return {
            ...d,
            proj_key: arg.projectId,
            sno: index + 1
          }
        })
        return baseQueryReturnValue
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: "FloorsForProject", id })),
        { type: "FloorsForProject", id: 'LIST' },
      ] : [{ type: "FloorsForProject", id: 'LIST' }],
    }),
    unitsForProject: build.query<ModalBase[], FloorUnitQuery>({
      query: ({ projectId }) => {
        return {
          url: urlUtils('/project/unit/', `?without_pagination=1&project=${projectId || ''}`),
        };
      },
      transformResponse: (baseQueryReturnValue: any, meta, arg) => {
        baseQueryReturnValue = baseQueryReturnValue.map((d: any, index: any) => {
          return {
            ...d,
            proj_key: arg.projectId,
            sno: index + 1
          }
        })
        return baseQueryReturnValue
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: "UnitsForProject", id })),
        { type: "UnitsForProject", id: 'LIST' },
      ] : [{ type: "UnitsForProject", id: 'LIST' }],
    }),
    unitsForFloor: build.query<any[],  { floorId: number | null }>({
      query: ({ floorId }) => {
        return {
          url: urlUtils('/project/unit/', `?without_pagination=1&project_floor=${floorId || ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: "UnitsForFloor", id })),
        { type: "UnitsForFloor", id: 'LIST' },
      ] : [{ type: "UnitsForFloor", id: 'LIST' }],
    }),
    getAllProjectTypes: build.query<Project[], void>({
      query: () => {
        return {
          url: urlUtils('/project/type/', `?without_pagination=1`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: "ProjectTypes", id })),
        { type: "ProjectTypes", id: 'LIST' },
      ] : [{ type: "ProjectTypes", id: 'LIST' }],
    }),
  }),
})

export const {
  useGetProjectQuery,
  useActiveProjectQuery,
  useGetAllProjectTypesQuery,
  useListProjectsWithNoTasksQuery,
  useStagesForProjectQuery,
  useAvailableUnitsForProjectQuery,
  useBlocksForProjectQuery,
  useFloorsForProjectQuery,
  useUnitsForProjectQuery,
  useUnitsForFloorQuery
} = projectApi
