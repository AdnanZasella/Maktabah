/**
 * Madhab opinion card component — implemented in Step 18.
 */
export function createMadhabCard(opinion) {
  const el = document.createElement('div');
  el.textContent = `${opinion.madhab}: ${opinion.opinion}`;
  return el;
}
