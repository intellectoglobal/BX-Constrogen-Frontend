import { api, tags, urlUtils } from '@igblsln/store'

const API_PATH = '/leads/properties/'

export interface Property {
  id: string;
  descr: string;
  image_url: string | null;
  project: string;
  address: string;
  base_price: string;
  bedrooms: number;
  carpetarea: string | null;
  saleablearea: string | null;
  udsarea: string | null;
  facing: string | null;
  status?: string;
}

export type PropertiesResponse = Property[];


export const propertiesApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getProperties: build.query<Property[], void>({
      query: () => ({
        url: urlUtils(API_PATH),
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: tags.PROPERTY, id })), { type: tags.PROPERTY, id: 'LIST' }]
          : [{ type: tags.PROPERTY, id: 'LIST' }],
    }),
  }),
});

export const { useGetPropertiesQuery } = propertiesApi;
