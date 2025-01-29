import { ReactNode, useEffect, useState } from 'react';

import tw from 'twin.macro';

import { ErrorExclamationIcon } from '@/icons';
import ConnectingLine from '@/icons/connecting-line.svg';

import { Icon, IconName } from '@/components/Icon';
import { LoadingSpinner } from '@/components/Loading/LoadingSpinner';

import { DepositStep } from './utils';

type DepositStepsProps = {
  steps: DepositStep[];
  currentStep: number;
  currentStepError?: string;
  onRetry: () => void;
};

const STEP_TYPE_TO_INFO: { [type: string]: { title: string; icon: ReactNode } } = {
  network: {
    // TODO(deposit2.0): localization
    title: 'Switch networks',
    icon: <Icon size="1.5rem" iconName={IconName.Switch} />,
  },
  approve: {
    title: 'Approve USDC',
    icon: <Icon size="1.5rem" iconName={IconName.Usdc} />,
  },
  deposit: {
    title: 'Confirm deposit',
    icon: <Icon size="1.5rem" iconName={IconName.Deposit} />,
  },
};

const SHAKE_DURATION = 1000;

export const DepositSteps = ({
  steps,
  currentStep,
  currentStepError,
  onRetry,
}: DepositStepsProps) => {
  const [isShaking, setIsShaking] = useState(false);
  useEffect(() => {
    if (!currentStepError) {
      setIsShaking(false);
      return;
    }

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), SHAKE_DURATION);
  }, [currentStepError]);

  return (
    <div tw="flex flex-col">
      {steps.map((step, i) => {
        const stepInfo = STEP_TYPE_TO_INFO[step.type]!;
        const error = i === currentStep ? currentStepError : undefined;
        return (
          <div key={step.type} tw="flex flex-col">
            <div tw="flex items-center gap-0.125">
              <div tw="relative p-0.5">
                <LoadingSpinner
                  id={`deposit-step-${step.type}`}
                  size="100%"
                  strokeWidth="2"
                  stroke=""
                  tw="absolute left-0 top-0 flex h-full w-full items-center justify-center text-color-accent"
                  css={(i !== currentStep || currentStepError) && tw`invisible`}
                />
                <div
                  css={i === currentStep && tw`text-color-text-2`}
                  tw="relative flex items-center justify-center rounded-4 bg-color-layer-5 p-0.375"
                >
                  {stepInfo.icon}
                  {error && (
                    <ErrorExclamationIcon tw="absolute right-[-2px] top-[-2px] h-[12px] w-[12px] text-color-error" />
                  )}
                </div>
              </div>
              <div tw="flex flex-1 items-center justify-between gap-0.5">
                <div tw="flex flex-col gap-0.125">
                  <div
                    tw="transition-all duration-300"
                    css={[i === currentStep ? tw`opacity-100` : tw`opacity-50`]}
                  >
                    {stepInfo.title}
                  </div>
                  {error && <div tw="text-small text-color-error">{error}</div>}
                </div>
                {error && (
                  <button
                    css={isShaking && tw`animate-shake`}
                    tw="flex items-center gap-0.375 rounded-0.5 border border-solid border-color-accent p-0.375 text-color-accent hover:bg-color-layer-4"
                    type="button"
                    onClick={onRetry}
                  >
                    <Icon iconName={IconName.Refresh} />
                    {/* TODO(deposit2.0): localization */}
                    <div>Retry</div>
                  </button>
                )}
              </div>
            </div>
            {i !== steps.length - 1 && <ConnectingLine tw="ml-[25px] self-start" />}
          </div>
        );
      })}
    </div>
  );
};
