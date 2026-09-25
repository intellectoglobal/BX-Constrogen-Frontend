import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';
import { PAGE_ROUTE } from './constants';
import ManageBlock from './ManageBlock/index';

const Routes = (
    <Route >
      <Route index path={PAGE_ROUTE} element={<Main />} />
      <Route path=":id/block/new" element={<ManageBlock />} />
      <Route path=":id/block/:blockId/edit" element={<ManageBlock />} />
    </Route>
  )


export default Routes