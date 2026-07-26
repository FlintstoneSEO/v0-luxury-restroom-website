import { registerAstroComponent } from '@cloudcannon/editable-regions/astro';
import { componentMap } from './componentMap';

Object.entries(componentMap).forEach(([key, component]) => {
  registerAstroComponent(key, component);
});
