#!/usr/bin/env node

process.env.DEBUG = 'nmrium.*';

await import('../src/index.js')

