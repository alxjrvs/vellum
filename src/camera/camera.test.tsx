import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { CameraProvider } from './CameraProvider';
import {
  CAMERA_STORAGE_KEY,
  cameraQuery,
  DEFAULT_CAMERA_SETTINGS,
  readCameraSettings,
} from './cameraSettings';
import { CameraSetup } from '../components/CameraSetup';
import { useSourceQuery } from '../sourceLink/useSourceQuery';

function fakeStream() {
  const stop = vi.fn();
  return { stream: { getTracks: () => [{ stop }] } as unknown as MediaStream, stop };
}

function mockGetUserMedia(impl: () => Promise<MediaStream>) {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: vi.fn(impl) },
  });
}

function Query() {
  return <span aria-label="query">{useSourceQuery()}</span>;
}

function renderSetup() {
  return render(
    <CameraProvider>
      <CameraSetup />
      <Query />
    </CameraProvider>
  );
}

beforeEach(() => {
  // jsdom has no video playback; the preview only needs srcObject to exist.
  Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', {
    configurable: true,
    writable: true,
    value: null,
  });
});

afterEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
});

describe('camera settings', () => {
  it('defaults to off, mirrored', () => {
    expect(readCameraSettings('')).toEqual(DEFAULT_CAMERA_SETTINGS);
  });

  it('lets URL params override the stored settings', () => {
    localStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify({ camera: false, mirror: false }));
    expect(readCameraSettings('?camera=1&face=1')).toEqual({
      camera: true,
      followFace: true,
      mirror: false,
    });
  });

  it('ignores junk in storage', () => {
    localStorage.setItem(CAMERA_STORAGE_KEY, '{"camera":"yes"');
    expect(readCameraSettings('')).toEqual(DEFAULT_CAMERA_SETTINGS);
  });

  it('writes only non-default settings into a link', () => {
    expect(cameraQuery(DEFAULT_CAMERA_SETTINGS)).toBe('');
    expect(cameraQuery({ camera: true, followFace: true, mirror: false })).toBe(
      'camera=1&face=1&mirror=0'
    );
  });
});

describe('CameraSetup', () => {
  it('opens the camera when turned on, and releases it when turned off', async () => {
    const { stream, stop } = fakeStream();
    mockGetUserMedia(() => Promise.resolve(stream));
    renderSetup();
    expect(screen.getByRole('checkbox', { name: /follow my face/i })).toBeDisabled();

    await act(async () => {
      fireEvent.click(screen.getByRole('checkbox', { name: /draw my camera/i }));
    });
    expect(screen.getByRole('status')).toHaveTextContent('Camera on.');
    expect(screen.getByLabelText('Camera preview')).toBeInTheDocument();
    expect(screen.getByLabelText('query')).toHaveTextContent('camera=1');

    fireEvent.click(screen.getByRole('checkbox', { name: /follow my face/i }));
    expect(screen.getByLabelText('query')).toHaveTextContent('camera=1&face=1');
    expect(JSON.parse(localStorage.getItem(CAMERA_STORAGE_KEY) ?? '{}')).toMatchObject({
      camera: true,
      followFace: true,
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('checkbox', { name: /draw my camera/i }));
    });
    expect(stop).toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Camera off.');
    // Face tracking needs the camera, so turning the camera off turns it off too.
    expect(screen.getByRole('checkbox', { name: /follow my face/i })).not.toBeChecked();
  });

  it('explains a camera held by another app', async () => {
    mockGetUserMedia(() => Promise.reject(new DOMException('in use', 'NotReadableError')));
    localStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify({ camera: true }));
    await act(async () => {
      renderSetup();
    });
    expect(screen.getByRole('status')).toHaveTextContent(/in use by another app/);
    expect(screen.getByText(/Video Capture Device/)).toBeInTheDocument();
  });

  it('shows the OBS launch flag when OBS refuses the camera', async () => {
    (window as { obsstudio?: object }).obsstudio = {};
    localStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify({ camera: true }));
    try {
      await act(async () => {
        renderSetup();
      });
      expect(screen.getByRole('status')).toHaveTextContent(/refused/);
      expect(screen.getAllByText(/--enable-media-stream/).length).toBeGreaterThan(0);
    } finally {
      delete (window as { obsstudio?: object }).obsstudio;
    }
  });
});
