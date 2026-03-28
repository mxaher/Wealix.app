// Server-side stub for framer-motion.
// Replaces framer-motion in the server/worker bundle to save ~3-5 MB.
// On the server we don't need animations — plain HTML elements are enough for SSR.
// The real framer-motion is still shipped as a client-side JS chunk.
'use strict';

const React = require('react');

// Proxy that returns a forwardRef'd plain element for every motion.* tag
const motionProxy = new Proxy(
  {},
  {
    get(_, tag) {
      if (tag === '__esModule') return true;
      return React.forwardRef(function MotionStub(
        {
          children,
          animate,
          initial,
          exit,
          transition,
          variants,
          whileHover,
          whileTap,
          whileFocus,
          whileInView,
          whileDrag,
          layout,
          layoutId,
          layoutDependency,
          onAnimationStart,
          onAnimationComplete,
          onUpdate,
          onDrag,
          onDragStart,
          onDragEnd,
          onHoverStart,
          onHoverEnd,
          drag,
          dragConstraints,
          dragElastic,
          dragMomentum,
          dragTransition,
          dragPropagation,
          custom,
          inherit,
          ...rest
        },
        ref
      ) {
        return React.createElement(typeof tag === 'string' ? tag : 'div', { ...rest, ref }, children);
      });
    },
  }
);

// AnimatePresence just renders its children on the server
function AnimatePresence({ children }) {
  return children ?? null;
}

// No-op hooks
function useAnimation() {
  return { start: () => {}, stop: () => {}, set: () => {} };
}
function useMotionValue(initial) {
  return { get: () => initial, set: () => {}, onChange: () => () => {} };
}
function useTransform(value, input, output) {
  return value;
}
function useSpring(value) {
  return value;
}
function useScroll() {
  return { scrollY: { get: () => 0 }, scrollX: { get: () => 0 } };
}
function useInView() {
  return false;
}
function useReducedMotion() {
  return false;
}

module.exports = {
  __esModule: true,
  motion: motionProxy,
  m: motionProxy,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  useInView,
  useReducedMotion,
  LazyMotion: ({ children }) => children ?? null,
  domAnimation: {},
  domMax: {},
  MotionConfig: ({ children }) => children ?? null,
  LayoutGroup: ({ children }) => children ?? null,
  Reorder: { Group: ({ children }) => children ?? null, Item: ({ children }) => children ?? null },
};
