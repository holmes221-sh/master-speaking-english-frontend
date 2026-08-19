// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup';
import ConcentricProgress from '../components/ConcentricProgress';
import { FeedBack } from '../components/Feedback';
import { LoadingBar } from '../components/LoadingBar';

describe('shared components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders feedback content in its portal and calls its close handler', async () => {
    const onClose = vi.fn();
    render(<FeedBack onClose={onClose}>Helpful feedback</FeedBack>);

    expect(screen.getByText('Helpful feedback')).toBeInTheDocument();
    fireEvent.click(document.querySelector('.feedback-closing-button'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders full-screen and inline loading indicators', () => {
    const { rerender } = render(<LoadingBar />);
    expect(document.querySelector('#loading-root .loading-circle')).toBeInTheDocument();

    rerender(<LoadingBar small />);
    expect(document.querySelector('.small-loading-circle')).toBeInTheDocument();
  });

  it('clamps the displayed score to the supported range', () => {
    render(<ConcentricProgress averageScore={150} />);
    expect(screen.getByText('Overall Score 100%')).toBeInTheDocument();
  });
});
