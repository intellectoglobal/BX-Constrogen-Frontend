import { lazy } from "react";
import { IModule } from "@igblsln/model"
import { MODULE_NAME } from "./constants";

const contract : IModule = {
  name: MODULE_NAME,
  Component: lazy(async () => {    
    return import('./main');
  })
};

export default contract;