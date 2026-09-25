import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';


const LocationsRoutes = (
    <Route path="locations" >
      <Route index element={<Main />} />
    </Route>
  )


export default LocationsRoutes;
