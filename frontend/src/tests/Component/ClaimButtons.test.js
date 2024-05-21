import { render, fireEvent, waitFor } from '@testing-library/react';
import ClaimButtons, { triggerConfetti } from './ClaimButtons'; // Assuming this is the path to your component file

// Mock the ConfettiExplosion component
jest.mock('react-confetti-explosion', () => () => null);

describe('triggerConfetti', () => {
  test('should trigger confetti explosion and set claim state when claimState is false', () => {
    // Mock functions and state
    const claimFunc = jest.fn();
    const setClaimedState = jest.fn();
    const setShowModal = jest.fn();
    const claimState = false;

    // Call the function
    triggerConfetti(claimFunc, claimState, setClaimedState, setShowModal);

    // Assertions
    expect(claimFunc).toHaveBeenCalled();
    expect(setClaimedState).toHaveBeenCalledWith(true);
    expect(setShowModal).toHaveBeenCalledWith(false);
  });

  test('should not trigger confetti explosion when claimState is true', () => {
    // Mock functions and state
    const claimFunc = jest.fn();
    const setClaimedState = jest.fn();
    const setShowModal = jest.fn();
    const claimState = true;

    // Call the function
    triggerConfetti(claimFunc, claimState, setClaimedState, setShowModal);

    // Assertions
    expect(claimFunc).not.toHaveBeenCalled();
    expect(setClaimedState).not.toHaveBeenCalled();
    expect(setShowModal).not.toHaveBeenCalled();
  });
});
