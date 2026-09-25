import { api } from '../service';
import { tags } from '../constants';
import { urlUtils } from '../util';
import { ListResponse } from '@igblsln/model';

export interface Items {
  id: string
  key: number
  descr: string;
  type: string;
  item_key? : any;
  model_number? : any;
  gst? : any;
  itemuom_key? : any;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const itemsApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getAllItem: build.query<Items[], any>({
      query: () => {
        return {
          url: urlUtils('/inventory/item/', `?without_pagination=1`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: tags.INVENTORY_ITEM, id })),
        { type: tags.INVENTORY_ITEM, id: 'LIST' },
      ] : [{ type: tags.INVENTORY_ITEM, id: 'LIST' }],
    }),
    getAllItemTypes: build.query<Items[], void>({
      query: () => {
        return {
          url: urlUtils('/inventory/item_type/', `?without_pagination=1`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: tags.INVENTORY_ITEM, id })),
        { type: tags.INVENTORY_ITEM, id: 'LIST' },
      ] : [{ type: tags.INVENTORY_ITEM, id: 'LIST' }],
    }),
    getItemTypesForVendor: build.query<Items[], number>({
      query: (vendorId) => {
        return {
          url: urlUtils(`/inventory/item_type/?vendor_key=${vendorId}&without_pagination=1`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: "ITEM_TYPES_FOR_VENDOR", id })),
        { type: "ITEM_TYPES_FOR_VENDOR", id: 'LIST' },
      ] : [{ type: "ITEM_TYPES_FOR_VENDOR", id: 'LIST' }],
    }),
    getItemsForItemType: build.query<any[], any>({
      query: (itemType) => {
        return {
          url: `/inventory/item/?item_types=${itemType}&without_pagination=1`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: tags.ITEMS_FOR_ITEM_TYPE, id })),
        { type: tags.ITEMS_FOR_ITEM_TYPE, id: 'LIST' },
      ] : [{ type: tags.ITEMS_FOR_ITEM_TYPE, id: 'LIST' }],
    }),
    getItemsForVendor: build.query<any[], any>({
      query: (vendor) => {
        return {
          url: `/inventory/item/?vendor=${vendor}&without_pagination=1`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: tags.ITEMS_FOR_ITEM_TYPE, id })),
        { type: tags.ITEMS_FOR_ITEM_TYPE, id: 'LIST' },
      ] : [{ type: tags.ITEMS_FOR_ITEM_TYPE, id: 'LIST' }],
    }),
    getItemSubTypeForItemType: build.query<any[], any>({
      query: (itemType) => {
        return {
          url: `/inventory/item_subtype/?item_type=${itemType}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: tags.ITEMS_FOR_ITEM_TYPE, id })),
        { type: tags.ITEMS_FOR_ITEM_TYPE, id: 'LIST' },
      ] : [{ type: tags.ITEMS_FOR_ITEM_TYPE, id: 'LIST' }],
    }),
  }),
})

export const {
  useGetAllItemQuery,
  useGetAllItemTypesQuery,
  useGetItemTypesForVendorQuery,
  useGetItemsForItemTypeQuery,
  useGetItemsForVendorQuery,
  useGetItemSubTypeForItemTypeQuery
} = itemsApi
