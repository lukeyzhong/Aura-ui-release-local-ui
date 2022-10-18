// UserActivityResponse interface
export interface UserActivityResponse {
  errorCode: number;
  errorMessage: string;
  result: UserActivityResult[];
}
// UserActivityResult
export interface UserActivityResult {
  userActivityId: string;
  resourceTypeCode: number;
  resourceValue: string;
  activityOn: string;
  activityText: string;
  userId: string;
  userActivityTypeCode: string;
  activityBy: string;
  userActivityType: UserActivityType;
}
interface UserActivityType {
  userActivityTypeCode: string;
  name: string;
  userActivityTypeCategoryCode: string;
  cssClass: string;
  userActivityTypeCategory: string;
}
