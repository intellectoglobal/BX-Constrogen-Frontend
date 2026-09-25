import { lazy } from "react";
import { IModule } from "@igblsln/model"
// import './index.scss'

const projects : IModule = {
  name: "projects",
  Component: lazy(async () => {
    // await new Promise(resolve => setTimeout(resolve, 10));
    return import('./main');
  })
};

export default projects;