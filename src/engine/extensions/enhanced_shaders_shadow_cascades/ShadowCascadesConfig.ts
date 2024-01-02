export const shadowCascadesConfig = {
  // Near cascade size. Try to use a lower size value to improve the quality of your sun shadows.
  // Limit to 10-30.
  nearSize: 20,
  // Middle cascade size. Try to use a lower size value to improve the quality of your sun shadows.
  // Limit to 40-110.
  midSize: 60,
  // Far cascade size. This cascade define the final rendering distance of your sun shadows.
  // Lower values will improve performance, higher values will improve your distant shadows at the cost of performance.
  // Limit to 120-300.
  farSize: 160,
  // 0: Only NEAR cascade render grass shadows
  // 1: Extend grass shadows to the mid cascade
  // 2: All cascades render grass shadows
  // 3: All lights will cast grass shadows
  grassShadowQuality: 0,
  // Rendering distance of sun grass shadows. The value is porcentual to your grass rendering distance.
  // Lower values will improve performance.
  // Limit to 0-1.
  grassShadowDistance: 0.35,
  // This value adjust the rendering distance of grass shadows for non-directional lights.
  // Lower values will improve performance, but you might notice when the shadows stop being rendered.
  grassShadowNonDirMaxdistance: 30,
};
