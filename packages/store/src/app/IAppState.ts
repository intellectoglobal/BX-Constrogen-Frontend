import { AppState } from "./appSlice";
import { SettingType } from "./setting/settingSlice";
import { LeadFormState } from "./leadFormSlice";
import { FeedbackState } from "./feedbackSlice";

export interface IAppState {
  app: AppState;
  auth: any;
  settings: SettingType;
  leadForm: LeadFormState;
  feedback?: FeedbackState;
}
