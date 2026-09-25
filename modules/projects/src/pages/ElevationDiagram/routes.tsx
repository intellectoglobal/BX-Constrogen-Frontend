import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';

const Routes = (
    <Route >
      <Route index path={"elevation-diagram"} element={<Main />} />
    </Route>
  )


export default Routes