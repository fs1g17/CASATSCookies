import path from 'path';
import { configure } from "@dwp/govuk-casa";
import { Express, Request, Response, NextFunction } from 'express';

function gtmNonce(req: Request, res: Response) {
  // replace cspNonce with our own value so that template.njk still works
  res.locals.cspNonce = res.locals.gtmNonce;
  return `'nonce-${res.locals.gtmNonce}'`;
}

export function configureCasaApp(subApp: Express) {
  const viewDir = path.join(__dirname, '../app/views/');

  const { mount, ancillaryRouter } = configure({
    views: [viewDir],
    session: {
      name: 'myappsessionid',
      secret: 'secret',
      ttl: 3600,
      secure: false
    },
    helmetConfigurator: (config: any) => {
      /**
       * in @dwp/govuk-casa/dist/middleware/pre.js, theres a function called casaCspNonce
       * this function sets the CSP header nonce to the value stored in res.locals.cspNonce
       * here we pass our own gtmNonce function instead which uses the parent app nonce 
       */
      const script = config.contentSecurityPolicy.directives['script-src'];
      script[script.length - 1] = gtmNonce;

      const style = config.contentSecurityPolicy.directives['style-src'];
      style[style.length - 1] = gtmNonce;

      return config;
    }
  });

  ancillaryRouter.use('/start', (req: Request, res: Response, next: NextFunction) => {
    res.render('welcome.njk');
  });

  ancillaryRouter.use('*', (req: Request, res: Response, next: NextFunction) => {
    res.redirect(302, `${req.baseUrl}/start`);
  });

  return mount(subApp, {});
} 
