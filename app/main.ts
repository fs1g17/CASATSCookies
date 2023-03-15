import path from 'path';
import helmet from 'helmet';
import session from 'express-session';
import express, { Request, Response, NextFunction } from 'express';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import url from 'url';
import crypto from 'crypto';
import qs from 'querystring';

import { ConsentCookie } from './typings/ConsentCookie';
import { configureCasaApp } from './casa';

const port = 3000;

const app = express();
app.use((req: Request, res: Response, next: NextFunction) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  next();
});
app.disable('x-powered-by');
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.gtmNonce = crypto.randomBytes(16).toString('base64');
  console.log('app set nonce: ', res.locals.gtmNonce)
  next();
});
app.set('trust proxy', 1);
app.set('view engine', 'njk');
app.use(helmet.noSniff());

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(cookieParser('secret'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets/js', express.static(path.resolve(__dirname, '../app/assets/javascript')));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.googleTagManagerId = 'GTM-WP6V2WX';

  const { ga, preferenceSet, bannerActioned } = req.cookies['consentCookie'] || {};

  const consentCookie: ConsentCookie = {
    ga,
    preferenceSet,
    bannerActioned,
  };

  res.locals.consentCookie = consentCookie;
  res.locals.cookieBackLink = qs.escape(req.originalUrl);
  next();
});

app.post('/cookies', (req: Request, res: Response) => {
  // console.log('in cookies endpoint');
  // console.log('req.body: ', req.body);
  //const redirectHiddenFormField = req.body && req.body.backLinkHref;

  const redirect = req.body.redirect;

  res.redirect(url.parse(qs.unescape(redirect)).path as string);
});

const subApp = express();
app.use(subApp);
configureCasaApp(subApp);

app.listen(port, () => {
  console.log('started on port ', port);
});
