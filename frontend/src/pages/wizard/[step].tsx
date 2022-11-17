import { useRouter } from "next/router";
import { WIZARD_MAPPING } from "../../components/wizard";

const VERSION = "3.3.0";

export default function Step() {
  const router = useRouter()
  const { step } = router.query;
  if (step) {
    const stepToLoad = parseInt(step as string) - 1;
    const versionToLoad = VERSION.substring(0, VERSION.lastIndexOf('.'));
    const WizardComponent = WIZARD_MAPPING[versionToLoad][stepToLoad];
    return <WizardComponent />
  }
  return null;
}
