// SkillsResponse interface
export interface SkillsResponse {
  errorCode: number;
  errorMessage: string;
  result: SkillsResult[];
}

// SkillsResult
export interface SkillsResult {
  skillId: string;
  personId: string;
  skillCode: number;
  skillLevelCode: number;
  lastUsedYear: number;
  skill: string;
  skillLevel: string;
  creatorId?: string;
  createdDateTime?: string;
  lastUpdateId?: string;
  lastUpdateDateTime?: string;
}

export interface SkillsAddEditRecord {
  skillId: string;
  personId: string;
  skill: string;
  skillLevel: string;
  skillCode: number;
  skillLevelCode: number;
  lastUsedYear: number;
}

// SkillsAddPopupRecord
export interface SkillsAddPopupRecord {
  action: string;
  personId: string;
  skillsData: SkillsResult[];
  mapSkill: Map<number, string>;
}
// SkillsEditPopupRecord
export interface SkillsEditPopupRecord {
  action: string;
  personId: string;
  skillsData: SkillsResult;
  mapSkill: Map<number, string>;
}
