import { ThunkAction, Action } from '@reduxjs/toolkit';
import createStore from './createStore';

export const store = createStore({});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
