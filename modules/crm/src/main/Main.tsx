
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import DashboardRoutes from '../pages/Dashboard';
import LeadRoutes from '../pages/Leads';
import ActiveFollowUpRoutes from '../pages/ActiveFollowUp/routes';
import JunkLeadsRoutes from '../pages/JunkLeads/routes';
import TotalLeadsRoutes from '../pages/TotalLeads/routes';
import LeadSourceRoutes from '../pages/LeadSource';
import LocationsRoutes from '../pages/Locations';
import FloorsRoutes from '../pages/Floors';
import FacingsRoutes from '../pages/Facings';
import PropertyInterestsRoutes from '../pages/PropertyInterests';
import FollowUpsRoutes from '../pages/FollowUps';
import FollowUpStagesRoutes from '../pages/FollowupStages';
import BudgetRangesRoutes from '../pages/BudgetRanges';
import OccupanciesRoutes from '../pages/Occupancies';
import OccupancySubtypesRoutes from '../pages/OccupancySubtypes';
import SiteVisitRoutes from '../pages/SiteVisits';
import PropertiesRoutes from '../pages/Properties';
import ProjectFollowUpRoutes from '../pages/ProjectFollowUp/routes';
import CustomerSiteVisitRoutes from '../pages/CustomerSiteVisit/routes';
import CallStatusRoutes from '../pages/CallStatus/routes';
import { PAGE_ROUTE } from '../pages/Dashboard/constants';
import { useAuth } from '@igblsln/store';
import LeadsourceCategoryRoutes from '../pages/LeadSourceCategory';
import FeedbackDetailsRoutes from '../pages/FeedbackDetails';
import TasksRoutes from '../pages/Tasks';


const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      {
        true ?
          // accessiblePages.includes(ACCESS_NAME) ?
          <Route path="/" element={<ModuleLayout navItems={routes} />}>
            <Route index element={<Navigate to={PAGE_ROUTE} replace />} />
            {DashboardRoutes}
            {LeadRoutes}
            {ActiveFollowUpRoutes}
            {JunkLeadsRoutes}
            {TotalLeadsRoutes}
            {LeadsourceCategoryRoutes}
            {FeedbackDetailsRoutes}
            {LeadSourceRoutes}
            {LocationsRoutes}
            {FloorsRoutes}
            {FacingsRoutes}
            {PropertyInterestsRoutes}
            {FollowUpsRoutes}
            {FollowUpStagesRoutes}
            {BudgetRangesRoutes}
            {OccupanciesRoutes}
            {OccupancySubtypesRoutes}
            {SiteVisitRoutes}
            {PropertiesRoutes}
            {ProjectFollowUpRoutes}
            {CustomerSiteVisitRoutes}
            {CallStatusRoutes}
            {TasksRoutes}
            <Route path=":page/comming-soon" element={<ComingSoon />} />
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
