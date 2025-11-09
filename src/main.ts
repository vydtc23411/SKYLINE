import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

const routerConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};

bootstrapApplication(App, mergeApplicationConfig(appConfig, routerConfig))
  .catch(err => console.error(err));

