export type StepState = "completed" | "current" | "upcoming";

export type FormStep = {
  number: string;
  title: string;
  subtitle: string;
  state: StepState;
};

function StepItem({ number, title, subtitle, state }: FormStep) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={
          state === "completed"
            ? "flex size-5 items-center justify-center rounded-full bg-[#c23513] text-white"
            : state === "current"
              ? "flex size-5 items-center justify-center rounded-full border-2 border-[#c23513]"
              : "size-5 rounded-full border-2 border-[rgba(194,53,19,0.3)]"
        }
      >
        {state === "completed" ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : state === "current" ? (
          <span className="size-2 rounded-full bg-[#c23513]" />
        ) : null}
      </div>
      <p
        className={
          state === "upcoming"
            ? "text-[24px] font-medium leading-[38px] text-[rgba(38,43,67,0.4)]"
            : "text-[24px] font-medium leading-[38px] text-[rgba(38,43,67,0.9)]"
        }
      >
        {number}
      </p>
      <div>
        <p className="text-[15px] font-medium leading-[22px] text-[rgba(38,43,67,0.9)]">{title}</p>
        <p
          className={
            state === "upcoming"
              ? "text-[13px] leading-5 text-[rgba(38,43,67,0.4)]"
              : "text-[13px] leading-5 text-[rgba(38,43,67,0.7)]"
          }
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function StepConnector({ active }: { active: boolean }) {
  return (
    <div
      className={
        active
          ? "h-[3px] min-w-10 flex-1 rounded-[40px] bg-[#c23513]"
          : "h-[3px] min-w-10 flex-1 rounded-[40px] bg-[rgba(194,53,19,0.16)]"
      }
    />
  );
}

type FormStepperProps = {
  steps: FormStep[];
};

export function FormStepper({ steps }: FormStepperProps) {
  return (
    <div className="mt-10 flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step.number} className="contents">
          <StepItem {...step} />
          {index < steps.length - 1 ? <StepConnector active={step.state === "completed"} /> : null}
        </div>
      ))}
    </div>
  );
}
