import { useContext } from "react";
import { WizardContext } from "../common/WizardContext";

export const Review = () => {
  const [config] = useContext(WizardContext);
  return (
    <p>
      {JSON.stringify(config)}
    </p>
  );
}
