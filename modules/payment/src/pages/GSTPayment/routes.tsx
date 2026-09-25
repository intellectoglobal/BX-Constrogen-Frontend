import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';

const Routes = (
    <Route path="gstpayment" >
      <Route index element={<Main />} />
    </Route>
  )


export default Routes