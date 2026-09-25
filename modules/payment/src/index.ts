import { lazy } from "react";
import { IModule } from "@igblsln/model"

const payment: IModule = {
  name: "payment",
  Component: lazy(async () => {
    return import('./main');
  })
};

export default payment;