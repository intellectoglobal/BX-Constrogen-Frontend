import { api } from '../service';
import { tags } from '../constants';

const API_PATH = '/geo/state/'

export interface State {
  state_key: any
  state_name: any
}

type StatesResponse = State[]

export const statesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getStates: build.query<StatesResponse, void>({
      query: () => {
        return {
          url: API_PATH,
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ state_key: id }) => ({ type: tags.STATES, id } as const)),
        { type: tags.STATES, id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetStatesQuery
} = statesApi
