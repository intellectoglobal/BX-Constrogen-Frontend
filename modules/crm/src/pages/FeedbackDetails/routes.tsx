import React from 'react'
import { Route } from "react-router-dom";
import Main from './Main';
// Import API files to register them with RTK Query
import './api';

const FeedbackDetailsRoutes = (
    <Route path="feedbackdetails" >
      <Route index element={<Main />} />
    </Route>
  )


export default FeedbackDetailsRoutes