import { AutomationRules } from "@/components/automation-rules";
import { automationRules } from "@/lib/automation-rules";

export default function AutomationRulesPage() {
  return <AutomationRules rules={automationRules} />;
}
