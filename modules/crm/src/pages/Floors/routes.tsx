import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';


const FloorsRoutes = (
    <Route path="floors" >
      <Route index element={<Main />} />
    </Route>
  )


export default FloorsRoutes;
