import React from 'react'
import { Route } from "react-router-dom";
import Manage from './Manage';
import Main from './Main';

const Routes = (
    <Route path="lintelbeam" >
      <Route path="new" element={<Manage />} />
      <Route path=":id/edit" element={<Manage />} />
      <Route index element={<Main />} />
    </Route>
  )


export default Routes