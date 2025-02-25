import type { Question, Answers } from 'inquirer';

export type TemplateType = 'react-js' | 'react-ts';

export interface TemplateConfig {
  name: string;
  directory: string;
  dependencies: {
    install: string[];
    start: string[];
  };
}

export interface UserOptions {
  projectName: string;
  template: TemplateType;
  installDeps: boolean;
  initGit: boolean;
}

export interface UserPromptAnswers extends Answers {
  projectName?: string;
  template: TemplateType;
  installDeps: boolean;
  initGit: boolean;
}

export type UserQuestions = Question<UserPromptAnswers>[];