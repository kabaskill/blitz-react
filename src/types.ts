export type TemplateType = 'react-js' | 'react-ts';

export interface TemplateConfig {
  name: string;
  directory: string;
}

export interface UserOptions {
  projectName: string;
  template: TemplateType;
  installDeps: boolean;
  initGit: boolean;
}

export interface UserPromptAnswers {
  projectName?: string;
  template: TemplateType;
  installDeps: boolean;
  initGit: boolean;
}

export type UserQuestions = Array<{
  type: string;
  name: string;
  message: string;
  default?: string | boolean;
  choices?: Array<{ name: string; value: string }>;
  when?: () => boolean;
  validate?: (input: string) => boolean | string;
}>;