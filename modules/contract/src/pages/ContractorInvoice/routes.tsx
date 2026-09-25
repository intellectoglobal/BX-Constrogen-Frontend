import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';
import { PAGE_ROUTE } from './constants';

const Routes = (
    <Route path={PAGE_ROUTE}>
      <Route index element={<Main />} />
    </Route>
  )


export default Routes