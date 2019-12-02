// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

import "reflect-metadata";

import RSSController from "./controllers/RSSController";
import IocContainer from "./ioc/inversify.config";
import MainView from "./views";

const mainView: MainView = IocContainer.resolve(MainView);
mainView.setup();
IocContainer.bind("MainView").toConstantValue(mainView);

const rssController: RSSController = IocContainer.resolve(RSSController);
rssController.setup();
