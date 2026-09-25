import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';


const LeadSourceRoutes = (
    <Route path="leadsource" >
      <Route index element={<Main />} />
    </Route>
  )


export default LeadSourceRoutes;
