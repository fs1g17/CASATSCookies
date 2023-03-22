import path from 'path';
import helmet from 'helmet';
import { configure } from "@dwp/govuk-casa";
import express, { Request, Response, NextFunction } from 'express';

import crypto from 'crypto';

const port = 3000;

const viewDir = path.join(__dirname, '../app/views/');

const { mount, ancillaryRouter } = configure({
  views: [viewDir],
  session: {
    name: 'myappsessionid',
    secret: 'secret',
    ttl: 3600,
    secure: false
  }
});

ancillaryRouter.use('/start', (req: Request, res: Response, next: NextFunction) => {
  res.render('welcome.njk');
});

// ancillaryRouter.use('*', (req: Request, res: Response, next: NextFunction) => {
//   res.redirect(302, `${req.baseUrl}/start`);
// })

const casaApp = express();
mount(casaApp, {});

const app = express();
app.use(helmet.noSniff());
// app.use('/assets/js', express.static(path.resolve(__dirname, './static-assets/javascript')));
// app.use('/assets/css', express.static(path.resolve(__dirname, './static-assets/css')));

//app.use(express.static(path.join(__dirname, 'public')));

// app.use('/assets/css', express.static(path.join(__dirname, 'public/css')));
// app.use('/assets/js', express.static(path.join(__dirname, 'public/javascript')));

console.log('resolved path: ', path.resolve(__dirname, './public'));
app.use(express.static(path.resolve(__dirname, './public')));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.gtmNonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use('/', casaApp);

app.listen(port, () => {
  console.log('started on port ', port);
});
