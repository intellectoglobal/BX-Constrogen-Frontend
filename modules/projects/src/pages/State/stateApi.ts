import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'

const API_PATH = '/geo/state/'

export interface State {
  id : any
  key: any
  name: any
}
type StatesResponse = State[]

export const stateApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getStates: build.query<StatesResponse, void>({
      query: () => {
        return {
          url: urlUtils(API_PATH),
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.STATES, id } as const)),
        { type: tags.STATES, id: 'LIST' },
      ],
    }),
    addState: build.mutation<State, Partial<State>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.STATES, id: 'LIST' }],
    }),
    getSate: build.query<State, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_State, _err, id) => [{ type: tags.STATES, id }],
    }),
    updateState: build.mutation<State, Partial<State>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (state) => [{ type: tags.STATES, id: state?.id }],
    }),
    deleteState: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (state) => [{ type: tags.STATES, id: state?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddStateMutation,
  useDeleteStateMutation,
  useGetStatesQuery,
  useUpdateStateMutation,
  useGetErrorProneQuery
} = stateApi