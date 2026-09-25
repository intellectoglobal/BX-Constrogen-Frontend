import { lazy } from "react";
import { IModule } from "@igblsln/model"
import { MODULE_NAME } from "./constants";

const template : IModule = {
  name: MODULE_NAME,
  Component: lazy(async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return import('./main');
  })
};

export default template;