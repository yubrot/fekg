import { useCallback, useEffect, useState } from 'react';
import { Canvas, useCanvas } from '../canvas';
import { useCommitLog } from '../commit-log';
import { useDefer, useDeferredEffect } from '../defer';
import { TemplateChange, Label } from '../../template';
import { getBlob, getImage } from '../../canvas-util';

export interface TemplateState {
  name: string;
  changeName(name: string): void;
  labels: Label[];
  changeLabels(labels: Label[]): void;
  canvas: Canvas;
  stageCanvasChange(): Promise<void>;
  commitChanges(): void;

  canUndo: boolean;
  canRedo: boolean;
  undo(): void;
  redo(): void;

  isChangedSinceLastSave: boolean;
  getChangesSinceLastSave(): Promise<{ change: TemplateChange; notifySaved(): void }>;
}

interface Commit {
  name: string;
  labels: Label[];
  image: HTMLImageElement;
}

export function useTemplateState(
  initialName: string,
  initialImage: HTMLImageElement,
  initialLabels: Label[]
): TemplateState {
  // (1) Immediate state
  const [name, setName] = useState(initialName);
  const [labels, setLabels] = useState(initialLabels);
  const canvas = useCanvas();
  const { ctx: canvasCtx, initialize: initializeCanvas } = canvas;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => initializeCanvas(initialImage), [initializeCanvas]);

  // (2) State commits
  const {
    commit,
    current: currentCommit,
    afterCommit,
    hasPrev: commitsHasPrev,
    hasNext: commitsHasNext,
    goBack: commitsGoBack,
    goForward: commitsGoForward,
  } = useCommitLog<Commit>(() => ({ name, labels, image: initialImage }), 100);

  // (1) Immediate state -> (2) State commits
  const [pendingChanges, setPendingChanges] = useState<Partial<Commit> | null>(null);

  const commitDefer = useDefer();
  const commitChanges = useCallback(() => {
    setPendingChanges(changes => {
      // commit immediately after the setPendingChanges call
      if (changes) commitDefer(() => commit(current => ({ ...current, ...changes })), 0);
      return null;
    });
  }, [commit, commitDefer]);

  const discardChanges = useCallback(() => {
    setPendingChanges(null);
  }, []);

  useDeferredEffect(commitChanges, [pendingChanges, commitChanges], 1000);

  const changeName = useCallback((name: string) => {
    setName(name);
    setPendingChanges(diff => ({ ...diff, name }));
  }, []);

  const changeLabels = useCallback((labels: Label[]) => {
    setLabels(labels);
    setPendingChanges(diff => ({ ...diff, labels }));
  }, []);

  // Changed to the canvas are staged manually
  const stageCanvasChange = useCallback(async () => {
    if (!canvasCtx) return;
    const image = await getImage(canvasCtx.canvas);
    setPendingChanges(diff => ({ ...diff, image }));
  }, [canvasCtx]);

  // (2) State commits -> (1) Immediate state
  const canUndo = commitsHasPrev || !!pendingChanges;
  const canRedo = commitsHasNext;

  const undo = useCallback(() => {
    commitChanges();
    commitsGoBack();
  }, [commitChanges, commitsGoBack]);

  const redo = useCallback(() => {
    discardChanges();
    commitsGoForward();
  }, [discardChanges, commitsGoForward]);

  useEffect(() => {
    if (afterCommit) return;
    setName(currentCommit.name);
    setLabels(currentCommit.labels);
    initializeCanvas(currentCommit.image);
  }, [currentCommit, afterCommit, initializeCanvas]);

  // (3) Last saved state
  const [lastSavedState, setLastSavedState] = useState<Commit>(currentCommit);

  // (2) State commits -> (3) Last saved state:
  const isChangedSinceLastSave =
    currentCommit.name != lastSavedState.name ||
    currentCommit.image != lastSavedState.image ||
    currentCommit.labels != lastSavedState.labels;

  const getChangesSinceLastSave = useCallback(async () => {
    if (!canvasCtx) throw 'Failed to get canvas 2d cotnext';
    const change: TemplateChange = {};
    const { name, image, labels } = currentCommit;
    if (name != lastSavedState.name) change.name = name;
    if (image != lastSavedState.image) change.image = await getBlob(canvasCtx.canvas, 'image/jpeg'); // FIXME: Size limit is not considered
    if (labels != lastSavedState.labels) change.labels = labels;
    const notifySaved = () => setLastSavedState({ name, image, labels });
    return { change, notifySaved };
  }, [canvasCtx, currentCommit, lastSavedState]);

  return {
    name,
    changeName,
    labels,
    changeLabels,
    canvas,
    stageCanvasChange,
    commitChanges,

    canUndo,
    canRedo,
    undo,
    redo,

    isChangedSinceLastSave,
    getChangesSinceLastSave,
  };
}
