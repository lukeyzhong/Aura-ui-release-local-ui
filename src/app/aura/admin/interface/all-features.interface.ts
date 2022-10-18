// AllFeaturesResponse interface
export interface AllFeaturesResponse {
  errorCode: number;
  errorMessage: string;
  result: AllFeaturesResult[];
}

// AllFeaturesResult
export interface AllFeaturesResult {
  featureId: string;
  abbr: number;
  name: string;
  parentFeatureId: string;
  createdBy: string;
  createdDateTime: string;
  lastUpdatedBy: string;
  lastUpdatedDateTime: string;
  allowAnonymous: boolean;
  featureCategoryCode: number;
  featureSubCategoryCode: number;
  featureCategory: string;
  featureSubCategory: string;
  parentFeature: string;
  hasPermission: boolean;
}
