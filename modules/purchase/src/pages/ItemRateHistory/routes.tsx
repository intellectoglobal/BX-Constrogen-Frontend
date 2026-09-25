import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';

const ItemRateCardRoutes = (
    <Route path="itemratecard" >
      <Route index element={<Main />} />
    </Route>
  )


export default ItemRateCardRoutes