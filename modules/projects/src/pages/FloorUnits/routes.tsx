import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';
import { ManageBlock, ManageFloor, ManageUnit } from './Manage';

const FloorUnitRoutes = (
  <Route path=":id/unit" >

    <Route path="new" element={<ManageUnit />} />
    <Route path=":unitId/edit" element={<ManageUnit />} />

    <Route path="block" element={<ManageBlock />} />
    <Route path="floor" element={<ManageFloor />} />

    <Route index element={<Main />} />
  </Route>
)


export default FloorUnitRoutes;