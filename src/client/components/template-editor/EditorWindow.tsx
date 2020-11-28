import { useCallback, useState } from 'react';
import { getBlob } from '../../canvas-util';
import {
  getTemplatePublishingBlockingExpirationDate,
  isTemplatePublishingBlockedByCreationDate,
} from '../../user';
import { fillByLabel, Label, TemplateChange } from '../../template';
import { usePrecondition } from '../../hooks/functional';
import { useAccount } from '../../hooks/account';
import { useFeedbackList } from '../../hooks/feedback-list';
import { useWindowSize } from '../../hooks/window-size';
import { useMouse } from '../../hooks/mouse';
import { useTemplateState } from '../../hooks/template-editor/template-state';
import { usePalette } from '../../hooks/template-editor/palette';
import { useToolBox } from '../../hooks/template-editor/tool-box';
import Icon20 from '../Icon20';
import Icon24 from '../Icon24';
import Slider from '../Slider';
import ColorPalette from './ColorPalette';
import ToolList from './ToolList';
import ConfirmDeleteTemplate from './ConfirmDeleteTemplate';
import ConfirmMakePublic from './ConfirmMakePublic';
import PenOptions from './PenOptions';
import PenNib from './PenNib';
import SelectOptions from './SelectOptions';
import SelectionPreview from './SelectionPreview';
import FloatingImage from './FloatingImage';
import TextOptions from './TextOptions';
import LabelPreview from './LabelPreview';
import CropOptions from './CropOptions';
import CroppingRect from './CroppingRect';
import DropperOptions from './DropperOptions';

export interface Props {
  creator: string;
  initialName: string;
  initialImage: HTMLImageElement;
  initialAccessibility: 'PUBLIC' | 'PRIVATE';
  initialLabels: Label[];
  onSave(update: TemplateChange): Promise<boolean>;
  onDelete(): void;
}

