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

import React, { useEffect, useState } from 'react';
import { InfoCard } from '@backstage/core-components';
import { makeStyles } from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
  },
}));

export const Dashboard = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const [dash, setDash] = useState(<></>);
  const config = useApi(configApiRef);

  useEffect(() => {
    let conf = '';
    if (entity.metadata.annotations)
      conf = entity.metadata.annotations['znk.io/grafana'];
    fetch(
      `${config.getString(
        'backend.baseUrl',
      )}/api/znkGrafana/snap?${new URLSearchParams({
        conf,
      })}`,
    )
      .then(response => response.json())
      .then(json => {
        setDash(
          <>
            {json.snapshots.map((i: string, c: number) => (
              <img
                key={`snap${c}`}
                src={`data:image/png;base64,${i}`}
                alt={`snap${c}`}
              />
            ))}
          </>,
        );
      });
  }, [config, entity]);

  return (
    <InfoCard title="Grafana" className={classes.infoCard}>
      {dash}
    </InfoCard>
  );
};
