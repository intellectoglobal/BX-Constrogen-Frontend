
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import FractionalMaterialRoutes from '../pages/FractionalMaterial';
import FractionalRodRoutes from '../pages/FractionalRod';
import WholeMaterialRoutes from '../pages/WholeMaterial';
import WholeRodRoutes from '../pages/WholeRod';
import BeamRoutes from '../pages/Beam';
import ColumnBodyRoutes from '../pages/ColumnBody';
import ColumnFootingRoutes from '../pages/ColumnFooting';
import CupboardRoutes from '../pages/Cupboard';
import GenericTankRoutes from '../pages/GenericTank';
import KitchenStageRoutes from '../pages/KitchenStage';
import LiftFootingRoutes from '../pages/LiftFooting';
import LintelBeamRoutes from '../pages/LintelBeam';
import PileRoutes from '../pages/Pile';
import SlabRoutes from '../pages/Slab';
import PileCapRoutes from '../pages/PileCap';
import StaircaseSlabRoutes from '../pages/StaircaseSlab';
import { PAGE_ROUTE } from '../pages/FractionalMaterial/constants';
import { useAuth } from '@igblsln/store';
import { ACCESS_NAME } from '../constants';

const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      {
        accessiblePages.includes(ACCESS_NAME) ?
      <Route path="/" element={<ModuleLayout panelMenu navItems={routes} />}>
        <Route index element={<Navigate to={PAGE_ROUTE} replace />} />
        {FractionalMaterialRoutes}
        {FractionalRodRoutes}
        {WholeMaterialRoutes}
        {WholeRodRoutes}
        {BeamRoutes}
        {ColumnBodyRoutes}
        {ColumnFootingRoutes}
        {CupboardRoutes}
        {GenericTankRoutes}
        {KitchenStageRoutes}
        {LiftFootingRoutes}
        {LintelBeamRoutes}
        {PileRoutes}
        {SlabRoutes}
        {PileCapRoutes}
        {StaircaseSlabRoutes}
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
