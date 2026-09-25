import { lazy } from "react";
import { IModule } from "@igblsln/model"

const inventory : IModule = {
  name: "inventory",
  Component: lazy(async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return import('./main');
  })
};

export default inventory;