import React, { createContext, useContext } from 'react';
import type { TooltipProps } from '@mantine/core';

type ToolTipConfig = Partial<Omit<TooltipProps, 'label'>>;

const defaultToolTipConfig: ToolTipConfig = {
  position: 'bottom',
  color: 'gray',
  withArrow: true,
};

const TooltipConfigContext = createContext<ToolTipConfig>(defaultToolTipConfig);

interface ToolTipConfigProviderProps {
  children: React.ReactNode;
  value?: Partial<ToolTipConfig>;
}

export const ToolTipConfigProvider: React.FC<ToolTipConfigProviderProps> = ({
  children,
  value,
}) => {
  const mergeValue: ToolTipConfig = { ...defaultToolTipConfig, ...value };
  return (
    <TooltipConfigContext.Provider value={mergeValue}>{children}</TooltipConfigContext.Provider>
  );
};

export const useToolTipConfig = () => useContext<ToolTipConfig>(TooltipConfigContext);
