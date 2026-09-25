import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';

const Routes = (
    <Route path="project-status" >
      <Route index element={<Main />} />
    </Route>
  )


export default Routes;