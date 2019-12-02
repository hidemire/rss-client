import * as fs from "fs";
import { inject, injectable } from "inversify";

import MainView from "../views";

@injectable()
export default class RSSController {
  private mainView: MainView;
  private file: any;
  private XMLFIle: Buffer;

  constructor(@inject("MainView") mainView: MainView) {
    this.mainView = mainView;
  }

  public setup(): void {
    this.mainView.on("onFileSelect", (file) => {
      this.file = file;
      this.XMLFIle = fs.readFileSync(file.path);
    });

    this.mainView.on("onGetAllNews", () => {
      const news = this.getAllNews();
      this.mainView.renderNews(news);
    });

    this.mainView.on("onUpdateNews", (news: any) => {
      this.updateNews(news);
    });
  }

  private getAllNews() {
    ///
  }

  private addNews(/*item*/) {
    ///
  }

  private updateNews(news: any) {
    ///
  }

  private writeTiFile() {
    ///
  }
}
