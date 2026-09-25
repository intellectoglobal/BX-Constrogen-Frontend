import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
    TypedStartListening,
    ListenerEffectAPI,
  } from '@reduxjs/toolkit'
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppStartListening = TypedStartListening<RootState, AppDispatch>
export type AppListenerEffectAPI = ListenerEffectAPI<RootState, AppDispatch>
