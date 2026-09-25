import React from 'react'
import { Route } from "react-router-dom";
import Manage from './Manage';
import Main from './Main';

const BrandRoutes = (
    <Route path="brand" >
      <Route path="new" element={<Manage />} />
      <Route path=":id/edit" element={<Manage />} />
      <Route index element={<Main />} />
    </Route>
  )


export default BrandRoutes