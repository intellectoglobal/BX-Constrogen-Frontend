import { lazy } from "react";
import { IModule } from "@igblsln/model"

const invoice : IModule = {
  name: "invoice",
  Component: lazy(async () => {
    // await new Promise(resolve => setTimeout(resolve, 10));
    return import('./main');
  })
};

export default invoice;