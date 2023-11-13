/*
 * Copyright 2023 Zenika
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  createComponentExtension,
  createPlugin,
} from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';

export const znkGrafanaPlugin = createPlugin({
  id: 'znk-grafana',
});

export const ZnkGrafanaDashboard = znkGrafanaPlugin.provide(
  createComponentExtension({
    name: 'ZnkGrafanaDashboard',
    component: {
      lazy: () => import('./components/Dashboard').then(c => c.Dashboard),
    },
  }),
);

export const ZNK_GRANAFA_LOCATION = 'znk.io/grafana';

export const getZnkGrafanaConfiguration = (entity: Entity) =>
  entity.metadata.annotations?.[ZNK_GRANAFA_LOCATION]?.trim() || '';

export const isZnkGrafanaAvailable = (entity: Entity) =>
  Boolean(getZnkGrafanaConfiguration(entity));
