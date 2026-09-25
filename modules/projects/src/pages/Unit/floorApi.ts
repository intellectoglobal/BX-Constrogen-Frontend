import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { FloorUnitQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/project/floor/'

export interface ProjectFloor {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
  projblk_key : any
  pricediff : any
}

export const projectFloorApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listProjectFloor: build.query<ListResponse<ProjectFloor>, FloorUnitQuery>({
      query: ({ page, size, projectId }) => {
        return {
           url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&project=${projectId || ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.PROJECT_FLOOR, id })),
        { type: tags.PROJECT_FLOOR, id: 'LIST' },
      ] : [{ type: tags.PROJECT_FLOOR, id: 'LIST' }],
    }),
    addProjectFloor: build.mutation<ProjectFloor, Partial<ProjectFloor>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PROJECT_FLOOR, id: 'LIST' }],
    }),
    getProjectFloor: build.query<ProjectFloor, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ProjectFloor, _err, id) => [{ type: tags.PROJECT_FLOOR, id }],
    }),
    updateProjectFloor: build.mutation<ProjectFloor, Partial<ProjectFloor>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.PROJECT_FLOOR, id: project?.id }],
    }),
    deleteProjectFloor: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.PROJECT_FLOOR, id: project?.id }],
    }),
    generateProjectFloors: build.mutation<
      { error: number; detail: string; created_floor_ids?: number[]; blocks?: number[] },
      { blocks: { key: number; floor_count: number }[]; overwrite?: boolean }
      >({
      query: ({ blocks, overwrite }) => ({
        url: `/project/floor/generate/${overwrite ? '?overwrite=1' : ''}`,
        method: 'POST',
        body: { blocks },
      }),
    }),

    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddProjectFloorMutation,
  useDeleteProjectFloorMutation,
  useGetProjectFloorQuery,
  useListProjectFloorQuery,
  useUpdateProjectFloorMutation,
  useGenerateProjectFloorsMutation,
  useGetErrorProneQuery,
} = projectFloorApi

export const {
  endpoints: { getProjectFloor },
} = projectFloorApi
