import { useEffect, useRef, useState } from 'react';

export type Transition = 'entering' | 'entered' | 'exiting' | 'exited';

export const transitionClasses: { [K in Transition]: string } = {
  entering: 'opacity-0',
  entered: 'transition ease-out opacity-100',
  exiting: 'opacity-100 pointer-events-none',
  exited: 'transition ease-in opacity-0 pointer-events-none',
};

export function useTransition(on: boolean): Transition {
  const [transition, setTransition] = useState<Transition>(on ? 'entered' : 'exited');
  const timeoutId = useRef(0);

  useEffect(() => {
    if (transition == (on ? 'entered' : 'exited')) return;
    clearTimeout(timeoutId.current);
    if (on) {
      setTransition('entering');
      timeoutId.current = window.setTimeout(() => setTransition('entered'), 0);
    } else {
      setTransition('exiting');
      timeoutId.current = window.setTimeout(() => setTransition('exited'), 0);
    }
  }, [on, transition]);

  return transition;
}
