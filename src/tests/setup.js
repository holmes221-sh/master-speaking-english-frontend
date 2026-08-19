import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div><div id="feedback-root"></div><div id="loading-root"></div>';
});
