import React from 'react'
import { Route } from "react-router-dom";
import Manage from './Manage';
import Main from './Main';
import { PAGE_ROUTE } from './constants';

const Routes = (
  <Route path={PAGE_ROUTE} >
    <Route path="new" element={<Manage />} />
    <Route path=":id/edit" element={<Manage />} />
    <Route index element={<Main />} />
  </Route>
)


export default Routes