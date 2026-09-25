import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'

const API_PATH = '/leads/facings/'

export interface Facing {
  key: number
  descr: string;
}

export const facingsApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listFacings: build.query<Facing[], void>({
      query: () => ({
        url: API_PATH,
      }),
      providesTags: (result) => result ? [
        ...result.map(({ key }) => ({ type: tags.CRM_FACING, id: key })),
        { type: tags.CRM_FACING, id: 'LIST' },
      ] : [{ type: tags.CRM_FACING, id: 'LIST' }],
    }),
    addFacing: build.mutation<Facing, Partial<Facing>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.CRM_FACING, id: 'LIST' }],
    }),
    getFacing: build.query<Facing, number>({
      query: (key) => `${API_PATH}${key}`,
      providesTags: (_Facing, _err, key) => [{ type: tags.CRM_FACING, id: key }],
    }),
    updateFacing: build.mutation<Facing, Partial<Facing>>({
      query(data) {
        const { key, ...body } = data
        return {
          url: `${API_PATH}${key}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (facing) => [
        { type: tags.CRM_FACING, id: facing?.key },
        { type: tags.CRM_FACING, id: 'LIST' }
      ],
    }),
    deleteFacing: build.mutation<{ success: boolean; key: number }, number>({
      query(key) {
        return {
          url: `${API_PATH}${key}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (facing) => [
        { type: tags.CRM_FACING, id: facing?.key },
        { type: tags.CRM_FACING, id: 'LIST' }
      ],
    }),
  }),
})

export const {
  useAddFacingMutation,
  useDeleteFacingMutation,
  useGetFacingQuery,
  useListFacingsQuery,
  useUpdateFacingMutation,
} = facingsApi

export const {
  endpoints: { getFacing },
} = facingsApi
