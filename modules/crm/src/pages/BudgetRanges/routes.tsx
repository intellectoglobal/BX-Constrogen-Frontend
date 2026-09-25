import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';

const BudgetRangesRoutes = (
    <Route path="budgets" >
      <Route index element={<Main />} />
    </Route>
  )

export default BudgetRangesRoutes;
