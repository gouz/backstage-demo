import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { Config } from '@backstage/config';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

const getDashboardModel = async (
  dashboardUID: string,
  host: string,
  token: string | undefined,
) => {
  const response = await fetch(`${host}/api/dashboards/uid/${dashboardUID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await response.json();
  return json.dashboard;
};

const bufferToBinaryString = (arrayBuffer: ArrayBuffer) =>
  String.fromCharCode(...new Uint8Array(arrayBuffer));

const createImage = async (
  dashboard: any,
  panel: number,
  host: string,
  token: string | undefined,
) => {
  const currentTime = new Date().getTime();

  const response = await fetch(
    `${host}/render/d-solo/${dashboard.uid}/new-dashboard?${[
      'orgId=1',
      `from=${currentTime - 1000 * 60 * 60 * 6}`,
      `to=${currentTime}`,
      `panelId=${panel}`,
      'width=1000',
      'height=500',
      'tz=Europe%2FParis', // TODO: give timezone as request
    ].join('&')}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const blob = await response.blob();
  return btoa(bufferToBinaryString(await blob.arrayBuffer()));
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config } = options;

  const router = Router();
  router.use(express.json());

  router.get('/snap', async (req, res) => {
    const configuration = req.query.conf as string;
    if (!configuration) {
      res.statusCode = 400;
      res.json({ message: 'No Conf provided' });
      return;
    }

    const grafanas = config.getConfigArray('integrations.znk_grafana')[0];
    if (grafanas) {
      // const hostConfig = grafanas.get('host');
      const tokenConfig = grafanas.get('token')?.toString();

      const [host, dashboard] = configuration.split('@');

      const dashboardObject = await getDashboardModel(
        dashboard,
        host,
        tokenConfig,
      );
      const snapshots: string[] = [];
      await Promise.all(
        [...dashboardObject.panels].map(async panel => {
          snapshots.push(
            await createImage(dashboardObject, panel.id, host, tokenConfig),
          );
        }),
      );
      res.json({ snapshots });
    }
  });

  router.use(errorHandler());
  return router;
}
