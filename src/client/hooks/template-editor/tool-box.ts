import { Dropper, DropperOptions, useDropper } from './dropper';
import { Pen, PenOptions, usePen } from './pen';
import { Select, SelectOptions, useSelect } from './select';
import { Text, TextOptions, useText } from './text';
import { Crop, CropOptions, useCrop } from './crop';
import { Tool } from './tool';
import { useState } from 'react';
import { usePrecondition } from '../functional';

export type ToolName = (Dropper | Pen | Select | Text | Crop)['name'];

export interface ToolBox {
  dropper: Dropper;
  pen: Pen;
  select: Select;
  text: Text;
  crop: Crop;
  tool: Tool<ToolName>;
  switchTool(name: ToolName): Promise<void>;
}

export interface ToolBoxOptions
  extends DropperOptions,
    PenOptions,
    SelectOptions,
    TextOptions,
    CropOptions {}

export function useToolBox(options: ToolBoxOptions): ToolBox {
  const dropper = useDropper(options);
  const pen = usePen(options);
  const select = useSelect(options);
  const text = useText(options);
  const crop = useCrop(options);
  const tools = { dropper, pen, select, text, crop };

  const [selectedTool, selectTool] = useState<ToolName>('text');
  const tool = tools[selectedTool];
  const switchTool = usePrecondition(selectTool, tool.complete);

  return { ...tools, tool, switchTool };
}
