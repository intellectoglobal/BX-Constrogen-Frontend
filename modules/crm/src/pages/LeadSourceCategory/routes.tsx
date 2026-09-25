import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';


const LeadsourceCategoryRoutes = (
    <Route path="leadsourcecategory" >
      <Route index element={<Main />} />
    </Route>
  )


export default LeadsourceCategoryRoutes;
