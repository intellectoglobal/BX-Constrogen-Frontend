import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';


const CityRoutes = (
    <Route path="city" >
      <Route index element={<Main />} />
    </Route>
  )


export default CityRoutes;