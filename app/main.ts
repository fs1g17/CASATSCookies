import path from 'path';
import { configure } from "@dwp/govuk-casa";
import express, { Request, Response, NextFunction } from 'express';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import url from 'url';
import crypto from 'crypto';
import qs from 'querystring';

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
app.use(cookieParser('secret'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets/js', express.static(path.resolve(__dirname, '../app/assets/javascript')));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.googleTagManagerId = 'GTM-WP6V2WX';
  
  res.locals.gtmNonce = crypto.randomBytes(16).toString('base64');
  res.locals.cookieBackLink = qs.escape(req.originalUrl);
  next();
});

app.post('/cookies', (req: Request, res: Response, next: NextFunction) => {
  console.log('in cookies endpoint');
  console.log('req.body: ', req.body);
  //const redirectHiddenFormField = req.body && req.body.backLinkHref;

  const redirect = req.body.redirect;

  res.redirect(url.parse(qs.unescape(redirect)).path as string);
});

app.use('/', casaApp);


app.listen(port, () => {
  console.log('started on port ', port);
});
