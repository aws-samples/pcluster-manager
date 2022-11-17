import { FunctionComponent } from "react";
import { DCVSettings } from "./3.3/DCVSettings";
import { Review } from "./3.3/Review";
import { SlurmSettings } from "./3.3/SlurmSettings";

export const WIZARD_MAPPING: Record<string, FunctionComponent[]> = {
  "3.3" : [
    SlurmSettings,
    DCVSettings,
    Review,
  ]
}
