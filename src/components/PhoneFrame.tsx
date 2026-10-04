import React from 'react';
import { Wifi, Battery } from 'lucide-react';

import { AccessibilitySettings } from './AccessibilitySettingsView';

interface PhoneFrameProps {
  children: React.ReactNode;
  currentTime?: string;
  isFramed?: boolean;
  accessibility?: AccessibilitySettings;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  currentTime = '11:30',
  isFramed = true,
  accessibility,
}) => {
  const fontClass =
    accessibility?.fontSize === 'Mała'
      ? 'app-font-small'
      : accessibility?.fontSize === 'Duża'
      ? 'app-font-large'
      : accessibility?.fontSize === 'Bardzo duża'
      ? 'app-font-xlarge'
      : 'app-font-standard';

  const contrastClass = accessibility?.highContrast ? 'app-high-contrast' : '';
  const motionClass = accessibility?.reduceMotion ? 'app-reduce-motion' : '';

  return (
    <div
      className={`relative mx-auto flex flex-col bg-white overflow-hidden text-neutral-900 ${fontClass} ${contrastClass} ${motionClass} ${
        isFramed
          ? 'w-[390px] h-[844px] max-h-[92vh] rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_0_12px_#1e2022,0_0_0_14px_#37393b] border-4 border-black'
          : 'w-full h-full min-h-screen'
      }`}
      style={{
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* iOS Top Status Bar */}
      <div className="relative z-40 w-full shrink-0 pt-3 px-7 flex items-center justify-between bg-white text-black select-none pointer-events-none">
        {/* Left: Time */}
        <span className="text-[15px] font-semibold tracking-tight w-12 text-center pointer-events-auto">
          {currentTime}
        </span>

        {/* Center: Dynamic Island */}
        <div className="w-[114px] h-[30px] bg-black rounded-full flex items-center justify-end pr-2.5 space-x-1.5 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
          <div className="w-2 h-2 rounded-full bg-blue-950/80" />
        </div>

        {/* Right: Cellular, Wifi, Battery */}
        <div className="flex items-center space-x-1.5 text-black w-14 justify-end">
          {/* Signal Bars */}
          <div className="flex items-end space-x-[2px] h-3">
            <span className="w-[3px] h-1.5 bg-black rounded-xs" />
            <span className="w-[3px] h-2 bg-black rounded-xs" />
            <span className="w-[3px] h-2.5 bg-black rounded-xs" />
            <span className="w-[3px] h-3 bg-black rounded-xs" />
          </div>

          {/* Wifi */}
          <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />

          {/* Battery */}
          <div className="relative flex items-center">
            <div className="w-5 h-2.5 border-[1.5px] border-black rounded-[4px] p-[1px] flex items-center">
              <div className="w-full h-full bg-black rounded-[1px]" />
            </div>
            <div className="w-[1.5px] h-1 bg-black rounded-r-xs ml-[0.5px]" />
          </div>
        </div>
      </div>

      {/* Screen Content */}
      <div className="relative flex-1 flex flex-col overflow-hidden bg-white">
        {children}
      </div>

      {/* iOS Bottom Indicator */}
      <div className="relative shrink-0 w-full pb-2 pt-1 bg-white flex justify-center items-center select-none pointer-events-none z-40">
        <div className="w-36 h-1 bg-black rounded-full" />
      </div>
    </div>
  );
};
