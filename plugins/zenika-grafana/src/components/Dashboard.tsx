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

import React from 'react';
import { InfoCard, Progress, WarningPanel } from '@backstage/core-components';
import { makeStyles } from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { getZnkGrafanaConfiguration } from '../plugin';
import useAsync from 'react-use/lib/useAsync';

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
  },
}));

export const Dashboard = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const config = useApi(configApiRef);
  const { value, loading, error } = useAsync(async () => {
    const response = await fetch(
      `${config.getString(
        'backend.baseUrl',
      )}/api/znkGrafana/snap?${new URLSearchParams({
        conf: getZnkGrafanaConfiguration(entity),
      })}`,
    );
    const json = await response.json();
    return json;
  }, [config, entity]);

  return (
    <InfoCard title="Grafana" className={classes.infoCard}>
      {loading && <Progress />}
      {!loading && error && (
        <WarningPanel
          title="Failed to fetch snapshots"
          message={error?.message}
        />
      )}
      {!loading && !error && value && (
        <>
          {value.snapshots.map((i: string, c: number) => (
            <img
              key={`snap${c}`}
              src={`data:image/png;base64,${i}`}
              alt={`snap${c}`}
            />
          ))}
        </>
      )}
    </InfoCard>
  );
};
