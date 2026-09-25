import { Store } from '@reduxjs/toolkit';
import { IAppState } from '../app/IAppState';

export interface IStore extends Store<IAppState, any>{
    injectReducer: (key:string,value: any) => void
}
