import { WorkflowCreator } from "@/components/WorkflowCreator";

const AutomationPage = () => {
  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Automation</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Create smart automation rules to streamline your property management workflow
        </p>
      </div>
      <WorkflowCreator />
    </div>
  );
};

export default AutomationPage;