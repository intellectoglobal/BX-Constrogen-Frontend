import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';
import Manage from './Manage';
import Detail from './Detail'

const Routes = (
    <Route path="project" >
      <Route path="new" element={<Manage />} />
      <Route path="detail" element={<Detail/>} />
      <Route path=":id/edit" element={<Manage />} />
      <Route index element={<Main />} />
    </Route>
  )


export default Routes;