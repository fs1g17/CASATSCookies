import path from 'path';
import { configure } from "@dwp/govuk-casa";
import { Express, Request, Response, NextFunction } from 'express';

function gtmNonce(req: Request, res: Response) {
  console.log('called gtmNonce');
  return `'nonce-${res.locals.gtmNonce}'`;
}

export function configureCasaApp(subApp: Express) {
  const viewDir = path.join(__dirname, '../app/views/');

  const { mount, ancillaryRouter, preMiddleware } = configure({
    views: [viewDir],
    session: {
      name: 'myappsessionid',
      secret: 'secret',
      ttl: 3600,
      secure: false
    },
    helmetConfigurator: (config: any) => {
      const script = config.contentSecurityPolicy.directives['script-src'];
      script[script.length - 1] = gtmNonce;

      const style = config.contentSecurityPolicy.directives['style-src'];
      style[style.length - 1] = gtmNonce;

      return config;
    }
  });

  ancillaryRouter.use('/start', (req: Request, res: Response, next: NextFunction) => {
    console.log(res.getHeader('Content-Security-Policy'));
    res.render('welcome.njk');
  });

  ancillaryRouter.use('*', (req: Request, res: Response, next: NextFunction) => {
    res.redirect(302, `${req.baseUrl}/start`);
  });

  preMiddleware.push((req: Request, res: Response, next: NextFunction) => {
    res.locals.cspNonce = res.locals.gtmNonce;
    next();
  });

  return mount(subApp, {});
} 
