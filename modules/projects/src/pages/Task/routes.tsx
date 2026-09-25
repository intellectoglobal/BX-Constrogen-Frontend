import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';
import Manage from './Manage';

const Routes = (
    <Route path="task" >
      <Route path="new" element={<Manage />} />
      <Route path=":id/edit" element={<Manage />} />
      <Route index element={<Main />} />
    </Route>
  )


export default Routes;