export type TemplateId = string;

export type Accessibility = 'PRIVATE' | 'PUBLIC';

export type BaseImageId = string;

export interface Label {
  size: number;
  color: string;
  text: string;
  bold: boolean;
  vertical: boolean;
  x: number;
  y: number;
}
