export function PageHeader({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-lg font-medium text-zinc-800 sm:text-xl dark:text-zinc-100">
        {lede}
      </p>
      {children ? (
        <div className="mt-4 max-w-2xl space-y-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          {children}
        </div>
      ) : null}
    </div>
  );
}
