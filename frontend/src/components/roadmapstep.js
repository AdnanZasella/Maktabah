/**
 * Roadmap step component — implemented in Step 12.
 */
export function createRoadmapStep(step, isCompleted, onComplete) {
  const el = document.createElement('div');
  el.textContent = `Step ${step.stepOrder}: ${step.bookTitle}`;
  return el;
}
