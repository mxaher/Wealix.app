// Server-side stub for recharts.
// Replaces recharts in the server/worker bundle to save ~3-5 MB.
// Charts require a browser DOM and client-side JS anyway; returning null on the
// server is correct behaviour — the real recharts bundle loads as a client chunk.
'use strict';

const React = require('react');

// A no-op component that renders nothing on the server
const Null = React.forwardRef(function NullComponent() { return null; });

const handler = {
  get(_, key) {
    if (key === '__esModule') return true;
    if (key === 'default') return {};
    return Null;
  },
};

module.exports = new Proxy({}, handler);
