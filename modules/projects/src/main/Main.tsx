
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import ProjectRoutes from '../pages/Projects';
import CostCodeRoutes from '../pages/CostCodes';
import CostCategorieRoutes from '../pages/CostCategories';
import ProjectScheduleRoutes from '../pages/ProjectSchedule';
import ProjectTypeRoutes from '../pages/ProjectTypes';
import FloorUnitRoutes from '../pages/FloorPlan';
import PaymentTermRoutes from '../pages/PaymentTerms';
import PriceChangeRoutes from '../pages/PriceChanges';
import StatusChangeRoutes from '../pages/StatusChanges';
import ExpensesRoutes from '../pages/Expenses';
import ExpenseTypeRoutes from '../pages/ExpenseType';
import ProjectStatusRoutes from '../pages/ProjectStatus';
// import ProjectStockRoutes from '../pages/ProjectStock';
import ProjectStatusNewFlowRoutes from '../pages/PrjctStatus';
import AvailabilityRoutes from '../pages/Availability';
import StateRoutes from '../pages/State';
import CityRoutes from '../pages/City';
import TaskRoutes from '../pages/Task';
import UnitRoutes from '../pages/Unit';
import BlockRoutes from '../pages/ProjectBlock';
import FloorRoutes from '../pages/ProjectFloor';
import ImageRoutes from '../pages/ImageDetails';
import FloorPlanRoutes from '../pages/FloorUnits';
import WorkInfoRouter from "../pages/WorkInfo";
import ElevationDiagramRoutes from '../pages/ElevationDiagram';
import DailyProgressRoutes from '../pages/DailyProgress'
// import ProjectExpenseRoutes from '../pages/ProjectExpense';
import GetMaterialPurchaseRoutes from '@igblsln/materialpurchase';
import { ACCESS_NAME, MODULE_NAME } from '../constants';
import { useAuth } from '@igblsln/store';

const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      {
        accessiblePages.includes(ACCESS_NAME) ?
      <Route path="/" element={<ModuleLayout navItems={routes} />}>
        <Route index element={<Navigate to="project" replace />} />
        {ProjectRoutes}
        {CostCodeRoutes}
        {CostCategorieRoutes}
        {ProjectScheduleRoutes}
        {ProjectTypeRoutes}
        {FloorUnitRoutes}
        {PaymentTermRoutes}
        {StateRoutes}
        {CityRoutes}
        {PriceChangeRoutes}
        {StatusChangeRoutes}
        {ProjectStatusRoutes}
        {ProjectStatusNewFlowRoutes}
        {AvailabilityRoutes}
        {TaskRoutes}
        {UnitRoutes}
        {BlockRoutes}
        {FloorRoutes}
        {ImageRoutes}
        {FloorPlanRoutes}
        {ExpensesRoutes}
        {ExpenseTypeRoutes}
        {/* {ProjectExpenseRoutes}
        {ProjectStockRoutes} */}
        {ElevationDiagramRoutes}
        {WorkInfoRouter}
        {DailyProgressRoutes}
        {GetMaterialPurchaseRoutes(MODULE_NAME)}
        <Route path=":project/comming-soon" element={<ComingSoon />} />
        <Route path="*" element={<NoMatch relative />} />
        </Route>
          :
          <Route path="/" element={<ModuleLayout navItems={routes} />}>
            <Route path="*" element={<Restricted relative />} />
          </Route>
      }
    </Routes>

  );
}

export default Main;
