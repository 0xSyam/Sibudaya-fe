type FormPageHeaderProps = {
  title: string;
  description: string;
};

export function FormPageHeader({ title, description }: FormPageHeaderProps) {
  return (
    <header className="text-center">
      <h1 className="text-[32px] font-medium leading-[48px] text-[rgba(38,43,67,0.9)] lg:text-[48px] lg:leading-[56px]">
        {title}
      </h1>
      <p className="mt-2 text-[15px] leading-[22px] text-[rgba(38,43,67,0.7)]">{description}</p>
    </header>
  );
}
