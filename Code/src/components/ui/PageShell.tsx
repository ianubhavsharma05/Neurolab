import React from 'react';
import { cn } from '@/lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  contentClassName?: string;
  glowClassName?: string;
  secondaryGlowClassName?: string;
}

const CURVE_PATH =
  'M0,256L60,245.3C120,235,240,213,360,192C480,171,600,149,720,160C840,171,960,213,1080,218.7C1200,224,1320,192,1380,176L1440,160L1440,320L0,320Z';

const PageShell: React.FC<PageShellProps> = ({
  children,
  contentClassName,
  glowClassName = 'bg-primary/10',
  secondaryGlowClassName = 'bg-cyan-400/10',
}) => {
  return (
    <div className="dashboard-shell relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem]">
        <div className="dashboard-curve-panel absolute inset-x-[4%] top-8 h-[22rem] rounded-[3rem]" />
        <div className={cn('absolute -left-16 top-16 h-72 w-72 rounded-full blur-[130px]', glowClassName)} />
        <div className={cn('absolute right-[-4rem] top-10 h-80 w-[30rem] rounded-[999px] blur-[130px]', secondaryGlowClassName)} />
        <svg className="absolute bottom-0 left-0 h-28 w-full text-white/[0.07]" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d={CURVE_PATH} />
        </svg>
      </div>

      <div className={cn('container relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-10', contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default PageShell;
