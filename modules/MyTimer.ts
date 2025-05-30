import { NativeModules } from "react-native";

const { MyTimerModule } = NativeModules;

export interface TimerState {
  endTime: number;
  seconds: number;
  isPaused: boolean;
  activityId: string;
  duration: number;
}

interface CountDownTimerModule {
  startTimer: (duration: number) => Promise<string>;
  puaseTimer: (activityId: string) => void;
  resumeTimer: (activityId: string) => void;
  endTimer: (activityId: string) => void;
  getTimerState: () => Promise<TimerState>;
}

// Cast the native module to your typed interface
const TimerModule = MyTimerModule as CountDownTimerModule;

// Export functions directly for convenience
export const startTimer = TimerModule.startTimer;
export const puaseTimer = TimerModule.puaseTimer;
export const resumeTimer = TimerModule.resumeTimer;
export const endTimer = TimerModule.endTimer;
export const getTimerState = TimerModule.getTimerState;
