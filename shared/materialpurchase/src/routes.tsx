import React from 'react'
import { Route } from "react-router-dom";
import Manage from './Manage';
import Main from './Main';
import { PAGE_ROUTE } from './constants';
import { Modules } from './modules';

const GetRoutes = (moduleName: Modules) => (
    <Route path={PAGE_ROUTE} >
      <Route path="new" element={<Manage moduleName={moduleName} />} />
      <Route path=":id/edit" element={<Manage moduleName={moduleName} />} />
      <Route index element={<Main moduleName={moduleName} />} />
    </Route>
  )


export default GetRoutes