import { useEffect, useEffectEvent, useRef } from 'react';
import { createHand } from '../hand.js';
import { FINGER_NUMBERS, stillPose } from '../pose.js';

function stopTimers(timers) {
  timers.forEach(clearTimeout);
  timers.length = 0;
}

// The 3D hand in `stageRef`, kept showing `pose` with the given look. The
// hand is created first, so the effects after it always find it.
export function useHand(stageRef, { pose, mode, side, numbers, onTipClick }) {
  const handRef = useRef(null);
  const previewTimers = useRef([]);
  const tipClicked = useEffectEvent((finger) => onTipClick(finger));

  useEffect(() => {
    const timers = previewTimers.current;
    const hand = createHand(stageRef.current, {
      background: false, // the stage's CSS paints the backdrop
      onTipClick: (finger) => tipClicked(finger),
    });
    hand.setTipsClickable(true);
    handRef.current = hand;
    return () => {
      stopTimers(timers);
      hand.dispose();
      handRef.current = null;
    };
  }, [stageRef]);

  useEffect(() => handRef.current.setMode(mode), [mode]);
  useEffect(() => handRef.current.setSide(side), [side]);
  useEffect(() => handRef.current.setNumbersVisible(numbers), [numbers]);

  // Showing the pose being edited stops a preview
  useEffect(() => {
    stopTimers(previewTimers.current);
    handRef.current.setPose(pose);
  }, [pose]);

  return {
    resetView: () => handRef.current?.resetView(),
    // Light up a finger's badge (the hand rotation has none)
    highlightFinger(finger, on) {
      if (finger in FINGER_NUMBERS) handRef.current?.highlightFinger(finger, on);
    },
    // Snap to `from`, move into `to` over the duration, hold, then return to
    // the pose being edited
    playTransition(from, to, duration) {
      const hand = handRef.current;
      const timers = previewTimers.current;
      stopTimers(timers);
      hand.setPose(from, { instant: true });
      timers.push(
        setTimeout(() => hand.setPose(to, { duration }), 500),
        setTimeout(() => hand.setPose(pose), 500 + duration + 1500)
      );
    },
    // Show the first step, play the movement through, hold the last step,
    // then return to the pose being edited (unless something cut it short)
    playMotion(document) {
      const hand = handRef.current;
      const timers = previewTimers.current;
      stopTimers(timers);
      hand.setPose(stillPose(document), { instant: true });
      timers.push(
        setTimeout(async () => {
          if (await hand.playMotion(document)) timers.push(setTimeout(() => hand.setPose(pose), 1500));
        }, 500)
      );
    },
  };
}
