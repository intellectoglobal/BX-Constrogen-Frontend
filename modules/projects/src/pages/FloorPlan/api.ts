import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { FloorUnitQuery, ListResponse, ModalBase } from '@igblsln/model';

const API_PATH = '/project/3d_floor/'

export interface ProjectFloor {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
  projblk_key : any
  pricediff : any
}

export const project3DImageApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listProject3DImage: build.query<ModalBase[], any>({
      query: ({ page, size, projectId, blockId }) => {
        return {
           url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&project=${projectId || ''}&block=${blockId || ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: "PROJECT_3D_IMAGE", id })),
        { type: "PROJECT_3D_IMAGE", id: 'LIST' },
      ] : [{ type: "PROJECT_3D_IMAGE", id: 'LIST' }],
    }),
    addProject3DImage: build.mutation<ProjectFloor, Partial<any>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: "PROJECT_3D_IMAGE", id: 'LIST' }],
    }),
    getProject3DImage: build.query<ProjectFloor, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ProjectFloor, _err, id) => [{ type: "PROJECT_3D_IMAGE", id }],
    }),
    updateProject3DImage: build.mutation<ProjectFloor, Partial<ProjectFloor>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: "PROJECT_3D_IMAGE", id: project?.id }],
    }),
    deleteProject3DImage: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: "PROJECT_3D_IMAGE", id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
    floorsForProjectBlock: build.query<ModalBase[], any>({
      query: ({ projectId, blockId }) => {
        return {
          url: urlUtils('/project/floor/', `?without_pagination=1&project=${projectId || ''}&project_block=${blockId || ''}`),
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
      // providesTags: (result) => result ? [
      //   ...result?.map(({ id }) => ({ type: "FloorsForProject", id })),
      //   { type: "FloorsForProject", id: 'LIST' },
      // ] : [{ type: "FloorsForProject", id: 'LIST' }],
    }),
  }),
})

export const {
  useAddProject3DImageMutation,
  useDeleteProject3DImageMutation,
  useGetProject3DImageQuery,
  useListProject3DImageQuery,
  useUpdateProject3DImageMutation,
  useGetErrorProneQuery,
  useFloorsForProjectBlockQuery
} = project3DImageApi