export default function EditorWindow({
  creator,
  initialName,
  initialImage,
  initialAccessibility,
  initialLabels,
  onSave,
  onDelete,
}: Props): React.ReactElement {
  const window = useWindowSize();
  const { feed, notify } = useFeedbackList();
  const { user } = useAccount();
  const templateState = useTemplateState(initialName, initialImage, initialLabels);
  const [accessibility, setAccessibility] = useState(initialAccessibility);
  const [canvasScale, setCanvasScale] = useState(() => exactCanvasScale(initialImage, window));
  const palette = usePalette(() => templateState.labels.map(l => l.color));
  const toolBox = useToolBox({ ...templateState, palette });

  const { name, changeName, labels, changeLabels, canvas, canUndo, canRedo } = templateState;
  const undo = usePrecondition(templateState.undo, toolBox.tool.complete);
  const redo = usePrecondition(templateState.redo, toolBox.tool.complete);

  const hasChange = templateState.isChangedSinceLastSave;
  const getChange = usePrecondition(templateState.getChangesSinceLastSave, toolBox.tool.complete);

  const saveTemplate = useCallback(async () => {
    const { change, notifySaved } = await getChange();
    if (await onSave(change)) notifySaved();
  }, [getChange, onSave]);

  const deleteTemplate = useCallback(async () => {
    const sure = await feed(resolve => <ConfirmDeleteTemplate resolve={resolve} />);
    if (sure) onDelete();
  }, [feed, onDelete]);

  const toggleAccessibility = useCallback(async () => {
    if (!user) return;
    if (isTemplatePublishingBlockedByCreationDate(user)) {
      const date = getTemplatePublishingBlockingExpirationDate(user);
      notify('info', `Template publishing is blocked until ${date.toLocaleString()}.`);
      return;
    }

    if (accessibility == 'PUBLIC') {
      if (await onSave({ accessibility: 'PRIVATE' })) setAccessibility('PRIVATE');
    } else {
      if (!(await feed(resolve => <ConfirmMakePublic resolve={resolve} />))) return;
      if (await onSave({ accessibility: 'PUBLIC' })) setAccessibility('PUBLIC');
    }
  }, [accessibility, feed, notify, onSave, user]);

  async function renderAsImage(): Promise<void> {
    if (!canvas.ctx) return;

    const win = open('about:blank');
    if (!win) return;

    const imageData = canvas.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = imageData.width;
    tmpCanvas.height = imageData.height;
    {
      const ctx = tmpCanvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(imageData, 0, 0);
      for (const label of labels) fillByLabel(ctx, label);
    }
    const blob = await getBlob(tmpCanvas, 'image/jpeg');
    if (blob) win.location.href = URL.createObjectURL(blob);
  }

  function positionInCanvas(ev: MouseEvent): [number, number] {
    if (!canvas.ctx) return [0, 0];
    const canvasRect = canvas.ctx.canvas.getBoundingClientRect();
    const px = Math.floor((ev.clientX - canvasRect.left) / canvasScale);
    const py = Math.floor((ev.clientY - canvasRect.top) / canvasScale);
    return [px, py] as [number, number];
  }

  const screenMouse = useMouse({
    onDrag(ev, state) {
      const [x, y] = positionInCanvas(ev);
      toolBox.tool.onDrag?.(x, y, state);
    },
    onMove(ev) {
      const [x, y] = positionInCanvas(ev);
      toolBox.tool.onMove?.(x, y);
    },
    onWheel(ev) {
      ev.preventDefault();
      if (toolBox.tool.onWheel && !ev.ctrlKey) {
        toolBox.tool.onWheel?.(ev.deltaY);
      } else {
        setCanvasScale(s => (ev.deltaY < 0 ? Math.min(s + 0.05, 2) : Math.max(s - 0.05, 0.25)));
      }
    },
  });

  const canvasWidth = Math.floor(canvas.width * canvasScale);
  const canvasHeight = Math.floor(canvas.height * canvasScale);
  const screenWidth = Math.floor(Math.max(Math.min(canvas.width * 2, window.width * 0.5), 500));
  const screenHeight = Math.floor(Math.max(Math.min(canvas.height * 2, window.height * 0.7), 500));
  const canvasTop = Math.max(0, Math.floor((screenHeight - canvasHeight) / 2));
  const canvasLeft = Math.max(0, Math.floor((screenWidth - canvasWidth) / 2));
  const viewportWidth = Math.max(canvasWidth, screenWidth);
  const viewportHeight = Math.max(canvasHeight, screenHeight);

  return (
    <div>
      <div className="m-4 flex justify-center items-start text-bluegray-600">
        <div className="mr-2 bg-white border-4 border-bluegray-300">
          <div className="font-bold flex justify-between items-stretch border-b border-bluegray-300">
            <input
              type="text"
              className="self-center flex-grow w-0 label py-1 px-2 my-2 mx-4 bg-transparent border-b border-bluegray-400 transition hover:border-bluegray-500 focus:border-blue-500 focus:outline-none"
              value={name}
              onChange={e => changeName(e.target.value)}
            />
            {user?.id == creator && (
              <button
                className="button icon-button"
                disabled={name != '' && !hasChange}
                onClick={saveTemplate}
              >
                <Icon24 name="save" className="w-6 h-6" />
                <div>Save</div>
              </button>
            )}
            <button className="hidden button icon-button">
              <Icon24 name="star" className="w-6 h-6" />
              <div>Star</div>
            </button>
          </div>

          <div
            ref={screenMouse.ref}
            className="overflow-auto bg-bluegray-500"
            style={{
              width: `${screenWidth}px`,
              height: `${screenHeight}px`,
              cursor: toolBox.tool.cursor || 'default',
            }}
          >
            <div
              className="relative"
              style={{
                width: `${viewportWidth}px`,
                height: `${viewportHeight}px`,
              }}
            >
              <canvas
                ref={canvas.ref}
                className="absolute"
                style={{
                  top: `${canvasTop}px`,
                  left: `${canvasLeft}px`,
                  width: `${canvasWidth}px`,
                  height: `${canvasHeight}px`,
                  // reset for some browsers
                  letterSpacing: '0',
                  lineHeight: '1',
                }}
              />

              <div
                className="absolute pointer-events-none"
                style={{
                  top: `${canvasTop}px`,
                  left: `${canvasLeft}px`,
                  width: `${canvas.width}px`,
                  height: `${canvas.height}px`,
                  transformOrigin: 'top left',
                  transform: `scale(${canvasScale})`,
                }}
              >
                {toolBox.tool.name == 'pen' && (
                  <PenNib
                    scale={canvasScale}
                    radius={toolBox.pen.radius}
                    color={toolBox.pen.previewColor}
                    position={toolBox.pen.previewPosition || [canvas.width / 2, canvas.height / 2]}
                  />
                )}

                {toolBox.tool.name == 'select' && toolBox.select.selectingRect && (
                  <SelectionPreview
                    scale={canvasScale}
                    color={toolBox.select.selectingColor}
                    mode={toolBox.select.rectMode}
                    rect={toolBox.select.selectingRect}
                  />
                )}

                {toolBox.tool.name == 'select' && toolBox.select.floatingImageRect && (
                  <FloatingImage
                    scale={canvasScale}
                    mode={toolBox.select.rectMode}
                    rect={toolBox.select.floatingImageRect}
                  />
                )}

                {labels.map((label, index) => (
                  <LabelPreview
                    key={index}
                    scale={canvasScale}
                    isSelected={toolBox.text.currentLabel == index}
                    showBorder={toolBox.tool.name == 'text'}
                    label={label}
                  />
                ))}

                {toolBox.tool.name == 'crop' && toolBox.crop.croppingRect && (
                  <CroppingRect scale={canvasScale} rect={toolBox.crop.croppingRect} />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-stretch space-x-4 border-t border-bluegray-300">
            <div className="flex items-strech">
              {user?.id == creator && (
                <>
                  <button className="button icon-button text-red-500" onClick={deleteTemplate}>
                    <Icon20 name="trash" className="w-5 h-5" />
                    <div>Delete</div>
                  </button>
                  <button
                    className={`button icon-button ${
                      accessibility == 'PUBLIC' ? 'text-green-500' : 'text-purple-300'
                    }`}
                    onClick={toggleAccessibility}
                  >
                    <Icon20
                      name={accessibility == 'PUBLIC' ? 'eye' : 'eye-off'}
                      className="w-5 h-5"
                    />
                    <div>{accessibility == 'PUBLIC' ? 'Public' : 'Private'}</div>
                  </button>
                </>
              )}
            </div>
            <div className="flex-grow flex flex-col">
              <Slider
                value={canvasScale}
                range={[0.25, 2, 0.05]}
                onChange={setCanvasScale}
                className="flex-grow"
              />
              <button
                className="button text-xs self-end py-1 px-2 mb-1 hover:bg-gray-200"
                onClick={() => setCanvasScale(exactCanvasScale(canvas, window))}
              >
                <Icon24 name="search" className="inline-block w-4 h-4" />{' '}
                {Math.floor(canvasScale * 100)}%
              </button>
            </div>
            <div className="flex items-strech">
              <button className="button icon-button" disabled={!canUndo} onClick={undo}>
                <Icon20 name="ccw" className="w-5 h-5" />
                <div>Undo</div>
              </button>
              <button className="button icon-button p-1" disabled={!canRedo} onClick={redo}>
                <Icon20 name="cw" className="w-5 h-5" />
                <div>Redo</div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow flex flex-col items-stretch max-w-md bg-white border border-bluegray-200 shadow-md rounded-md py-4">
          <ColorPalette {...palette} className="py-4 px-2 border-b border-bluegray-200" />

          <ToolList
            selected={toolBox.tool.name}
            select={toolBox.switchTool}
            className="pt-1 border-b border-bluegray-300 bg-bluegray-100"
            itemClassName={selected =>
              selected
                ? 'transform translate-y-px border-t border-l border-r border-bluegray-300 rounded-t-sm'
                : ''
            }
          />

          <div
            className="px-3 py-4 border-b border-bluegray-200 overflow-auto"
            style={{ maxHeight: `${screenHeight - 50}px` }}
          >
            {toolBox.tool.name == 'dropper' && (
              <DropperOptions dropper={toolBox.dropper} className="px-3" />
            )}

            {toolBox.tool.name == 'pen' && (
              <PenOptions pen={toolBox.pen} palette={palette} className="px-3" />
            )}

            {toolBox.tool.name == 'select' && (
              <SelectOptions select={toolBox.select} palette={palette} className="px-3" />
            )}

            {toolBox.tool.name == 'text' && (
              <TextOptions
                labels={labels}
                setLabels={changeLabels}
                text={toolBox.text}
                palette={palette}
              />
            )}

            {toolBox.tool.name == 'crop' && <CropOptions crop={toolBox.crop} className="px-3" />}
          </div>

          <div className="p-4 flex items-center justify-around space-x-2">
            <button className="button primary-button" onClick={renderAsImage}>
              <Icon24 name="photograph" className="w-6 h-6" />
              <div className="text-sm">Render as image</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function exactCanvasScale(
  image: { width: number; height: number },
  window: { width: number; height: number }
): number {
  return Math.max(
    Math.min(
      1,
      ((window.width * 0.5) / image.width) * 0.95,
      ((window.height * 0.7) / image.height) * 0.95
    ),
    0.25
  );
}
