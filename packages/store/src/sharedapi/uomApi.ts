import { api } from '../service';
import { PAGE_SIZE, tags } from '../constants';
import { urlUtils } from '../util';
import { PagingQuery, ListResponse, ModalBase } from '@igblsln/model';

export interface UOMs {
  id: string
  key: number
  descr: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const uomApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getAllUOMs: build.query<UOMs[], any>({
      query: () => {
        return {
          url: urlUtils('/inventory/item_uom/', `?without_pagination=1`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: "ALL_UOMS", id })),
        { type: "ALL_UOMS", id: 'LIST' },
      ] : [{ type: "ALL_UOMS", id: 'LIST' }],
    }),
    getUOMsForItemType: build.query<any[], any>({
      query: (itemType) => {
        return {
          url: `/inventory/item_uom/?item_type=${itemType}&without_pagination=1`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: tags.UOM_FOR_ITEM_TYPE, id })),
        { type: tags.UOM_FOR_ITEM_TYPE, id: 'LIST' },
      ] : [{ type: tags.UOM_FOR_ITEM_TYPE, id: 'LIST' }],
    }),
    getUOMsForItem: build.query<any[], any>({
      query: (item) => {
        return {
          url: `/inventory/item_uom/?item=${item}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }: ModalBase) => ({ type: "UOM_FOR_ITEM", id })),
        { type: "UOM_FOR_ITEM", id: 'LIST' },
      ] : [{ type: "UOM_FOR_ITEM", id: 'LIST' }],
    }),
  }),
})

export const {
  useGetAllUOMsQuery,
  useGetUOMsForItemTypeQuery,
  useGetUOMsForItemQuery
} = uomApi

