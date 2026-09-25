import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';

const PurposeRoutes = (
    <Route path="followups" >
      <Route index element={<Main />} />
    </Route>
  )


export default PurposeRoutes