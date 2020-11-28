import { useState } from 'react';
import { useDeferredEffect } from '../hooks/defer';
import { useTransition, transitionClasses } from '../hooks/transition';
import LoadingSpinner from './LoadingSpinner';

export interface Props {}

export default function Progress({}: Props): React.ReactElement {
  const [show, setShow] = useState(false);
  useDeferredEffect(() => setShow(true), [], 100);
  const transition = useTransition(show);

  return (
    <div
      className={`fixed z-50 inset-0 bg-opacity-50 bg-bluegray-200 flex flex-col justify-center items-center ${transitionClasses[transition]}`}
    >
      <LoadingSpinner className="w-24 h-24" />
    </div>
  );
}
