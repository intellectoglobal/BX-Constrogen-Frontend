import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';


const ExpenseVendorRoutes = (
    <Route path="expensevendor" >
      <Route index element={<Main />} />
    </Route>
  )


export default ExpenseVendorRoutes;