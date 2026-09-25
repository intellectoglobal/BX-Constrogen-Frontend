import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';

const Routes = (
    <Route path="allowancepayment" >
      <Route index element={<Main />} />
    </Route>
  )


export default Routes