import { useEffect, useEffectEvent } from 'react';

// React's onChange fires on every step of a slider. The native change event
// fires once, when the slider is let go: the moment an edit is finished.
export function useCommitEvent(ref, onCommit) {
  const committed = useEffectEvent(() => onCommit());
  useEffect(() => {
    const el = ref.current;
    const onChange = () => committed();
    el.addEventListener('change', onChange);
    return () => el.removeEventListener('change', onChange);
  }, [ref]);
}
