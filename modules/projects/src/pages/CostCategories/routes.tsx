import React from 'react'
import { Route } from "react-router-dom";
import CostCategory from './Main';
import Manage from './Manage';

const CostCategorieRoutes = (
    <Route path="costcategory" >
      <Route path="new" element={<Manage />} />
      <Route path=":id/edit" element={<Manage />} />
      <Route index element={<CostCategory />} />
    </Route>
  )


export default CostCategorieRoutes;