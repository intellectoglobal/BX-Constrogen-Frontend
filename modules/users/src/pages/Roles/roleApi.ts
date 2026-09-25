import { userapi, tags, urlUtils } from '@igblsln/store'

const API_PATH = '/role/'

export interface Role {
  id : any
  key: any
  name: any
}


export const roleApi = userapi.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getRoles: build.query<Role[], void>({
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
    addRole: build.mutation<Role, Partial<Role>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CITIES, id: 'LIST' }],
    }),
    getRole: build.query<Role, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Role, _err, id) => [{ type: tags.CITIES, id }],
    }),
    updateRole: build.mutation<Role, Partial<Role>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (role) => [{ type: tags.CITIES, id: role?.id }],
    }),
    deleteRole: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (role) => [{ type: tags.CITIES, id: role?.id }],
    }),
    getPermissions: build.query<Role[], void>({
      query: () => {
        return {
          url: urlUtils('/permission/'),
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.CITIES, id } as const)),
        { type: tags.CITIES, id: 'LIST' },
      ],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddRoleMutation,
  useDeleteRoleMutation,
  useGetRoleQuery,
  useGetRolesQuery,
  useUpdateRoleMutation,
  useGetErrorProneQuery,
  useGetPermissionsQuery
} = roleApi
