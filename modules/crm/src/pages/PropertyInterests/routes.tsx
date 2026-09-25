import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';


const PropertyInterestsRoutes = (
    <Route path="propertyinterests" >
      <Route index element={<Main />} />
    </Route>
  )


export default PropertyInterestsRoutes;
