import path from 'path';
import { configure } from "@dwp/govuk-casa";
import express, { Request, Response, NextFunction } from 'express';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import url from 'url';
import crypto from 'crypto';
import qs from 'querystring';
import { ConsentCookie } from './typings/ConsentCookie';

const port = 3000;
const oneYearInMilliseconds = 1000 * 60 * 60 * 24 * 365;

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
  console.log('welcome.njk');
  res.render('welcome.njk');
});

// ancillaryRouter.use('*', (req: Request, res: Response, next: NextFunction) => {
//   res.redirect(302, `${req.baseUrl}/start`);
// })

const casaApp = express();
mount(casaApp, {});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('secret'));
app.use('/assets/js', express.static(path.resolve(__dirname, '../app/assets/javascript')));

app.use((req: Request, res: Response, next: NextFunction) => {
  const { ga, preferenceSet, bannerActioned } = req.cookies['consentCookie'] || {};
  const consentCookie: ConsentCookie = {
    ga, 
    preferenceSet,
    bannerActioned
  };
  res.locals.consentCookie = consentCookie;

  res.locals.gtmNonce = crypto.randomBytes(16).toString('base64');
  res.locals.cookieBackLink = qs.escape(req.originalUrl);

  console.log({
    consentCookie,
    gtmNonce: res.locals.gtmNonce,
    cookieBackLink: res.locals.cookieBackLink
  });

  // clearing Google cookies: https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage#gtagjs_and_analyticsjs_universal_analytics_-_cookie_usage
  if (!consentCookie.ga) {
    res.clearCookie('_gid'); // Used to distinguish users (expires in 24h).
    res.clearCookie('_ga');  // Used to distinguish users (expires in 2 years). 
  }

  res.cookie("consentCookie", consentCookie, {
    path: '/',
    httpOnly: false,
    sameSite: true,
    maxAge: oneYearInMilliseconds,
    signed: true,
  });

  console.log('cookieCOnsent passed: calling next()');

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
